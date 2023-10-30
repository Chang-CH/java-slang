import JvmThread from '#types/reference/Thread';

import { tryInitialize, parseMethodDescriptor, asDouble, asFloat } from '..';
import {
  ConstantFieldrefInfo,
  ConstantNameAndTypeInfo,
  ConstantInvokeDynamicInfo,
  ConstantMethodHandleInfo,
} from '#jvm/external/ClassFile/types/constants';
import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { ConstantClass, ConstantMethodref } from '#types/ConstantRef';
import { FieldRef } from '#types/FieldRef';
import { ClassRef } from '#types/ClassRef';
import { MethodRef } from '#types/MethodRef';
import { JvmObject } from '#types/reference/Object';
import { JavaType, ArrayPrimitiveType } from '#types/dataTypes';
import { JvmArray } from '#types/reference/Array';

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

  if (
    (isStaticAccess && !field.checkStatic()) ||
    (!isStaticAccess && field.checkStatic())
  ) {
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

export function runGetstatic(thread: JvmThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);

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

  const { shouldDefer } = tryInitialize(
    thread,
    (fieldClass as ClassRef).getClassname()
  );
  if (shouldDefer) {
    return;
  }
  thread.offsetPc(3);

  if (field.getFieldDesc() === 'J' || field.getFieldDesc() === 'D') {
    thread.pushStack64(field.getValue());
  } else {
    thread.pushStack(field.getValue());
  }
}

