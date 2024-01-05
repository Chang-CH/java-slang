import Thread from '#jvm/components/thread/thread';

import { asDouble, asFloat, getArgs } from '#utils/index';
import { ReferenceClassData } from '#types/class/ClassData';
import { Method } from '#types/class/Method';
import type { JvmObject } from '#types/reference/Object';
import { ArrayPrimitiveType } from '#types/reference/Array';
import { JavaType } from '#types/reference/Object';
import type { JvmArray } from '#types/reference/Array';
import {
  ConstantClass,
  ConstantFieldref,
  ConstantInterfaceMethodref,
  ConstantInvokeDynamic,
  ConstantMethodref,
} from '#types/class/Constants';
import { NativeStackFrame, JavaStackFrame } from '../stackframe';
import {
  checkSuccess,
  checkError,
  Result,
  ImmediateResult,
} from '#types/Result';

export function runGetstatic(thread: Thread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);

  const constantField = thread
    .getClass()
    .getConstant(indexbyte) as ConstantFieldref;
  const fieldRes = constantField.resolve();

  if (!checkSuccess(fieldRes)) {
    if (checkError(fieldRes)) {
      thread.throwNewException(fieldRes.exceptionCls, fieldRes.msg);
      return;
    }
    return;
  }
  const field = fieldRes.result;

  const accessCheck = field.checkAccess(thread, true, false);
  if (checkError(accessCheck)) {
    thread.throwNewException(accessCheck.exceptionCls, accessCheck.msg);
    return;
  }

  const fieldClass = field.getClass();
  const initRes = fieldClass.initialize(thread);
  if (!checkSuccess(initRes)) {
    if (checkError(initRes)) {
      thread.throwNewException(initRes.exceptionCls, initRes.msg);
      return;
    }
    return;
  }

  if (field.getFieldDesc() === 'J' || field.getFieldDesc() === 'D') {
    thread.pushStack64(field.getValue());
  } else {
    thread.pushStack(field.getValue());
  }
  thread.offsetPc(3);
}

export function runPutstatic(thread: Thread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);

  const constantField = thread
    .getClass()
    .getConstant(indexbyte) as ConstantFieldref;
  const fieldRes = constantField.resolve();

  if (!checkSuccess(fieldRes)) {
    if (checkError(fieldRes)) {
      thread.throwNewException(fieldRes.exceptionCls, fieldRes.msg);
      return;
    }
    return;
  }
  const field = fieldRes.result;

  const accessCheck = field.checkAccess(thread, true, true);
  if (checkError(accessCheck)) {
    thread.throwNewException(accessCheck.exceptionCls, accessCheck.msg);
    return;
  }

  const fieldClass = field.getClass();
  const initRes = fieldClass.initialize(thread);
  if (!checkSuccess(initRes)) {
    if (checkError(initRes)) {
      thread.throwNewException(initRes.exceptionCls, initRes.msg);
      return;
    }
    return;
  }

  const desc = field.getFieldDesc();
  thread.offsetPc(3);
  switch (desc) {
    case JavaType.long:
      field.putValue(thread.popStack64());
      return;
    case JavaType.double:
      field.putValue(asDouble(thread.popStack64()));
      return;
    case JavaType.float:
      field.putValue(asFloat(thread.popStack()));
      return;
    case JavaType.boolean:
      field.putValue(thread.popStack() & 1);
      return;
    case JavaType.int:
    default:
      field.putValue(thread.popStack());
      return;
  }
}

export function runGetfield(thread: Thread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);

  const constantField = thread
    .getClass()
    .getConstant(indexbyte) as ConstantFieldref;
  const fieldRes = constantField.resolve();

  if (!checkSuccess(fieldRes)) {
    if (checkError(fieldRes)) {
      thread.throwNewException(fieldRes.exceptionCls, fieldRes.msg);
      return;
    }
    return;
  }
  const field = fieldRes.result;

  const accessCheck = field.checkAccess(thread, false, false);
  if (checkError(accessCheck)) {
    thread.throwNewException(accessCheck.exceptionCls, accessCheck.msg);
    return;
  }

  const objRef = thread.popStack() as JvmObject;
  if (objRef === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }

  // FIXME: Store instance field data in the classref instead.
  // If fieldRef is Parent.X, and object is Child, Parent.X is set not Child.X
  const value = objRef.getField(field);
  if (field.getFieldDesc() === 'J' || field.getFieldDesc() === 'D') {
    thread.pushStack64(value);
  } else {
    thread.pushStack(value);
  }
  thread.offsetPc(3);
}

