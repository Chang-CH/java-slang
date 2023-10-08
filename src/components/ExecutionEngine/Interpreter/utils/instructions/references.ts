import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';

import { JavaReference, JavaArray } from '#types/dataTypes';
import { tryInitialize, parseMethodDescriptor, asDouble, asFloat } from '..';
import {
  ConstantFieldrefInfo,
  ConstantNameAndTypeInfo,
  ConstantMethodrefInfo,
  ConstantClassInfo,
} from '#jvm/external/ClassFile/types/constants';
import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { ConstantClass, ConstantMethodref } from '#types/ConstantRef';
import {
  checkStatic,
} from '#utils/parseBinary/utils/readMethod';

export function runGetstatic(thread: NativeThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC());

  thread.offsetPc(2);

  const invoker = thread.getClassName();
  const fieldRef = thread
    .getClass()
    .getConstant(thread, indexbyte) as ConstantFieldrefInfo;
  const className = thread
    .getClass()
    .getConstant(
      thread,
      thread.getClass().getConstant(thread, fieldRef.classIndex).nameIndex
    ).value;
  const classRef = thread
    .getClass()
    .getLoader()
    .resolveClass(thread, className);

  // Load + initialize if needed
  tryInitialize(thread, className);

  const nameAndTypeIndex = thread
    .getClass()
    .getConstant(thread, fieldRef.nameAndTypeIndex) as ConstantNameAndTypeInfo;
  const fieldName = thread
    .getClass()
    .getConstant(thread, nameAndTypeIndex.nameIndex).value;
  const fieldType = thread
    .getClass()
    .getConstant(thread, nameAndTypeIndex.descriptorIndex).value;

  // FIXME: in theory it is legal to have 2 same field name, different type
  if (fieldType === 'J' || fieldType === 'D') {
    thread.pushStack64(
      thread.getClass().getStatic64(thread, fieldName + fieldType)
    );
  } else {
    thread.pushStack(
      thread.getClass().getStatic(thread, fieldName + fieldType)
    );
  }
}

export function runPutstatic(thread: NativeThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC());

  thread.offsetPc(2);

  const invoker = thread.getClass();
  const fieldRef = thread
    .getClass()
    .getConstant(thread, indexbyte) as ConstantFieldrefInfo;
  const className = thread
    .getClass()
    .getConstant(
      thread,
      thread.getClass().getConstant(thread, fieldRef.classIndex).nameIndex
    ).value;

  // Load + initialize if needed
  tryInitialize(thread, className);
  const cls = thread.getClass().getLoader().resolveClass(thread, className);

  const nameAndTypeIndex = thread
    .getClass()
    .getConstant(thread, fieldRef.nameAndTypeIndex) as ConstantNameAndTypeInfo;
  const fieldName = cls.getConstant(
    className,
    nameAndTypeIndex.nameIndex
  ).value;
  const fieldType = cls.getConstant(
    className,
    nameAndTypeIndex.descriptorIndex
  ).value;

  // FIXME: in theory it is legal to have 2 same field name, different type
  if (fieldType === 'J' || fieldType === 'D') {
    const value = thread.popStack64();
    cls.putStatic64(thread, fieldName + fieldType, value);
  } else {
    const value = thread.popStack();
    cls.putStatic(thread, fieldName + fieldType, value);
  }
}

export function runGetfield(thread: NativeThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC());

  thread.offsetPc(2);

  const invoker = thread.getClassName();
  const obj = thread.popStack() as JavaReference;
  const fieldRef = thread
    .getClass()
    .getConstant(thread, indexbyte) as ConstantFieldrefInfo;

  const className = thread
    .getClass()
    .getConstant(
      thread,
      thread.getClass().getConstant(thread, fieldRef.classIndex).nameIndex
    ).value;

  // Load + initialize if needed
  tryInitialize(thread, className);

  const nameAndTypeIndex = thread
    .getClass()
    .getConstant(thread, fieldRef.nameAndTypeIndex) as ConstantNameAndTypeInfo;
  const fieldName = thread
    .getClass()
    .getConstant(className, nameAndTypeIndex.nameIndex).value;
  const fieldType = thread
    .getClass()
    .getConstant(className, nameAndTypeIndex.descriptorIndex).value;

  if (fieldType === 'J' || fieldType === 'D') {
    thread.pushStack64(obj.getField64(fieldName + fieldType));
  } else {
    thread.pushStack(obj.getField(fieldName + fieldType));
  }
}

