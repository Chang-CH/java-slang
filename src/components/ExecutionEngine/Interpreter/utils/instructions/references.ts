import Thread from '#jvm/components/Thread/Thread';

import { parseMethodDescriptor, asDouble, asFloat } from '..';
import {
  ConstantInvokeDynamicInfo,
  ConstantMethodHandleInfo,
} from '#jvm/external/ClassFile/types/constants';
import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { ClassRef } from '#types/class/ClassRef';
import { MethodRef } from '#types/MethodRef';
import { JvmObject } from '#types/reference/Object';
import { JavaType, ArrayPrimitiveType } from '#types/dataTypes';
import { JvmArray } from '#types/reference/Array';
import {
  ConstantClass,
  ConstantFieldref,
  ConstantInterfaceMethodref,
  ConstantInvokeDynamic,
  ConstantMethodref,
  ConstantNameAndType,
  ConstantUtf8,
} from '#types/constants';

export function runGetstatic(thread: Thread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);

  const constantField = thread
    .getClass()
    .getConstant(indexbyte) as ConstantFieldref;
  const fieldRes = constantField.resolve();

  if (!fieldRes.checkSuccess()) {
    if (fieldRes.checkError()) {
      const err = fieldRes.getError();
      thread.throwNewException(err.className, err.msg);
      return;
    }
    return;
  }

  const accessCheck = constantField.checkAccess(thread, true, false);
  if (accessCheck.checkError()) {
    const err = accessCheck.getError();
    thread.throwNewException(err.className, err.msg);
    return;
  }

  const field = fieldRes.getResult();
  const fieldClass = field.getClass();
  const initRes = fieldClass.initialize(thread);
  if (!initRes.checkSuccess()) {
    if (initRes.checkError()) {
      const err = initRes.getError();
      thread.throwNewException(err.className, err.msg);
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

  if (!fieldRes.checkSuccess()) {
    if (fieldRes.checkError()) {
      const err = fieldRes.getError();
      thread.throwNewException(err.className, err.msg);
      return;
    }
    return;
  }

  const accessCheck = constantField.checkAccess(thread, true, true);
  if (accessCheck.checkError()) {
    const err = accessCheck.getError();
    thread.throwNewException(err.className, err.msg);
    return;
  }

  const field = fieldRes.getResult();
  const fieldClass = field.getClass();
  const initRes = fieldClass.initialize(thread);
  if (!initRes.checkSuccess()) {
    if (initRes.checkError()) {
      const err = initRes.getError();
      thread.throwNewException(err.className, err.msg);
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

  if (!fieldRes.checkSuccess()) {
    if (fieldRes.checkError()) {
      const err = fieldRes.getError();
      thread.throwNewException(err.className, err.msg);
      return;
    }
    // TODO: rollback
    return;
  }

  const accessCheck = constantField.checkAccess(thread, false, false);
  if (accessCheck.checkError()) {
    const err = accessCheck.getError();
    thread.throwNewException(err.className, err.msg);
    return;
  }

  const field = fieldRes.getResult();

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

  if (!fieldRes.checkSuccess()) {
    if (fieldRes.checkError()) {
      const err = fieldRes.getError();
      thread.throwNewException(err.className, err.msg);
      return;
    }
    return;
  }

  const accessCheck = constantField.checkAccess(thread, false, false);
  if (accessCheck.checkError()) {
    const err = accessCheck.getError();
    thread.throwNewException(err.className, err.msg);
    return;
  }

  const field = fieldRes.getResult();

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

function invokeVirtual(
  thread: Thread,
  constant: ConstantMethodref,
  onFinish?: () => void
): void {
  const methodRes = constant.resolve();

  if (!methodRes.checkSuccess()) {
    if (methodRes.checkError()) {
      const err = methodRes.getError();
      thread.throwNewException(err.className, err.msg);
      return;
    }
    return;
  }
  const methodRef = methodRes.getResult();

  const classRef = methodRef.getClass();
  const initRes = classRef.initialize(thread);
  if (!initRes.checkSuccess()) {
    if (initRes.checkError()) {
      const err = initRes.getError();
      thread.throwNewException(err.className, err.msg);
      return;
    }
    return;
  }

  // Get arguments
  const methodDesc = parseMethodDescriptor(methodRef.getMethodDesc());
  const args = [];
  for (let i = methodDesc.args.length - 1; i >= 0; i--) {
    switch (methodDesc.args[i].type) {
      case 'V':
        break; // should not happen
      case 'B':
      case 'C':
      case 'I':
      case 'S':
      case 'Z':
        args[i] = thread.popStack();
        break;
      case 'D':
        args[i] = asDouble(thread.popStack64());
        break;
      case 'F':
        args[i] = asFloat(thread.popStack());
        break;
      case 'J':
        args[i] = thread.popStack64();
        break;
      case '[':
      default: // references + arrays
        args[i] = thread.popStack();
    }
  }
  const objRef = thread.popStack() as JvmObject;
  if (objRef === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }
  const runtimeClassRef = objRef.getClass();

  // method lookup
  const lookupResult = runtimeClassRef.lookupMethod(
    methodRef.getName() + methodRef.getMethodDesc(),
    methodRef,
    true
  );
  if (lookupResult.checkError()) {
    const err = lookupResult.getError();
    thread.throwNewException(err.className, err.msg);
    return;
  }
  const toInvoke = lookupResult.getResult();
  if (toInvoke.checkAbstract()) {
    thread.throwNewException('java/lang/NoSuchMethodError', '');
    return;
  }
  onFinish && onFinish();
  thread.invokeSf(toInvoke.getClass(), toInvoke, 0, [objRef, ...args]);
  return;
}

export function runInvokevirtual(thread: Thread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  const constant = thread
    .getClass()
    .getConstant(indexbyte) as ConstantMethodref;
  invokeVirtual(thread, constant, () => thread.offsetPc(3));
}

export function runInvokespecial(thread: Thread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  const constant = thread.getClass().getConstant(indexbyte) as
    | ConstantMethodref
    | ConstantInterfaceMethodref;

  const res = constant.resolve();
  if (!res.checkSuccess()) {
    if (res.checkError()) {
      const err = res.getError();
      thread.throwNewException(err.className, err.msg);
      return;
    }
    return;
  }

  const methodRef = res.getResult();

  // If all of the following are true, let C be the direct superclass of the current class:
  //   The resolved method is not an instance initialization method (§2.9.1).
  //   If the symbolic reference names a class (not an interface), then that class is a superclass of the current class.
  //   The ACC_SUPER flag is set for the class file (§4.1).

  const classRef = methodRef.getClass();
  const initRes = classRef.initialize(thread);
  if (!initRes.checkSuccess()) {
    if (initRes.checkError()) {
      const err = initRes.getError();
      thread.throwNewException(err.className, err.msg);
      return;
    }
    return;
  }

  // Get arguments
  const methodDesc = parseMethodDescriptor(methodRef.getMethodDesc());
  const args = [];
  for (let i = methodDesc.args.length - 1; i >= 0; i--) {
    switch (methodDesc.args[i].type) {
      case 'V':
        break; // should not happen
      case 'B':
      case 'C':
      case 'I':
      case 'S':
      case 'Z':
        args[i] = thread.popStack();
        break;
      case 'D':
        args[i] = asDouble(thread.popStack64());
        break;
      case 'F':
        args[i] = asFloat(thread.popStack());
        break;
      case 'J':
        args[i] = thread.popStack64();
        break;
      case '[':
      default: // references + arrays
        args[i] = thread.popStack();
    }
  }

  const objRef = thread.popStack() as JvmObject;
  if (objRef === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }

  // method lookup
  const lookupResult = methodRef
    .getClass()
    .lookupMethod(methodRef.getName() + methodRef.getMethodDesc(), methodRef);
  if (lookupResult.checkError()) {
    const err = lookupResult.getError();
    thread.throwNewException(err.className, err.msg);
    return;
  }
  const toInvoke = lookupResult.getResult();
  if (toInvoke.checkAbstract()) {
    thread.throwNewException('java/lang/NoSuchMethodError', '');
    return;
  }
  thread.offsetPc(3);
  thread.invokeSf(toInvoke.getClass(), toInvoke, 0, [objRef, ...args]);
}

export function runInvokestatic(thread: Thread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  const constant = thread.getClass().getConstant(indexbyte) as
    | ConstantMethodref
    | ConstantInterfaceMethodref;

  const res = constant.resolve();
  if (!res.checkSuccess()) {
    if (res.checkError()) {
      const err = res.getError();
      thread.throwNewException(err.className, err.msg);
      return;
    }
    return;
  }

  const methodRef = res.getResult();

  if (!methodRef.checkStatic()) {
    thread.throwNewException('java/lang/IncompatibleClassChangeError', '');
    return;
  }

  const classRef = methodRef.getClass();
  // init class
  const initRes = classRef.initialize(thread);
  if (!initRes.checkSuccess()) {
    if (initRes.checkError()) {
      const err = initRes.getError();
      thread.throwNewException(err.className, err.msg);
      return;
    }
    return;
  }

  // Get arguments
  const methodDesc = parseMethodDescriptor(methodRef.getMethodDesc());
  const args = [];
  for (let i = methodDesc.args.length - 1; i >= 0; i--) {
    switch (methodDesc.args[i].type) {
      case 'V':
        break; // should not happen
      case 'B':
      case 'C':
      case 'I':
      case 'S':
      case 'Z':
        args[i] = thread.popStack();
        break;
      case 'D':
        args[i] = asDouble(thread.popStack64());
        break;
      case 'F':
        args[i] = asFloat(thread.popStack());
        break;
      case 'J':
        args[i] = thread.popStack64();
        break;
      case '[':
      default: // references + arrays
        args[i] = thread.popStack();
    }
  }

  thread.offsetPc(3);
  thread.invokeSf(classRef, methodRef, 0, args);
}

export function runInvokeinterface(thread: Thread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  // Not actually useful
  const count = thread.getCode().getUint8(thread.getPC() + 3);
  const zero = thread.getCode().getUint8(thread.getPC() + 4);

  let methodRef;
  const constant = thread
    .getClass()
    .getConstant(indexbyte) as ConstantInterfaceMethodref;
  const res = constant.resolve();
  if (!res.checkSuccess()) {
    if (res.checkError()) {
      const err = res.getError();
      thread.throwNewException(err.className, err.msg);
      return;
    }
    return;
  }
  methodRef = res.getResult();

  const classRef = methodRef.getClass();
  const initRes = classRef.initialize(thread);
  if (!initRes.checkSuccess()) {
    if (initRes.checkError()) {
      const err = initRes.getError();
      thread.throwNewException(err.className, err.msg);
      return;
    }
    return;
  }

  // Get arguments
  const methodDesc = parseMethodDescriptor(methodRef.getMethodDesc());
  const args = [];
  for (let i = methodDesc.args.length - 1; i >= 0; i--) {
    switch (methodDesc.args[i].type) {
      case 'V':
        break; // should not happen
      case 'B':
      case 'C':
      case 'I':
      case 'S':
      case 'Z':
        args[i] = thread.popStack();
        break;
      case 'D':
        args[i] = asDouble(thread.popStack64());
        break;
      case 'F':
        args[i] = asFloat(thread.popStack());
        break;
      case 'J':
        args[i] = thread.popStack64();
        break;
      case '[':
      default: // references + arrays
        args[i] = thread.popStack();
    }
  }
  const objRef = thread.popStack() as JvmObject;

  if (objRef === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }
  if (!objRef.getClass().checkCast(classRef)) {
    thread.throwNewException('java/lang/IncompatibleClassChangeError', '');
    return;
  }
  const runtimeClassRef = objRef.getClass();

  // method lookup
  const lookupResult = runtimeClassRef.lookupMethod(
    methodRef.getName() + methodRef.getMethodDesc(),
    methodRef,
    false,
    true
  );
  if (lookupResult.checkError()) {
    const err = lookupResult.getError();
    thread.throwNewException(err.className, err.msg);
    return;
  }
  const toInvoke = lookupResult.getResult();
  if (toInvoke.checkAbstract()) {
    thread.throwNewException('java/lang/NoSuchMethodError', '');
    return;
  }

  thread.offsetPc(5);
  thread.invokeSf(toInvoke.getClass(), toInvoke, 0, [objRef, ...args]);
}

// TODO:
export function runInvokedynamic(thread: Thread): void {
  const index = thread.getCode().getUint16(thread.getPC() + 1);
  const zero1 = thread.getCode().getUint8(thread.getPC() + 3);
  const zero2 = thread.getCode().getUint8(thread.getPC() + 4);

  const invoker = thread.getClass();
  const callsiteConstant = invoker.getConstant(index) as ConstantInvokeDynamic;
  const cssRes = callsiteConstant.resolve(thread);
  if (!cssRes.checkSuccess()) {
    if (cssRes.checkError()) {
      const err = cssRes.getError();
      thread.throwNewException(err.className, err.msg);
      return;
    }
    return;
  }

  throw new Error('Not implemented');
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
  if (!res.checkSuccess()) {
    if (res.checkError()) {
      const err = res.getError();
      thread.throwNewException(err.className, err.msg);
      return;
    }
    return;
  }

  const objCls = res.getResult();
  if (objCls.checkAbstract() || objCls.checkInterface()) {
    thread.throwNewException('java/lang/InstantiationError', '');
    return;
  }

  // Load + initialize if needed
  const initRes = objCls.initialize(thread);
  if (!initRes.checkSuccess()) {
    if (initRes.checkError()) {
      const err = initRes.getError();
      thread.throwNewException(err.className, err.msg);
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
  if (classResolutionResult.checkError()) {
    throw new Error('Failed to load primitive array class');
  }

  const arrayCls = classResolutionResult.getResult();
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
  if (res.checkError()) {
    const err = res.getError();
    thread.throwNewException(err.className, err.msg);
    return;
  }
  const objCls = res.getResult();
  // const initRes = objCls.initialize(thread, onDefer);
  // if (!initRes.checkSuccess()) {
  //   if (initRes.checkError()) {
  //     const err = initRes.getError();
  //     thread.throwNewException(err.className, err.msg);
  //     return;
  //   }
  //   return;
  // }

  const arrayClassRes = invoker
    .getLoader()
    .getClassRef('[L' + objCls.getClassname() + ';');
  if (arrayClassRes.checkError()) {
    throw new Error('Failed to load array class');
  }
  const arrayCls = arrayClassRes.getResult();
  // const aInitRes = arrayCls.initialize(thread, onDefer);
  // if (!aInitRes.checkSuccess()) {
  //   if (aInitRes.checkError()) {
  //     const err = aInitRes.getError();
  //     thread.throwNewException(err.className, err.msg);
  //     return;
  //   }
  //   return;
  // }

  const arrayref = arrayCls.instantiate() as unknown as JvmArray;
  arrayref.initArray(count);
  thread.pushStack(arrayref);
}

export function runArraylength(thread: Thread): void {
  thread.offsetPc(1);
  const arrayref = thread.popStack() as JvmArray;
  thread.pushStack(arrayref.len());
}

export function runAthrow(thread: Thread): void {
  throw new Error('Not implemented');
  thread.offsetPc(1);
  const exception = thread.popStack();
  thread.throwException(exception);
}

function $checkCast(
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
  if (!resolutionResult.checkSuccess()) {
    if (resolutionResult.checkError()) {
      const err = resolutionResult.getError();
      thread.throwNewException(err.className, err.msg);
      return;
    }
    return;
  }

  // S is the class of the object referred to by objectref and T is the resolved class
  const objClsS = objectref.getClass();
  const targetClsT = resolutionResult.getResult();

  // If S is an array type
  if (objClsS.getClassname()[0] === '[') {
    let value = 0;
    // JLS 4.10.3. Subtyping among Array Types
    const targetClsName = targetClsT.getClassname();
    if (
      targetClsName === 'java/lang/Object' ||
      targetClsName === 'java/lang/Cloneable' ||
      targetClsName === 'java/io/Serializable'
    ) {
      value = 1;
    }

    // If T is an array type TC[]
    if (targetClsName[0] === '[') {
      if (targetClsName === objClsS.getClassname()) {
        value = 1;
      } else {
        const loader = thread.getClass().getLoader();
        const TCres = loader.getClassRef(targetClsName.slice(1));
        if (TCres.checkError()) {
          const err = TCres.getError();
          thread.throwNewException(err.className, err.msg);
          return;
        }
        const TC = TCres.getResult();

        const SCres = loader.getClassRef(objClsS.getClassname().slice(1));
        if (SCres.checkError()) {
          const err = SCres.getError();
          thread.throwNewException(err.className, err.msg);
          return;
        }
        const SC = SCres.getResult();

        if (SC.checkCast(TC)) {
          value = 1;
        }
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
  }

  // If S is an ordinary (nonarray) class
  // If S is an interface type, same behaviour since interfaces extend object
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
  $checkCast(thread, indexbyte, true);
}

export function runInstanceof(thread: Thread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  thread.offsetPc(3);
  $checkCast(thread, indexbyte, false);
}

export function runMonitorenter(thread: Thread): void {
  const obj = thread.popStack() as JvmObject | null;
  if (obj === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }

  thread.offsetPc(1);
  console.error('Not implemented');
}

export function runMonitorexit(thread: Thread): void {
  const obj = thread.popStack() as JvmObject | null;
  if (obj === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }

  thread.offsetPc(1);
  console.error('Not implemented');
}