export function runPutfield(thread: Thread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  const constantField = thread
    .getClass()
    .getConstant(indexbyte) as ConstantFieldref;
  const fieldRes = constantField.resolve();

  if (!checkSuccess(fieldRes)) {
    if (checkError(fieldRes)) {
      thread.throwNewException(fieldRes.exceptionCls, fieldRes.msg);
      return;
    }
    return;
  }
  const field = fieldRes.result;

  const accessCheck = field.checkAccess(thread, false, false);
  if (checkError(accessCheck)) {
    thread.throwNewException(accessCheck.exceptionCls, accessCheck.msg);
    return;
  }

  let value;
  // FIXME: in theory it is legal to have 2 same field name, different type
  if (field.getFieldDesc() === 'J' || field.getFieldDesc() === 'D') {
    value = thread.popStack64();
  } else {
    value = thread.popStack();
  }

  const objRef = thread.popStack() as JvmObject;
  if (objRef === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }
  objRef.putField(field, value);
  thread.offsetPc(3);
}

function invokeInit(
  thread: Thread,
  constant: ConstantMethodref | ConstantInterfaceMethodref
): Result<{ methodRef: Method; args: any[]; polyMethod?: Method }> {
  const methodRes = constant.resolve(thread);
  if (!checkSuccess(methodRes)) {
    return methodRes;
  }
  const methodRef = methodRes.result;

  const classRef = methodRef.getClass();
  const initRes = classRef.initialize(thread);
  if (!checkSuccess(initRes)) {
    return initRes;
  }

  if (methodRef.checkSignaturePolymorphic()) {
    const { appendix, memberName, originalDescriptor } =
      constant.getPolymorphic();

    let target: Method;
    let args: any[] = [];
    const name = methodRef.getName();
    let mh, mn;
    switch (name) {
      case 'invokeBasic':
        target = methodRef;
        args = getArgs(thread, originalDescriptor, target.checkNative());
        mh = thread.popStack() as JvmObject;
        if (mh === null) {
          return { exceptionCls: 'java/lang/NullPointerException', msg: '' };
        }
        args = [mh, ...args];
        break;
      case 'invoke':
      case 'invokeExact':
        if (!memberName) {
          return { exceptionCls: 'java/lang/NullPointerException', msg: '' };
        }
        target = memberName.getNativeField('vmtarget') as Method;
        args = getArgs(thread, originalDescriptor, target.checkNative());
        if (appendix !== null) {
          args.push(appendix);
        }
        mh = thread.popStack() as JvmObject;
        if (mh === null) {
          return { exceptionCls: 'java/lang/NullPointerException', msg: '' };
        }
        args = [mh, ...args];
        break;
      case 'linkToVirtual':
      case 'linkToInterface':
      case 'linkToSpecial':
      case 'linkToStatic':
        mn = thread.popStack() as JvmObject;
        target = mn.getNativeField('vmtarget') as Method;
        thread.pushStack(mn);
        args = getArgs(thread, originalDescriptor, target.checkNative());
        args.pop();
        if (mn === null) {
          return { exceptionCls: 'java/lang/NullPointerException', msg: '' };
        }
        break;
      default:
        return { exceptionCls: 'java/lang/LinkageError', msg: '' };
    }

    return {
      result: { methodRef: target, args, polyMethod: methodRef },
    };
  } else {
    const args = methodRef.getArgs(thread);
    return { result: { methodRef, args } };
  }
}