export function runPutfield(thread: NativeThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC());

  thread.offsetPc(2);

  const invoker = thread.getClassName();
  const fieldRef = thread
    .getClass()
    .getConstant(thread, indexbyte) as ConstantFieldrefInfo;

  const className = thread
    .getClass()
    .getConstant(
      thread,
      thread.getClass().getConstant(thread, fieldRef.classIndex).nameIndex
    ).value;

  // Load + initialize if needed
  tryInitialize(thread, className);

  const nameAndTypeIndex = thread
    .getClass()
    .getConstant(thread, fieldRef.nameAndTypeIndex) as ConstantNameAndTypeInfo;
  const fieldName = thread
    .getClass()
    .getConstant(className, nameAndTypeIndex.nameIndex).value;
  const fieldType = thread
    .getClass()
    .getConstant(className, nameAndTypeIndex.descriptorIndex).value;

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

export function runInvokevirtual(thread: NativeThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC());

  thread.offsetPc(2);

  const invoker = thread.getClassName();
  const methodRef = thread
    .getClass()
    .getConstant(thread, indexbyte) as ConstantMethodrefInfo;
  const className = thread
    .getClass()
    .getConstant(
      thread,
      thread.getClass().getConstant(thread, methodRef.classIndex).nameIndex
    ).value;
  const nameAndTypeIndex = thread
    .getClass()
    .getConstant(thread, methodRef.nameAndTypeIndex) as ConstantNameAndTypeInfo;
  const methodName = thread
    .getClass()
    .getConstant(thread, nameAndTypeIndex.nameIndex).value;
  const methodDescriptor = thread
    .getClass()
    .getConstant(thread, nameAndTypeIndex.descriptorIndex).value;

  const classRef = thread
    .getClass()
    .getLoader()
    .resolveClass(thread, className);

  // Get arguments
  const methodDesc = parseMethodDescriptor(methodDescriptor);
  const args = [];
  for (let i = methodDesc.args.length - 1; i >= 0; i--) {
    if (methodDesc.args[i] === 'J' || methodDesc.args[i] === 'D') {
      args[i] = thread.popStack64();
      continue;
    }
    args[i] = thread.popStack();
  }

  const thisObj = thread.popStack();

  thread.pushStackFrame(
    classRef,
    classRef.getMethod(thread, methodName + methodDescriptor),
    0,
    [thisObj]
  );

  // Load + initialize if needed
  tryInitialize(thread, className);
}

export function runInvokespecial(thread: NativeThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC());
  thread.offsetPc(2);

  const invoker = thread.getClassName();
  const methodRef = thread
    .getClass()
    .getConstant(thread, indexbyte) as ConstantMethodrefInfo;
  const className = thread
    .getClass()
    .getConstant(
      thread,
      thread.getClass().getConstant(thread, methodRef.classIndex).nameIndex
    ).value;
  const nameAndTypeIndex = thread
    .getClass()
    .getConstant(thread, methodRef.nameAndTypeIndex) as ConstantNameAndTypeInfo;
  const methodName = thread
    .getClass()
    .getConstant(thread, nameAndTypeIndex.nameIndex).value;
  const methodDescriptor = thread
    .getClass()
    .getConstant(thread, nameAndTypeIndex.descriptorIndex).value;

  // Get arguments
  const methodDesc = parseMethodDescriptor(methodDescriptor);
  const args = [];
  for (let i = methodDesc.args.length - 1; i >= 0; i--) {
    if (methodDesc.args[i] === 'J' || methodDesc.args[i] === 'D') {
      args[i] = thread.popStack64();
      continue;
    }
    args[i] = thread.popStack();
  }

  // Load + initialize if needed
  tryInitialize(thread, className);

  const thisObj = thread.popStack();

  const classRef = thread
    .getClass()
    .getLoader()
    .resolveClass(thread, className);

  thread.pushStackFrame(
    classRef,
    classRef.getMethod(thread, methodName + methodDescriptor),
    0,
    [thisObj, ...args]
  );
}

export function runInvokestatic(thread: NativeThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC());
  thread.offsetPc(2);

  const invoker = thread.getClassName();
  thread.getClass().resolveReference(thread, indexbyte);
  const methodRef = (
    thread.getClass().getConstant(thread, indexbyte) as ConstantMethodref
  ).ref;
  const classRef = methodRef.class;

  if (!checkStatic(methodRef)) {
    thread.throwNewException('java/lang/IncompatibleClassChangeError', '');
  }

  // Initialize class
  tryInitialize(thread, classRef.getClassname());

  // Get arguments
  const methodDesc = parseMethodDescriptor(methodRef.descriptor);
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

  // Native invocation same as java method
  thread.pushStackFrame(methodRef.class, methodRef, 0, args);
}