export function runPutstatic(thread: JvmThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
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

  const { shouldDefer } = tryInitialize(
    thread,
    (fieldClass as ClassRef).getClassname()
  );
  if (shouldDefer) {
    return;
  }
  thread.offsetPc(3);

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

export function runGetfield(thread: JvmThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  thread.offsetPc(3);
  const {
    error,
    field: fieldRes,
    fieldClass: fieldClassRes,
  } = getFieldRef(thread.getClass(), thread.getMethod(), indexbyte);

  if (error) {
    thread.throwNewException(error, '');
    return;
  }
  const field = fieldRes as FieldRef;

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
}

export function runPutfield(thread: JvmThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  thread.offsetPc(3);
  const {
    error,
    field: fieldRes,
    fieldClass: fieldClassRes,
  } = getFieldRef(thread.getClass(), thread.getMethod(), indexbyte);

  if (error) {
    thread.throwNewException(error, '');
    return;
  }
  const field = fieldRes as FieldRef;

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
}

function invokeVirtual(
  thread: JvmThread,
  constant: ConstantMethodref,
  onFinish?: () => void
): { error?: any; shouldDefer?: boolean } {
  let methodRef;
  const res = thread.getClass().resolveMethodRef(thread, constant);
  if (res.error) {
    return { error: res.error };
  }
  if (!res.methodRef) {
    // Should not happen
    return { error: 'java/lang/NoSuchMethodError' };
  }
  methodRef = res.methodRef;

  const classRef = methodRef.getClass();
  const { shouldDefer } = tryInitialize(thread, classRef.getClassname());
  if (shouldDefer) {
    return { shouldDefer };
  }

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
  const objRef = thread.popStack() as JvmObject;
  if (objRef === null) {
    return { error: 'java/lang/NullPointerException' };
  }
  const runtimeClassRef = objRef.getClass();

  // method lookup
  const lookupResult = runtimeClassRef.lookupMethod(
    methodRef.getMethodName() + methodRef.getMethodDesc(),
    methodRef,
    true
  );
  if (lookupResult.error || !lookupResult.methodRef) {
    return { error: lookupResult.error ?? 'java/lang/AbstractMethodError' };
  }
  const toInvoke = lookupResult.methodRef;
  if (toInvoke.checkAbstract()) {
    return { error: 'java/lang/NoSuchMethodError' };
  }
  onFinish && onFinish();
  thread.pushStackFrame(toInvoke.getClass(), toInvoke, 0, [objRef, ...args]);
  return {};
}

export function runInvokevirtual(thread: JvmThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  const constant = thread.getClass().getConstant(indexbyte);
  const res = invokeVirtual(thread, constant, () => thread.offsetPc(3));
  if (res.error) {
    thread.throwNewException(res.error, '');
    return;
  }
  if (res.shouldDefer) {
    return;
  }
}

export function runInvokespecial(thread: JvmThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  const constant = thread.getClass().getConstant(indexbyte);
  let res;

  if (constant.tag === CONSTANT_TAG.InterfaceMethodref) {
    res = thread.getClass().resolveInterfaceMethodRef(thread, constant);
  } else {
    res = thread.getClass().resolveMethodRef(thread, constant);
  }

  if (res.error) {
    thread.throwNewException(res.error, '');
    return;
  }
  if (!res.methodRef) {
    // Should not happen
    thread.throwNewException('java/lang/NoSuchMethodError', '');
    return;
  }
  const methodRef = res.methodRef;

  // If all of the following are true, let C be the direct superclass of the current class:
  //   The resolved method is not an instance initialization method (§2.9.1).
  //   If the symbolic reference names a class (not an interface), then that class is a superclass of the current class.
  //   The ACC_SUPER flag is set for the class file (§4.1).

  const classRef = methodRef.getClass();
  const { shouldDefer } = tryInitialize(thread, classRef.getClassname());
  if (shouldDefer) {
    return;
  }
  thread.offsetPc(3);

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

  const objRef = thread.popStack() as JvmObject;
  if (objRef === null) {
    thread.throwNewException('java/lang/NullPointerException', '');
    return;
  }

  // method lookup
  const lookupResult = methodRef
    .getClass()
    .lookupMethod(
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

export function runInvokestatic(thread: JvmThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);

  let res;
  const constant = thread.getClass().getConstant(indexbyte);
  if (constant.tag === CONSTANT_TAG.InterfaceMethodref) {
    // interface method ref
    res = thread.getClass().resolveInterfaceMethodRef(thread, constant);
  } else {
    res = thread.getClass().resolveMethodRef(thread, constant);
  }

  if (res.error) {
    thread.throwNewException(res.error, '');
    return;
  }
  if (!res.methodRef) {
    thread.throwNewException('java/lang/NoSuchMethodError', '');
    return;
  }
  const methodRef = res.methodRef;

  if (!methodRef.checkStatic()) {
    thread.throwNewException('java/lang/IncompatibleClassChangeError', '');
    return;
  }

  const classRef = methodRef.getClass();
  // Initialize class
  const { shouldDefer } = tryInitialize(thread, classRef.getClassname());
  if (shouldDefer) {
    return;
  }
  thread.offsetPc(3);

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

export function runInvokeinterface(thread: JvmThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  // Not actually useful
  const count = thread.getCode().getUint8(thread.getPC() + 3);
  const zero = thread.getCode().getUint8(thread.getPC() + 4);

  let methodRef;
  const constant = thread.getClass().getConstant(indexbyte);
  const res = thread.getClass().resolveInterfaceMethodRef(thread, constant);
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
  const { shouldDefer } = tryInitialize(thread, classRef.getClassname());
  if (shouldDefer) {
    return;
  }
  thread.offsetPc(6);

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
    methodRef.getMethodName() + methodRef.getMethodDesc(),
    methodRef,
    false,
    true
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

// TODO:
export function runInvokedynamic(thread: JvmThread): void {
  const index = thread.getCode().getUint16(thread.getPC() + 1);
  const zero1 = thread.getCode().getUint8(thread.getPC() + 3);
  const zero2 = thread.getCode().getUint8(thread.getPC() + 4);

  const invoker = thread.getClass();
  const callsiteConstant = invoker.getConstant(
    index
  ) as ConstantInvokeDynamicInfo;
  const bootstrapIdx = callsiteConstant.bootstrapMethodAttrIndex;
  const bootstrapMethod = thread.getClass().getBootstrapMethod(bootstrapIdx);
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
  const methodhandle = invoker.resolveMethodHandleRef(
    thread,
    invoker.getConstant(
      bootstrapMethod.bootstrapMethodRef
    ) as ConstantMethodHandleInfo
  );
  if (methodhandle.error || !methodhandle.result) {
    thread.throwNewException(methodhandle.error, '');
  }
  const methodDesc = methodhandle.result;

  const iRes = invoker.getLoader().getClassRef('java/lang/invoke/MethodHandle');
  if (iRes.error || !iRes.result) {
    thread.throwNewException(
      iRes.error ?? 'java/lang/ClassNotFoundException',
      ''
    );
    return;
  }

  // TODO: varargs
  const mRes = iRes.result.getMethod(
    'invoke(' +
      // Ljava/lang/invoke/MethodHandles$Lookup;Ljava/lang/String;Ljava/lang/invoke/MethodType;
      methodDesc?.slice(1)
  ) as MethodRef;

  invokeVirtual(
    thread,
    {
      tag: CONSTANT_TAG.Methodref,
      classIndex: 0,
      nameAndTypeIndex: 0,
      methodRef: mRes,
    },
    () => thread.offsetPc(5)
  );
}

export function runNew(thread: JvmThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  const invoker = thread.getClass();
  const res = invoker.resolveClassRef(invoker.getConstant(indexbyte));
  if (res.error || !res.classRef) {
    thread.throwNewException(
      res.error ?? 'java/lang/ClassNotFoundException',
      ''
    );
    return;
  }

  const objCls = res.classRef;
  if (objCls.checkAbstract() || objCls.checkInterface()) {
    thread.throwNewException('java/lang/InstantiationError', '');
    return;
  }

  // Load + initialize if needed
  const { shouldDefer } = tryInitialize(thread, objCls.getClassname());
  if (shouldDefer) {
    return;
  }

  thread.offsetPc(3);
  thread.pushStack(objCls.instantiate());
}

export function runNewarray(thread: JvmThread): void {
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
  if (classResolutionResult.error || !classResolutionResult.result) {
    throw new Error('Failed to load primitive array class');
  }

  const arrayCls = classResolutionResult.result;
  const arrayref = arrayCls.instantiate() as JvmArray;
  arrayref.initialize(count);
  thread.pushStack(arrayref);
}

export function runAnewarray(thread: JvmThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  const invoker = thread.getClass();
  const count = thread.popStack();

  if (count < 0) {
    thread.throwNewException('java/lang/NegativeArraySizeException', '');
    return;
  }

  const classRes = invoker.resolveClassRef(invoker.getConstant(indexbyte));
  if (classRes.error || !classRes.classRef) {
    thread.throwNewException(
      classRes.error ?? 'java/lang/ClassNotFoundException',
      ''
    );
    return;
  }
  if (tryInitialize(thread, classRes.classRef.getClassname()).shouldDefer) {
    return;
  }

  const arrayClassRes = invoker
    .getLoader()
    .getClassRef('[L' + classRes.classRef.getClassname() + ';');
  if (arrayClassRes.error || !arrayClassRes.result) {
    throw new Error('Failed to load array class');
  }
  if (tryInitialize(thread, arrayClassRes.result.getClassname()).shouldDefer) {
    return;
  }
  thread.offsetPc(3);

  const arrayCls = arrayClassRes.result;
  const arrayref = arrayCls.instantiate() as JvmArray;
  arrayref.initialize(count);
  thread.pushStack(arrayref);
}

export function runArraylength(thread: JvmThread): void {
  thread.offsetPc(1);
  const arrayref = thread.popStack() as JvmArray;
  thread.pushStack(arrayref.len());
}

export function runAthrow(thread: JvmThread): void {
  thread.offsetPc(1);
  const exception = thread.popStack();
  thread.throwException(exception);
}

export function runCheckcast(thread: JvmThread): void {
  thread.offsetPc(1);
  // const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
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

export function runInstanceof(thread: JvmThread): void {
  thread.offsetPc(1);
  // const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  // thread.offsetPc(2);
  // const ref = thread.popStack() as JvmObject;
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

export function runMonitorenter(thread: JvmThread): void {
  thread.offsetPc(1);
  throw new Error('runInstruction: Not implemented');
}

export function runMonitorexit(thread: JvmThread): void {
  thread.offsetPc(1);
  throw new Error('runInstruction: Not implemented');
}