// looks up method for invokevirtual/invokeinterface.
// checks interface for invokeinterface, otherwise checks override
function lookupMethod(
  thread: Thread,
  methodRef: Method,
  checkInterface: boolean,
  checkCastTo?: ReferenceClassData
): ImmediateResult<{ toInvoke: Method; objRef: JvmObject }> {
  const objRef = thread.popStack() as JvmObject;
  if (objRef === null) {
    return { exceptionCls: 'java/lang/NullPointerException', msg: '' };
  }

  if (checkCastTo && !objRef.getClass().checkCast(checkCastTo)) {
    return { exceptionCls: 'java/lang/IncompatibleClassChangeError', msg: '' };
  }

  const runtimeClassRef = objRef.getClass();
  // method lookup
  const lookupResult = runtimeClassRef.lookupMethod(
    methodRef.getName() + methodRef.getDescriptor(),
    methodRef,
    !checkInterface,
    checkInterface
  );
  if (checkError(lookupResult)) {
    return lookupResult;
  }
  const toInvoke = lookupResult.result;
  if (toInvoke.checkAbstract()) {
    return { exceptionCls: 'java/lang/NoSuchMethodError', msg: '' };
  }

  return { result: { toInvoke, objRef } };
}

function invokePoly(
  thread: Thread,
  polyMethod: Method,
  vmtarget: Method,
  args: any[],
  returnOffset: number
): void {
  let toInvoke = vmtarget;
  if (polyMethod.getName() === 'invokeBasic') {
    const mh = args[0] as JvmObject;
    const lambdaForm = mh._getField(
      'form',
      'Ljava/lang/invoke/LambdaForm;',
      'java/lang/invoke/MethodHandle'
    );
    const memberName = lambdaForm._getField(
      'vmentry',
      'Ljava/lang/invoke/MemberName;',
      'java/lang/invoke/LambdaForm'
    );
    toInvoke = memberName.getNativeField('vmtarget') as Method;
  }

  thread.invokeStackFrame(
    toInvoke.checkNative()
      ? new NativeStackFrame(
          toInvoke.getClass(),
          toInvoke,
          0,
          args,
          returnOffset,
          thread.getJVM().getJNI()
        )
      : new JavaStackFrame(toInvoke.getClass(), toInvoke, 0, args, returnOffset)
  );
}

function invokeVirtual(
  thread: Thread,
  constant: ConstantMethodref | ConstantInterfaceMethodref,
  returnOffset: number
): void {
  const resolutionRes = invokeInit(thread, constant);
  if (!checkSuccess(resolutionRes)) {
    if (checkError(resolutionRes)) {
      thread.throwNewException(resolutionRes.exceptionCls, resolutionRes.msg);
      return;
    }
    return;
  }
  const { methodRef, args, polyMethod } = resolutionRes.result;

  if (polyMethod) {
    invokePoly(thread, polyMethod, methodRef, args, returnOffset);
    return;
  }

  // method lookup
  const toInvokeRes = lookupMethod(thread, methodRef, false);
  if (checkError(toInvokeRes)) {
    thread.throwNewException(toInvokeRes.exceptionCls, toInvokeRes.msg);
    return;
  }
  const { toInvoke, objRef } = toInvokeRes.result;

  if (toInvoke.checkNative()) {
    thread.invokeStackFrame(
      new NativeStackFrame(
        toInvoke.getClass(),
        toInvoke,
        0,
        [objRef, ...args],
        returnOffset,
        thread.getJVM().getJNI()
      )
    );
  } else {
    thread.invokeStackFrame(
      new JavaStackFrame(
        toInvoke.getClass(),
        toInvoke,
        0,
        [objRef, ...args],
        returnOffset
      )
    );
  }
}

export function runInvokevirtual(thread: Thread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  const constant = thread
    .getClass()
    .getConstant(indexbyte) as ConstantMethodref; // TODO: handle method handle etc.

  invokeVirtual(thread, constant, 3);
}

export function runInvokespecial(thread: Thread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  const constant = thread.getClass().getConstant(indexbyte) as
    | ConstantMethodref
    | ConstantInterfaceMethodref;
  const resolutionRes = invokeInit(thread, constant);
  if (!checkSuccess(resolutionRes)) {
    if (checkError(resolutionRes)) {
      thread.throwNewException(resolutionRes.exceptionCls, resolutionRes.msg);
      return;
    }
    return;
  }
  const { methodRef, args } = resolutionRes.result;

  const objRef = thread.popStack() as JvmObject;
  if (objRef === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }

  if (methodRef.checkAbstract()) {
    thread.throwNewException('java/lang/AbstractMethodError', '');
    return;
  }

  if (methodRef.checkNative()) {
    thread.invokeStackFrame(
      new NativeStackFrame(
        methodRef.getClass(),
        methodRef,
        0,
        [objRef, ...args],
        3,
        thread.getJVM().getJNI()
      )
    );
  } else {
    thread.invokeStackFrame(
      new JavaStackFrame(
        methodRef.getClass(),
        methodRef,
        0,
        [objRef, ...args],
        3
      )
    );
  }
}

