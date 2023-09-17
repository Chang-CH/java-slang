import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import MemoryArea from '#jvm/components/MemoryArea';
import { InstructionType } from '#types/ClassRef/instructions';
import { JavaReference, JavaArray } from '#types/DataTypes';
import { tryInitialize, readMethodDescriptor } from '..';
import {
  ConstantFieldrefInfo,
  ConstantNameAndTypeInfo,
  ConstantMethodrefInfo,
  ConstantClassInfo,
  ConstantUtf8Info,
} from '#jvm/external/ClassFile/types/constants';
import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { ConstantClass } from '#types/ClassRef/constants';

export function runGetstatic(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const invoker = thread.getClassName();
  const fieldRef = thread
    .getClass()
    .getConstant(thread, instruction.operands[0]) as ConstantFieldrefInfo;
  const className = thread
    .getClass()
    .getConstant(
      thread,
      thread.getClass().getConstant(thread, fieldRef.classIndex).nameIndex
    ).value;
  const classRef = thread
    .getClass()
    .getLoader()
    .getClassRef(className, e =>
      thread.throwNewException('java/lang/ClassNotFoundException', '')
    );

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
    thread.pushStackWide(
      thread.getClass().getStaticWide(thread, fieldName + fieldType)
    );
  } else {
    thread.pushStack(
      thread.getClass().getStatic(thread, fieldName + fieldType)
    );
  }

  thread.offsetPc(3);
}

export function runPutstatic(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const invoker = thread.getClass();
  const fieldRef = thread
    .getClass()
    .getConstant(thread, instruction.operands[0]) as ConstantFieldrefInfo;
  const className = thread
    .getClass()
    .getConstant(
      thread,
      thread.getClass().getConstant(thread, fieldRef.classIndex).nameIndex
    ).value;

  // Load + initialize if needed
  tryInitialize(thread, className);
  const cls = thread
    .getClass()
    .getLoader()
    .getClassRef(className, e =>
      thread.throwNewException('java/lang/ClassNotFoundException', '')
    );

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
    const value = thread.popStackWide();
    cls.putStaticWide(thread, fieldName + fieldType, value);
  } else {
    const value = thread.popStack();
    cls.putStatic(thread, fieldName + fieldType, value);
  }
  thread.offsetPc(3);
}

export function runGetfield(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const invoker = thread.getClassName();
  const obj = thread.popStack() as JavaReference;
  const fieldRef = thread
    .getClass()
    .getConstant(thread, instruction.operands[0]) as ConstantFieldrefInfo;

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
    thread.pushStackWide(obj.getFieldWide(fieldName + fieldType));
  } else {
    thread.pushStack(obj.getField(fieldName + fieldType));
  }
  thread.offsetPc(3);
}

export function runPutfield(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const invoker = thread.getClassName();
  const fieldRef = thread
    .getClass()
    .getConstant(thread, instruction.operands[0]) as ConstantFieldrefInfo;

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
    const value = thread.popStackWide();
    const obj = thread.popStack() as JavaReference;
    obj.putFieldWide(fieldName + fieldType, value);
  } else {
    const value = thread.popStack();
    const obj = thread.popStack() as JavaReference;
    obj.putField(fieldName + fieldType, value);
  }

  // FIXME: load class if not loaded
  thread.offsetPc(3);
}

export function runInvokevirtual(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const invoker = thread.getClassName();
  const methodRef = thread
    .getClass()
    .getConstant(thread, instruction.operands[0]) as ConstantMethodrefInfo;
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
    .getClassRef(className, e =>
      thread.throwNewException('java/lang/ClassNotFoundException', '')
    );

  // Get arguments
  const methodDesc = readMethodDescriptor(methodDescriptor);
  const args = [];
  for (let i = methodDesc.args.length - 1; i >= 0; i--) {
    if (methodDesc.args[i] === 'J' || methodDesc.args[i] === 'D') {
      args[i] = thread.popStackWide();
      continue;
    }
    args[i] = thread.popStack();
  }

  const thisObj = thread.popStack();
  thread.offsetPc(3);

  thread.pushStackFrame({
    class: classRef,
    operandStack: [],
    method: classRef.methods[methodName + methodDescriptor],
    pc: 0,
    locals: [thisObj],
  });

  // Load + initialize if needed
  tryInitialize(thread, className);
}

export function runInvokespecial(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const invoker = thread.getClassName();
  const methodRef = thread
    .getClass()
    .getConstant(thread, instruction.operands[0]) as ConstantMethodrefInfo;
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
  const methodDesc = readMethodDescriptor(methodDescriptor);
  const args = [];
  for (let i = methodDesc.args.length - 1; i >= 0; i--) {
    if (methodDesc.args[i] === 'J' || methodDesc.args[i] === 'D') {
      args[i] = thread.popStackWide();
      continue;
    }
    args[i] = thread.popStack();
  }

  // Load + initialize if needed
  tryInitialize(thread, className);

  const thisObj = thread.popStack();
  thread.offsetPc(3);

  const classRef = thread
    .getClass()
    .getLoader()
    .getClassRef(className, e =>
      thread.throwNewException('java/lang/ClassNotFoundException', '')
    );

  thread.pushStackFrame({
    class: classRef,
    operandStack: [],
    method: classRef.methods[methodName + methodDescriptor],
    pc: 0,
    locals: [thisObj, ...args],
  });
}