export function runInvokeinterface(thread: NativeThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC());
  thread.offsetPc(2);

  const count = thread.getCode().getUint8(thread.getPC());
  if (count === 0) {
    throw new Error('invokeinterface count must not be 0');
  }
  thread.offsetPc(1);

  const zero = thread.getCode().getUint8(thread.getPC());
  if (zero !== 0) {
    throw new Error('invokeinterface fourth operand must be 0');
  }
  thread.offsetPc(1);

  const invoker = thread.getClassName();
  const methodRef = thread
    .getClass()
    .getConstant(thread, indexbyte) as ConstantMethodrefInfo;
  const className = thread
    .getClass()
    .getConstant(
      thread,
      thread.getClass().getConstant(thread, methodRef.classIndex).nameIndex
    ).value;
  const nameAndTypeIndex = thread
    .getClass()
    .getConstant(thread, methodRef.nameAndTypeIndex) as ConstantNameAndTypeInfo;
  const methodName = thread
    .getClass()
    .getConstant(thread, nameAndTypeIndex.nameIndex).value;
  const methodDescriptor = thread
    .getClass()
    .getConstant(thread, nameAndTypeIndex.descriptorIndex).value;

  // Get arguments
  const methodDesc = parseMethodDescriptor(methodDescriptor);
  const args = [];
  for (let i = methodDesc.args.length - 1; i >= 0; i--) {
    if (methodDesc.args[i] === 'J' || methodDesc.args[i] === 'D') {
      args[i] = thread.popStack64();
      continue;
    }
    args[i] = thread.popStack();
  }

  const thisObj = thread.popStack();

  const classRef = thread
    .getClass()
    .getLoader()
    .resolveClass(thread, className);

  thread.pushStackFrame(
    classRef,
    classRef.getMethod(thread, methodName + methodDescriptor),
    0,
    [thisObj]
  );
}

export function runInvokedynamic(thread: NativeThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC());
  thread.offsetPc(2);

  const zero1 = thread.getCode().getUint8(thread.getPC());
  if (zero1 !== 0) {
    throw new Error('invokedynamic third byte must be 0');
  }
  thread.offsetPc(1);

  const zero2 = thread.getCode().getUint8(thread.getPC());
  if (zero2 !== 0) {
    throw new Error('invokedynamic fourth bytes must be 0');
  }
  thread.offsetPc(1);

  const invoker = thread.getClassName();
  const callSiteSpecifier = thread.getClass().getConstant(thread, indexbyte);

  // resolve call site specifier

  throw new Error('invokedynamic: not implemented');
}

export function runNew(thread: NativeThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC());
  thread.offsetPc(2);

  const invoker = thread.getClassName();
  const type = indexbyte;
  const className = thread
    .getClass()
    .getConstant(
      thread,
      thread.getClass().getConstant(thread, type).nameIndex
    ).value;

  // Load + initialize if needed
  tryInitialize(thread, className);

  const objectref = new JavaReference(className, {});
  thread.pushStack(objectref);
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
    .getConstant(
      thread,
      thread.getClass().getConstant(thread, indexbyte).nameIndex
    ).value;
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
  const indexbyte = thread.getCode().getUint16(thread.getPC());
  thread.offsetPc(2);

  if (thread.popStack() === null) {
    thread.pushStack(null);

    return;
  }

  const resolvedType = thread
    .getClass()
    .getConstant(thread, indexbyte) as ConstantClassInfo;
  const className = thread
    .getClass()
    .getConstant(thread, resolvedType.nameIndex);

  // recursive checkcast.
  throw new Error('runInstruction: Not implemented');
}

export function runInstanceof(thread: NativeThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC());
  thread.offsetPc(2);

  const ref = thread.popStack() as JavaReference;
  const cls = thread.getClass().getConstant(thread, indexbyte);

  if (ref === null) {
    thread.pushStack(0);
    return;
  }

  if (cls.tag === CONSTANT_TAG.Class) {
    const classRef = (cls as ConstantClass).ref;
    if (
      ref.getClass().getClassname() === classRef.getClassname() ||
      ref.getClass().getInterfaces().includes(classRef.getClassname())
    ) {
      thread.pushStack(1);
    } else {
      thread.pushStack(0);
    }

    return;
  }

  throw new Error('runInstruction: Not implemented');
}

export function runMonitorenter(thread: NativeThread): void {
  throw new Error('runInstruction: Not implemented');
}

export function runMonitorexit(thread: NativeThread): void {
  throw new Error('runInstruction: Not implemented');
}