export function runInvokestatic(thread: Thread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  const constant = thread.getClass().getConstant(indexbyte) as
    | ConstantMethodref
    | ConstantInterfaceMethodref;

  const resolutionRes = invokeInit(thread, constant);
  if (!checkSuccess(resolutionRes)) {
    if (checkError(resolutionRes)) {
      thread.throwNewException(resolutionRes.exceptionCls, resolutionRes.msg);
      return;
    }
    return;
  }
  const { methodRef, args } = resolutionRes.result;

  if (!methodRef.checkStatic()) {
    thread.throwNewException('java/lang/IncompatibleClassChangeError', '');
    return;
  }

  if (methodRef.checkNative()) {
    thread.invokeStackFrame(
      new NativeStackFrame(
        methodRef.getClass(),
        methodRef,
        0,
        args,
        3,
        thread.getJVM().getJNI()
      )
    );
  } else {
    thread.invokeStackFrame(
      new JavaStackFrame(methodRef.getClass(), methodRef, 0, args, 3)
    );
  }
}

export function runInvokeinterface(thread: Thread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  // Not actually useful
  const count = thread.getCode().getUint8(thread.getPC() + 3);
  const zero = thread.getCode().getUint8(thread.getPC() + 4);

  const constant = thread
    .getClass()
    .getConstant(indexbyte) as ConstantInterfaceMethodref;
  const resolutionRes = invokeInit(thread, constant);
  if (!checkSuccess(resolutionRes)) {
    if (checkError(resolutionRes)) {
      thread.throwNewException(resolutionRes.exceptionCls, resolutionRes.msg);
      return;
    }
    return;
  }
  const { methodRef, args } = resolutionRes.result;

  const toInvokeRes = lookupMethod(thread, methodRef, true);
  if (checkError(toInvokeRes)) {
    thread.throwNewException(toInvokeRes.exceptionCls, toInvokeRes.msg);
    return;
  }
  const { toInvoke, objRef } = toInvokeRes.result;

  if (toInvoke.checkNative()) {
    const methodCls = toInvoke.getClass();
    thread.invokeStackFrame(
      new NativeStackFrame(
        toInvoke.getClass(),
        toInvoke,
        0,
        [objRef, ...args],
        5,
        thread.getJVM().getJNI()
      )
    );
  } else {
    thread.invokeStackFrame(
      new JavaStackFrame(toInvoke.getClass(), toInvoke, 0, [objRef, ...args], 5)
    );
  }
}

