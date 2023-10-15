import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';

import { JavaReference, JavaArray, JavaType } from '#types/dataTypes';
import { tryInitialize, parseMethodDescriptor, asDouble, asFloat } from '..';
import {
  ConstantFieldrefInfo,
  ConstantNameAndTypeInfo,
  ConstantClassInfo,
  ConstantInterfaceMethodrefInfo,
} from '#jvm/external/ClassFile/types/constants';
import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { ConstantClass } from '#types/ConstantRef';
import { FieldRef } from '#types/FieldRef';
import { ClassRef } from '#types/ClassRef';
import { MethodRef } from '#types/MethodRef';

function getFieldRef(
  invokerClass: ClassRef,
  invokerMethod: MethodRef,
  index: number,
  isStaticAccess: boolean = false,
  isPut: boolean = false
): { error?: string; field?: FieldRef; fieldClass?: ClassRef } {
  const constantField = invokerClass.getConstant(index) as ConstantFieldrefInfo;
  const classResolutionRes = invokerClass.resolveClassRef(
    invokerClass.getConstant(constantField.classIndex)
  );

  if (classResolutionRes.error || !classResolutionRes.classRef) {
    return {
      error: classResolutionRes.error ?? 'java/lang/ClassNotFoundException',
    };
  }
  const fieldClass = classResolutionRes.classRef;

  const nameAndTypeIndex = invokerClass.getConstant(
    constantField.nameAndTypeIndex
  ) as ConstantNameAndTypeInfo;
  const fieldName = invokerClass.getConstant(nameAndTypeIndex.nameIndex).value;
  const fieldType = invokerClass.getConstant(
    nameAndTypeIndex.descriptorIndex
  ).value;

  const fieldRef = fieldClass.getFieldRef(fieldName + fieldType);

  const accessError = checkFieldAccess(
    invokerClass,
    invokerMethod,
    fieldRef?.getClass() ?? fieldClass,
    fieldRef,
    isStaticAccess,
    isPut
  ).error;
  if (accessError) {
    return { error: accessError };
  }
  return { field: fieldRef as FieldRef, fieldClass };
}

function checkFieldAccess(
  invokerClass: ClassRef,
  invokerMethod: MethodRef,
  fieldClass: ClassRef,
  field: FieldRef | null,
  isStaticAccess: boolean = false,
  isPut: boolean = false
): { error?: string } {
  if (field === null) {
    return { error: 'java/lang/NoSuchFieldError' };
  }

  if (isStaticAccess && !field.checkStatic()) {
    return { error: 'java/lang/IncompatibleClassChangeError' };
  }

  if (field.checkPrivate() && invokerClass !== fieldClass) {
    return { error: 'java/lang/IllegalAccessError' };
  }

  if (
    field.checkProtected() &&
    !invokerClass.checkCast(fieldClass) &&
    invokerClass.getPackageName() !== field.getClass().getPackageName()
  ) {
    return { error: 'java/lang/IllegalAccessError' };
  }

  if (
    isPut &&
    field.checkFinal() &&
    (fieldClass !== invokerClass ||
      invokerMethod.getMethodName() !==
        (isStaticAccess ? '<clinit>' : '<init>'))
  ) {
    return { error: 'java/lang/IllegalAccessError' };
  }

  return {};
}

export function runGetstatic(thread: NativeThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC());

  thread.offsetPc(2);

  const {
    error,
    field: fieldRes,
    fieldClass: fieldClassRes,
  } = getFieldRef(thread.getClass(), thread.getMethod(), indexbyte, true);

  if (error) {
    thread.throwNewException(error, '');
    return;
  }
  const field = fieldRes as FieldRef;
  const fieldClass = fieldClassRes as ClassRef;

  tryInitialize(thread, (fieldClass as ClassRef).getClassname());

  if (field.getFieldDesc() === 'J' || field.getFieldDesc() === 'D') {
    thread.pushStack64(field.getValue());
  } else {
    thread.pushStack(field.getValue());
  }
}