export function runInvokestatic(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const invoker = thread.getClassName();
  const methodRef = thread
    .getClass()
    .getConstant(thread, instruction.operands[0]) as ConstantMethodrefInfo;

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
  const methodDesc = readMethodDescriptor(methodDescriptor);
  const args = [];
  for (let i = methodDesc.args.length - 1; i >= 0; i--) {
    if (methodDesc.args[i] === 'J' || methodDesc.args[i] === 'D') {
      args[i] = thread.popStackWide();
      continue;
    }
    args[i] = thread.popStack();
  }

  thread.offsetPc(3);

  const classRef = thread
    .getClass()
    .getLoader()
    .getClassRef(className, e =>
      thread.throwNewException('java/lang/ClassNotFoundException', '')
    );

  thread.pushStackFrame({
    class: classRef,
    operandStack: [],
    method: classRef.getMethod(thread, methodName + methodDescriptor),
    pc: 0,
    locals: args,
  });

  // Load + initialize if needed
  tryInitialize(thread, className);
}

export function runInvokeinterface(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const invoker = thread.getClassName();
  const methodRef = thread
    .getClass()
    .getConstant(thread, instruction.operands[0]) as ConstantMethodrefInfo;
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
  const methodDesc = readMethodDescriptor(methodDescriptor);
  const args = [];
  for (let i = methodDesc.args.length - 1; i >= 0; i--) {
    if (methodDesc.args[i] === 'J' || methodDesc.args[i] === 'D') {
      args[i] = thread.popStackWide();
      continue;
    }
    args[i] = thread.popStack();
  }

  const thisObj = thread.popStack();
  thread.offsetPc(3);

  const classRef = thread
    .getClass()
    .getLoader()
    .getClassRef(className, e =>
      thread.throwNewException('java/lang/ClassNotFoundException', '')
    );

  thread.pushStackFrame({
    class: classRef,
    operandStack: [],
    method: classRef.methods[methodName + methodDescriptor],
    pc: 0,
    locals: [thisObj],
  });
}

export function runInvokedynamic(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  // Mainly used by Java8 natives
  const invoker = thread.getClassName();
  const callSiteSpecifier = thread
    .getClass()
    .getConstant(thread, instruction.operands[0]);

  // resolve call site specifier

  throw new Error('invokedynamic: not implemented');
}

export function runNew(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const invoker = thread.getClassName();
  const type = instruction.operands[0];
  const className = thread
    .getClass()
    .getConstant(
      thread,
      thread.getClass().getConstant(thread, type).nameIndex
    ).value;

  // Load + initialize if needed
  tryInitialize(thread, className);

  console.warn('new: fields not initialized to defaults');
  const objectref = new JavaReference(className, {});
  thread.pushStack(objectref);
  thread.offsetPc(3);
}

export function runNewarray(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const count = thread.popStack();
  const type = instruction.operands[0];
  const arrayref = new JavaArray(count, type);
  thread.pushStack(arrayref);
  thread.offsetPc(2);
}

export function runAnewarray(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const invoker = thread.getClassName();
  const count = thread.popStack();
  const className = thread
    .getClass()
    .getConstant(
      thread,
      thread.getClass().getConstant(thread, instruction.operands[0]).nameIndex
    ).value;
  const arrayref = new JavaArray(count, className);
  thread.pushStack(arrayref);
  thread.offsetPc(3);
}

export function runArraylength(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const arrayref = thread.popStack() as JavaArray;
  thread.pushStack(arrayref.len());
  thread.offsetPc(1);
}

export function runAthrow(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const exception = thread.popStack();
  thread.throwException(exception);
  // TODO: throw Java error
  // TODO: parse exception handlers
  // throw new Error('runInstruction: Not implemented');
}

export function runCheckcast(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  if (thread.popStack() === null) {
    thread.pushStack(null);
    thread.offsetPc(3);
    return;
  }

  const resolvedType = thread
    .getClass()
    .getConstant(thread, instruction.operands[0]) as ConstantClassInfo;
  const className = thread
    .getClass()
    .getConstant(thread, resolvedType.nameIndex);

  // recursive checkcast.
  throw new Error('runInstruction: Not implemented');
}

export function runInstanceof(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const ref = thread.popStack() as JavaReference;
  const cls = thread.getClass().getConstant(thread, instruction.operands[0]);

  if (ref === null) {
    thread.pushStack(0);
    thread.offsetPc(3);
    return;
  }

  if (cls.tag === CONSTANT_TAG.constantClass) {
    const classRef = (cls as ConstantClass).ref;
    if (
      ref.cls.thisClass === classRef.thisClass ||
      ref.cls.interfaces.includes(classRef.thisClass)
    ) {
      thread.pushStack(1);
    } else {
      thread.pushStack(0);
    }
    console.error('Instanceof: not checking superclasses');
    thread.offsetPc(3);
    return;
  }

  throw new Error('runInstruction: Not implemented');
}

export function runMonitorenter(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}

export function runMonitorexit(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  throw new Error('runInstruction: Not implemented');
}