export function runInvokedynamic(thread: Thread): void {
  const index = thread.getCode().getUint16(thread.getPC() + 1);
  const zero1 = thread.getCode().getUint8(thread.getPC() + 3);
  const zero2 = thread.getCode().getUint8(thread.getPC() + 4);

  const invoker = thread.getClass();
  const callsiteConstant = invoker.getConstant(index) as ConstantInvokeDynamic;

  // // #region Temporary lambda creation code
  const tempRes = callsiteConstant.resolve(thread);
  if (!checkSuccess(tempRes)) {
    if (checkError(tempRes)) {
      thread.throwNewException(tempRes.exceptionCls, tempRes.msg);
      return;
    }
    return;
  }
  console.log('INDY RES DONE');
  // const lambdaObj = tempRes.result;
  // thread.pushStack(lambdaObj);
  console.warn('INDY not implemented');
  thread.offsetPc(5);
  return;
  // // #endregion

  // const cssRes = callsiteConstant.resolve(thread);
  // if (!checkSuccess(cssRes)) {
  //   if (checkError(cssRes)) {
  //     const err = cssRes.getError();
  //     thread.throwNewException(err.exceptionCls, err.msg);
  //     return;
  //   }
  //   return;
  // }

  // const bootstrapIdx = callsiteConstant.bootstrapMethodAttrIndex;
  // const bootstrapMethod = thread.getClass().getBootstrapMethod(bootstrapIdx);

  /*
   * bootstrap method is the first method to call when invokedynamic is first run
   * memoized after first run. returns a callsite, memoize for future uses.
   * for lambdas: is java/lang/invoke/LambdaMetafactory.metafactory(...)
   * First 3 params for all bootstrap methods:
   * java/lang/invoke/MethodHandles$Lookup lookupContext, java/lang/String methodName, java/lang/invoke/MethodType dynamic method sig of this call site
   * Depending on the bootstrap method might have 3 more params:
   * 1. MethodType: erased method sig
   * 2. MethodHandle: ptr to actual method
   * 3. MethodType: non erased method sig
   * Bootstrap method dynamically creates the inner class/generates the function object, returns a callsite object.
   * lambda callsites do not change after first run, no conditions
   */

  // FIXME: method handle not implemented
  //   const methodhandle = invoker.resolveMethodHandleRef(
  //     thread,
  //     invoker.getConstant(
  //       bootstrapMethod.bootstrapMethodRef
  //     ) as ConstantMethodHandleInfo
  //   );
  //   if (methodhandle.error || !methodhandle.result) {
  //     thread.throwNewException(methodhandle.error, '');
  //   }
  //   const methodDesc = methodhandle.result;

  //   const iRes = invoker.getLoader().getClassRef('java/lang/invoke/MethodHandle');
  //   if (iRes.error || !iRes.result) {
  //     thread.throwNewException(
  //       iRes.error ?? 'java/lang/ClassNotFoundException',
  //       ''
  //     );
  //     return;
  //   }

  //   // TODO: varargs
  //   const name = new ConstantUtf8(invoker, 'invoke');
  //   const desc = new ConstantUtf8(
  //     invoker,
  //     `(Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;${methodDesc?.slice(
  //       1
  //     )})`
  //   );
  //   const nt = new ConstantNameAndType(invoker, name, desc);
  //   const clsName = new ConstantUtf8(invoker, 'java/lang/invoke/MethodHandle');
  //   const constantCls = new ConstantClass(invoker, clsName);
  //   const method = new ConstantMethodref(invoker, constantCls, nt);

  //   invokeVirtual(thread, method, () => thread.offsetPc(5));
}

export function runNew(thread: Thread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  const invoker = thread.getClass();
  const res = (invoker.getConstant(indexbyte) as ConstantClass).resolve();
  if (!checkSuccess(res)) {
    if (checkError(res)) {
      thread.throwNewException(res.exceptionCls, res.msg);
      return;
    }
    return;
  }

  const objCls = res.result;
  if (objCls.checkAbstract() || objCls.checkInterface()) {
    thread.throwNewException('java/lang/InstantiationError', '');
    return;
  }

  // Load + initialize if needed
  const initRes = objCls.initialize(thread);
  if (!checkSuccess(initRes)) {
    if (checkError(initRes)) {
      thread.throwNewException(initRes.exceptionCls, initRes.msg);
      return;
    }
    return;
  }

  thread.offsetPc(3);
  thread.pushStack(objCls.instantiate());
}

export function runNewarray(thread: Thread): void {
  const atype = thread.getCode().getUint8(thread.getPC() + 1); // TODO: check atype valid
  thread.offsetPc(2);

  const count = thread.popStack();
  if (count < 0) {
    thread.throwNewException('java/lang/NegativeArraySizeException', '');
    return;
  }

  let className = '';
  switch (atype) {
    case ArrayPrimitiveType.boolean:
      className = '[' + JavaType.boolean;
      break;
    case ArrayPrimitiveType.char:
      className = '[' + JavaType.char;
      break;
    case ArrayPrimitiveType.float:
      className = '[' + JavaType.float;
      break;
    case ArrayPrimitiveType.double:
      className = '[' + JavaType.double;
      break;
    case ArrayPrimitiveType.byte:
      className = '[' + JavaType.byte;
      break;
    case ArrayPrimitiveType.short:
      className = '[' + JavaType.short;
      break;
    case ArrayPrimitiveType.int:
      className = '[' + JavaType.int;
      break;
    case ArrayPrimitiveType.long:
      className = '[' + JavaType.long;
      break;
    default:
      throw new Error('Invalid atype, reference types should use anewarray');
  }
  const classResolutionResult = thread
    .getClass()
    .getLoader()
    .getClassRef(className);
  if (checkError(classResolutionResult)) {
    throw new Error('Failed to load primitive array class');
  }

  const arrayCls = classResolutionResult.result;
  const arrayref = arrayCls.instantiate() as unknown as JvmArray;
  arrayref.initArray(count);
  thread.pushStack(arrayref);
}