export function runPutstatic(thread: NativeThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC());

  thread.offsetPc(2);

  const {
    error,
    field: fieldRes,
    fieldClass: fieldClassRes,
  } = getFieldRef(thread.getClass(), thread.getMethod(), indexbyte, true, true);

  if (error) {
    thread.throwNewException(error, '');
    return;
  }

  const field = fieldRes as FieldRef;
  const fieldClass = fieldClassRes as ClassRef;

  tryInitialize(thread, (fieldClass as ClassRef).getClassname());
  const desc = field.getFieldDesc();
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

export function runGetfield(thread: NativeThread): void {
  // const indexbyte = thread.getCode().getUint16(thread.getPC());
  // thread.offsetPc(2);
  // const invoker = thread.getClassName();
  // const obj = thread.popStack() as JavaReference;
  // const fieldRef = thread
  //   .getClass()
  //   .resolveConstant(thread, indexbyte) as ConstantFieldrefInfo;
  // const className = thread
  //   .getClass()
  //   .resolveConstant(
  //     thread,
  //     thread.getClass().resolveConstant(thread, fieldRef.classIndex).nameIndex
  //   ).value;
  // // Load + initialize if needed
  // tryInitialize(thread, className);
  // const nameAndTypeIndex = thread
  //   .getClass()
  //   .resolveConstant(
  //     thread,
  //     fieldRef.nameAndTypeIndex
  //   ) as ConstantNameAndTypeInfo;
  // const fieldName = thread
  //   .getClass()
  //   .resolveConstant(className, nameAndTypeIndex.nameIndex).value;
  // const fieldType = thread
  //   .getClass()
  //   .resolveConstant(className, nameAndTypeIndex.descriptorIndex).value;
  // if (fieldType === 'J' || fieldType === 'D') {
  //   thread.pushStack64(obj.getField64(fieldName + fieldType));
  // } else {
  //   thread.pushStack(obj.getField(fieldName + fieldType));
  // }
}

export function runPutfield(thread: NativeThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC());

  thread.offsetPc(2);

  const invoker = thread.getClassName();
  const fieldRef = thread
    .getClass()
    .getConstant(indexbyte) as ConstantFieldrefInfo;

  const className = thread
    .getClass()
    .getConstant(
      thread.getClass().getConstant(fieldRef.classIndex).nameIndex
    ).value;

  // Load + initialize if needed
  tryInitialize(thread, className);

  const nameAndTypeIndex = thread
    .getClass()
    .getConstant(fieldRef.nameAndTypeIndex) as ConstantNameAndTypeInfo;
  const fieldName = thread
    .getClass()
    .getConstant(nameAndTypeIndex.nameIndex).value;
  const fieldType = thread
    .getClass()
    .getConstant(nameAndTypeIndex.descriptorIndex).value;

  // FIXME: in theory it is legal to have 2 same field name, different type
  if (fieldType === 'J' || fieldType === 'D') {
    const value = thread.popStack64();
    const obj = thread.popStack() as JavaReference;
    obj.putField64(fieldName + fieldType, value);
  } else {
    const value = thread.popStack();
    const obj = thread.popStack() as JavaReference;
    obj.putField(fieldName + fieldType, value);
  }

  // FIXME: load class if not loaded
}

// function checkMethodAccess(
//   thread: NativeThread,
//   invoker: ClassRef,
//   method: MethodRef,
//   isStaticAccess?: boolean
// ): { err?: string } {
//   if ((isStaticAccess && !method.checkStatic()) || method.checkAbstract()) {
//     return { err: 'java/lang/IncompatibleClassChangeError' };
//   }

//   const methodClass = method.getClass();

//   if (method.checkPrivate() && invoker !== methodClass) {
//     return { err: 'java/lang/IllegalAccessError' };
//   }