export function runAnewarray(thread: Thread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  const invoker = thread.getClass();
  const count = thread.popStack();
  thread.offsetPc(3);
  const onDefer = () => {
    thread.pushStack(count);
    thread.offsetPc(-3);
  };

  if (count < 0) {
    thread.throwNewException('java/lang/NegativeArraySizeException', '');
    return;
  }

  const res = (invoker.getConstant(indexbyte) as ConstantClass).resolve();
  if (checkError(res)) {
    thread.throwNewException(res.exceptionCls, res.msg);
    return;
  }
  const objCls = res.result;
  // const initRes = objCls.initialize(thread, onDefer);
  // if (!checkSuccess(initRes)) {
  //   if (checkError(initRes)) {
  //     const err = initRes.getError();
  //     thread.throwNewException(err.exceptionCls, err.msg);
  //     return;
  //   }
  //   return;
  // }

  const arrayClassRes = invoker
    .getLoader()
    .getClassRef('[L' + objCls.getClassname() + ';');
  if (checkError(arrayClassRes)) {
    throw new Error('Failed to load array class');
  }
  const arrayCls = arrayClassRes.result;
  // const aInitRes = arrayCls.initialize(thread, onDefer);
  // if (!checkSuccess(aInitRes)) {
  //   if (checkError(aInitRes)) {
  //     const err = aInitRes.getError();
  //     thread.throwNewException(err.exceptionCls, err.msg);
  //     return;
  //   }
  //   return;
  // }

  const arrayref = arrayCls.instantiate() as unknown as JvmArray;
  arrayref.initArray(count);
  thread.pushStack(arrayref);
}

export function runArraylength(thread: Thread): void {
  const arrayref = thread.popStack() as JvmArray;
  if (arrayref === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }
  thread.offsetPc(1);
  thread.pushStack(arrayref.len());
}

export function runAthrow(thread: Thread): void {
  const exception = thread.popStack();

  if (exception === null) {
    thread.pushStack(exception);
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }

  console.warn('ATHROW: structured locking w/ synchronized not implemented');

  thread.offsetPc(1);
  thread.throwException(exception);
}

function _checkCast(
  thread: Thread,
  indexbyte: number,
  isCC: boolean = true
): void {
  const objectref = thread.popStack() as JvmObject;

  if (objectref === null) {
    isCC ? thread.pushStack(null) : thread.pushStack(0);
    return;
  }

  const clsConstant = thread.getClass().getConstant(indexbyte);
  const resolutionResult = clsConstant.resolve();
  if (!checkSuccess(resolutionResult)) {
    if (checkError(resolutionResult)) {
      thread.throwNewException(
        resolutionResult.exceptionCls,
        resolutionResult.msg
      );
      return;
    }
    return;
  }

  // S is the class of the object referred to by objectref and T is the resolved class
  const objClsS = objectref.getClass();
  const targetClsT = resolutionResult.result;

  let value = 0;
  if (objClsS.checkCast(targetClsT)) {
    value = 1;
  }
  if (!isCC) {
    thread.pushStack(value);
  } else {
    value === 1
      ? thread.pushStack(objectref)
      : thread.throwNewException('java/lang/ClassCastException', '');
  }
  return;
}

export function runCheckcast(thread: Thread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  thread.offsetPc(3);
  _checkCast(thread, indexbyte, true);
}

export function runInstanceof(thread: Thread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  thread.offsetPc(3);
  _checkCast(thread, indexbyte, false);
}

export function runMonitorenter(thread: Thread): void {
  const obj = thread.popStack() as JvmObject | null;
  if (obj === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }

  obj.getMonitor().enter(thread, () => thread.offsetPc(1));
}

export function runMonitorexit(thread: Thread): void {
  const obj = thread.popStack() as JvmObject | null;
  if (obj === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }

  obj.getMonitor().exit(thread, () => thread.offsetPc(1));
}