//   if (
//     method.checkProtected() &&
//     !invoker.checkCast(methodClass) &&
//     // check package match
//     invoker.getPackageName() !== methodClass.getPackageName()
//   ) {
//     return { err: 'java/lang/IllegalAccessError' };
//   }
//   return {};
// }

export function runInvokevirtual(thread: NativeThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC());
  thread.offsetPc(2);
  let methodRef;
  const constant = thread.getClass().getConstant(indexbyte);
  const res = thread.getClass().resolveMethodRef(thread, constant);
  if (res.error) {
    thread.throwNewException(res.error, '');
    return;
  }
  if (!res.methodRef) {
    // Should not happen
    thread.throwNewException('java/lang/NoSuchMethodError', '');
    return;
  }
  methodRef = res.methodRef;

  const classRef = methodRef.getClass();
  // Initialize class
  tryInitialize(thread, classRef.getClassname());
  // Get arguments
  const methodDesc = parseMethodDescriptor(methodRef.getMethodDesc());
  const args = [];
  for (let i = methodDesc.args.length - 1; i >= 0; i--) {
    switch (methodDesc.args[i]) {
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
  const objRef = thread.popStack() as JavaReference;
  if (objRef === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }
  const runtimeClassRef = objRef.getClass();

  // method lookup
  const lookupResult = runtimeClassRef.lookupMethod(
    methodRef.getMethodName() + methodRef.getMethodDesc(),
    methodRef
  );
  if (lookupResult.error || !lookupResult.methodRef) {
    thread.throwNewException(
      lookupResult.error ?? 'java/lang/AbstractMethodError',
      ''
    );
    return;
  }
  const toInvoke = lookupResult.methodRef;
  if (toInvoke.checkAbstract()) {
    thread.throwNewException('java/lang/NoSuchMethodError', '');
    return;
  }
  thread.pushStackFrame(toInvoke.getClass(), toInvoke, 0, [objRef, ...args]);
}

export function runInvokespecial(thread: NativeThread): void {
  //   const indexbyte = thread.getCode().getUint16(thread.getPC());
  //   thread.offsetPc(2);
  //   const invoker = thread.getClassName();
  //   const res = thread.getClass().resolveReference(thread, indexbyte);
  //   if (res.error || !res.result) {
  //     thread.throwNewException(res.error ?? 'java/lang/NoSuchMethodError', '');
  //     return;
  //   }
  //   const methodRef = res.result as MethodRef;
  //   const className = methodRef.getClass().getClassname();
  //   const methodName = methodRef.getMethodName();
  //   const methodDescriptor = methodRef.getMethodDesc();
  //   // Get arguments
  //   const methodDesc = parseMethodDescriptor(methodDescriptor);
  //   const args = [];
  //   for (let i = methodDesc.args.length - 1; i >= 0; i--) {
  //     if (methodDesc.args[i] === 'J' || methodDesc.args[i] === 'D') {
  //       args[i] = thread.popStack64();
  //       continue;
  //     }
  //     args[i] = thread.popStack();
  //   }
  //   // Load + initialize if needed
  //   tryInitialize(thread, className);
  //   const thisObj = thread.popStack();
  //   const classRef = thread.getClass().getLoader().getClassRef(className)
  //     .result as ClassRef;
  //   thread.pushStackFrame(classRef, methodRef, 0, [thisObj, ...args]);
}

export function runInvokestatic(thread: NativeThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC());
  thread.offsetPc(2);
  let methodRef;
  const constant = thread.getClass().getConstant(indexbyte);
  if (constant.tag === CONSTANT_TAG.Methodref) {
    const res = thread.getClass().resolveMethodRef(thread, constant);
    if (res.error) {
      thread.throwNewException(res.error, '');
      return;
    }
    if (!res.methodRef) {
      // Should not happen
      thread.throwNewException('java/lang/NoSuchMethodError', '');
      return;
    }
    methodRef = res.methodRef;
  } else {
    // interface method ref
    const res = thread.getClass().resolveInterfaceMethodRef(thread, constant);
    if (res.error) {
      thread.throwNewException(res.error, '');
      return;
    }
    if (!res.methodRef) {
      thread.throwNewException('java/lang/NoSuchMethodError', '');
      return;
    }
    methodRef = res.methodRef;
  }

  if (!methodRef.checkStatic()) {
    thread.throwNewException('java/lang/IncompatibleClassChangeError', '');
    return;
  }

  const classRef = methodRef.getClass();
  // Initialize class
  tryInitialize(thread, classRef.getClassname());
  // Get arguments
  const methodDesc = parseMethodDescriptor(methodRef.getMethodDesc());
  const args = [];
  for (let i = methodDesc.args.length - 1; i >= 0; i--) {
    switch (methodDesc.args[i]) {
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
  thread.pushStackFrame(classRef, methodRef, 0, args);
}

export function runInvokeinterface(thread: NativeThread): void {
  // const indexbyte = thread.getCode().getUint16(thread.getPC());
  // thread.offsetPc(2);
  // // Not actually useful
  // // const count = thread.getCode().getUint8(thread.getPC());
  // // thread.offsetPc(1);
  // // const zero = thread.getCode().getUint8(thread.getPC());
  // // thread.offsetPc(1);
  // thread.offsetPc(2);
  // const invoker = thread.getClass();
  // const interfaceMethodRef = invoker.getConstant(
  //   indexbyte
  // ) as ConstantInterfaceMethodrefInfo;
  // const interfaceClass = (
  //   invoker.resolveConstant(
  //     thread,
  //     interfaceMethodRef.classIndex
  //   ) as ConstantClass
  // ).ref;
  // const nameAndTypeIndex = invoker.getConstant(
  //   interfaceMethodRef.nameAndTypeIndex
  // ) as ConstantNameAndTypeInfo;
  // const methodName = invoker.getConstant(nameAndTypeIndex.nameIndex).value;
  // const methodDescriptor = invoker.getConstant(
  //   nameAndTypeIndex.descriptorIndex
  // ).value;
  // // Get arguments
  // const methodDesc = parseMethodDescriptor(methodDescriptor);
  // const args = [];
  // for (let i = methodDesc.args.length - 1; i >= 0; i--) {
  //   if (methodDesc.args[i] === 'J' || methodDesc.args[i] === 'D') {
  //     args[i] = thread.popStack64();
  //     continue;
  //   }
  //   args[i] = thread.popStack();
  // }
  // const thisObj = thread.popStack() as JavaReference | null;
  // if (thisObj === null) {
  //   thread.throwNewException('java/lang/NullPointerException', '');
  //   return;
  // }
  // if (
  //   !interfaceClass.checkInterface() ||
  //   !thisObj.getClass().checkCast(interfaceClass)
  // ) {
  //   thread.throwNewException('java/lang/IncompatibleClassChangeError', '');
  //   return;
  // }
  // // must be dynamically resovled
  // const methodRef = thisObj.getClass().getMethod(methodName + methodDescriptor);
  // if (!methodRef) {
  //   thread.throwNewException('java/lang/NoSuchMethodError', '');
  //   return;
  // }
  // checkMethodAccess(thread, invoker, methodRef);
  // thread.pushStackFrame(thisObj.getClass(), methodRef, 0, [thisObj]);
}

export function runInvokedynamic(thread: NativeThread): void {
  // const indexbyte = thread.getCode().getUint16(thread.getPC());
  // thread.offsetPc(2);
  // const zero1 = thread.getCode().getUint8(thread.getPC());
  // if (zero1 !== 0) {
  //   throw new Error('invokedynamic third byte must be 0');
  // }
  // thread.offsetPc(1);
  // const zero2 = thread.getCode().getUint8(thread.getPC());
  // if (zero2 !== 0) {
  //   throw new Error('invokedynamic fourth bytes must be 0');
  // }
  // thread.offsetPc(1);
  // const invoker = thread.getClassName();
  // const callSiteSpecifier = thread
  //   .getClass()
  //   .resolveConstant(thread, indexbyte);
  // // resolve call site specifier
  // throw new Error('invokedynamic: not implemented');
}

export function runNew(thread: NativeThread): void {
  // const indexbyte = thread.getCode().getUint16(thread.getPC());
  // thread.offsetPc(2);
  // const type = indexbyte;
  // const res = thread.getClass().resolveConstant(thread, type);
  // if (res.error || !res.constant) {
  //   thread.throwNewException(
  //     res.error ?? 'java/lang/ClassNotFoundException',
  //     ''
  //   );
  //   return;
  // }
  // const objCls = (res.constant as ConstantClass).ref;
  // // Load + initialize if needed
  // tryInitialize(thread, objCls.getClassname());
  // thread.pushStack(objCls.instantiate());
}

export function runNewarray(thread: NativeThread): void {
  const atype = thread.getCode().getUint8(thread.getPC()); // TODO: check atype valid
  thread.offsetPc(1);

  const count = thread.popStack();
  const type = atype;
  const arrayref = new JavaArray(count, type);
  thread.pushStack(arrayref);
}

export function runAnewarray(thread: NativeThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC());
  thread.offsetPc(2);
  const invoker = thread.getClassName();
  const count = thread.popStack();

  const className = thread
    .getClass()
    .getConstant(thread.getClass().getConstant(indexbyte).nameIndex).value;
  const arrayref = new JavaArray(count, className);
  thread.pushStack(arrayref);
}

export function runArraylength(thread: NativeThread): void {
  const arrayref = thread.popStack() as JavaArray;
  thread.pushStack(arrayref.len());
}

export function runAthrow(thread: NativeThread): void {
  const exception = thread.popStack();
  thread.throwException(exception);
  // TODO: throw Java error
  // TODO: parse exception handlers
  // throw new Error('runInstruction: Not implemented');
}

export function runCheckcast(thread: NativeThread): void {
  // const indexbyte = thread.getCode().getUint16(thread.getPC());
  // thread.offsetPc(2);
  // if (thread.popStack() === null) {
  //   thread.pushStack(null);
  //   return;
  // }
  // const resolvedType = thread
  //   .getClass()
  //   .resolveConstant(thread, indexbyte) as ConstantClassInfo;
  // const className = thread
  //   .getClass()
  //   .resolveConstant(thread, resolvedType.nameIndex);
  // // recursive checkcast.
  // throw new Error('runInstruction: Not implemented');
}

export function runInstanceof(thread: NativeThread): void {
  // const indexbyte = thread.getCode().getUint16(thread.getPC());
  // thread.offsetPc(2);
  // const ref = thread.popStack() as JavaReference;
  // const res = thread.getClass().resolveConstant(thread, indexbyte);
  // if (ref === null) {
  //   thread.pushStack(0);
  //   return;
  // }
  // if (res.error || !res.constant) {
  //   thread.throwNewException(
  //     res.error ?? 'java/lang/ClassNotFoundException',
  //     ''
  //   );
  //   return;
  // }
  // const cls = res.constant as ConstantClass;
  // if (cls.tag === CONSTANT_TAG.Class) {
  //   const classRef = (cls as ConstantClass).ref;
  //   if (
  //     ref.getClass().getClassname() === classRef.getClassname() ||
  //     ref.getClass().getInterfaces().includes(classRef)
  //   ) {
  //     thread.pushStack(1);
  //   } else {
  //     thread.pushStack(0);
  //   }
  //   return;
  // }
  // throw new Error('runInstruction: Not implemented');
}

export function runMonitorenter(thread: NativeThread): void {
  throw new Error('runInstruction: Not implemented');
}

export function runMonitorexit(thread: NativeThread): void {
  throw new Error('runInstruction: Not implemented');
}
