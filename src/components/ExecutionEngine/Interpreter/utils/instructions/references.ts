import { constantTag } from '#constants/ClassFile/constants';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import MemoryArea from '#jvm/components/MemoryArea';
import {
  constant_Fieldref_info,
  constant_NameAndType_info,
  constant_Methodref_info,
  constant_Class_info,
  constant_Utf8_info,
} from '#types/ClassFile/constants';
import { InstructionType } from '#types/ClassFile/instructions';
import { JavaReference, JavaArray } from '#types/DataTypes';
import { tryInitialize, readMethodDescriptor, tryLoad } from '..';

export function runGetstatic(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const invoker = thread.getClassName();
  const fieldRef = memoryArea.getConstant(
    invoker,
    instruction.operands[0]
  ) as constant_Fieldref_info;
  const className = memoryArea.getConstant(
    invoker,
    memoryArea.getConstant(invoker, fieldRef.class_index).nameIndex
  ).value;
  const classRef = memoryArea.getClass(className);

  // Load + initialize if needed
  tryInitialize(memoryArea, thread, className);

  const nameAndTypeIndex = memoryArea.getConstant(
    invoker,
    fieldRef.name_and_type_index
  ) as constant_NameAndType_info;
  const fieldName = memoryArea.getConstant(
    invoker,
    nameAndTypeIndex.name_index
  ).value;
  const fieldType = memoryArea.getConstant(
    invoker,
    nameAndTypeIndex.descriptor_index
  ).value;

  // FIXME: in theory it is legal to have 2 same field name, different type
  if (fieldType === 'J' || fieldType === 'D') {
    thread.pushStackWide(
      memoryArea.getStaticWide(className, fieldName + fieldType)
    );
  } else {
    thread.pushStack(memoryArea.getStatic(className, fieldName + fieldType));
  }

  thread.offsetPc(3);
}

export function runPutstatic(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const invoker = thread.getClassName();
  const fieldRef = memoryArea.getConstant(
    invoker,
    instruction.operands[0]
  ) as constant_Fieldref_info;
  const className = memoryArea.getConstant(
    invoker,
    memoryArea.getConstant(invoker, fieldRef.class_index).nameIndex
  ).value;

  // Load + initialize if needed
  tryInitialize(memoryArea, thread, className);

  const nameAndTypeIndex = memoryArea.getConstant(
    invoker,
    fieldRef.name_and_type_index
  ) as constant_NameAndType_info;
  const fieldName = memoryArea.getConstant(
    className,
    nameAndTypeIndex.name_index
  ).value;
  const fieldType = memoryArea.getConstant(
    className,
    nameAndTypeIndex.descriptor_index
  ).value;

  // FIXME: in theory it is legal to have 2 same field name, different type
  if (fieldType === 'J' || fieldType === 'D') {
    const value = thread.popStackWide();
    memoryArea.putStaticWide(className, fieldName + fieldType, value);
  } else {
    const value = thread.popStack();
    memoryArea.putStatic(className, fieldName + fieldType, value);
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
  const fieldRef = memoryArea.getConstant(
    thread.getClassName(),
    instruction.operands[0]
  ) as constant_Fieldref_info;

  const className = memoryArea.getConstant(
    invoker,
    memoryArea.getConstant(invoker, fieldRef.class_index).nameIndex
  ).value;

  // Load + initialize if needed
  tryInitialize(memoryArea, thread, className);

  const nameAndTypeIndex = memoryArea.getConstant(
    invoker,
    fieldRef.name_and_type_index
  ) as constant_NameAndType_info;
  const fieldName = memoryArea.getConstant(
    className,
    nameAndTypeIndex.name_index
  ).value;
  const fieldType = memoryArea.getConstant(
    className,
    nameAndTypeIndex.descriptor_index
  ).value;

  // console.debug('getfield', className, fieldName, fieldType, obj);

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
  const fieldRef = memoryArea.getConstant(
    thread.getClassName(),
    instruction.operands[0]
  ) as constant_Fieldref_info;

  const className = memoryArea.getConstant(
    invoker,
    memoryArea.getConstant(invoker, fieldRef.class_index).nameIndex
  ).value;

  // Load + initialize if needed
  tryInitialize(memoryArea, thread, className);

  const nameAndTypeIndex = memoryArea.getConstant(
    invoker,
    fieldRef.name_and_type_index
  ) as constant_NameAndType_info;
  const fieldName = memoryArea.getConstant(
    className,
    nameAndTypeIndex.name_index
  ).value;
  const fieldType = memoryArea.getConstant(
    className,
    nameAndTypeIndex.descriptor_index
  ).value;

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
  const methodRef = memoryArea.getConstant(
    invoker,
    instruction.operands[0]
  ) as constant_Methodref_info;
  const className = memoryArea.getConstant(
    invoker,
    memoryArea.getConstant(invoker, methodRef.class_index).nameIndex
  ).value;
  const nameAndTypeIndex = memoryArea.getConstant(
    invoker,
    methodRef.name_and_type_index
  ) as constant_NameAndType_info;
  const methodName = memoryArea.getConstant(
    invoker,
    nameAndTypeIndex.name_index
  ).value;
  const methodDescriptor = memoryArea.getConstant(
    invoker,
    nameAndTypeIndex.descriptor_index
  ).value;

  const classRef = memoryArea.getClass(className);

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
    this: thisObj,
    locals: [thisObj],
  });

  // Load + initialize if needed
  tryInitialize(memoryArea, thread, className);
}

export function runInvokespecial(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const invoker = thread.getClassName();
  const methodRef = memoryArea.getConstant(
    invoker,
    instruction.operands[0]
  ) as constant_Methodref_info;
  const className = memoryArea.getConstant(
    invoker,
    memoryArea.getConstant(invoker, methodRef.class_index).nameIndex
  ).value;
  const nameAndTypeIndex = memoryArea.getConstant(
    invoker,
    methodRef.name_and_type_index
  ) as constant_NameAndType_info;
  const methodName = memoryArea.getConstant(
    invoker,
    nameAndTypeIndex.name_index
  ).value;
  const methodDescriptor = memoryArea.getConstant(
    invoker,
    nameAndTypeIndex.descriptor_index
  ).value;

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
  tryInitialize(memoryArea, thread, className);

  const thisObj = thread.popStack();
  thread.offsetPc(3);

  const classRef = memoryArea.getClass(className);

  thread.pushStackFrame({
    class: classRef,
    operandStack: [],
    method: classRef.methods[methodName + methodDescriptor],
    pc: 0,
    this: thisObj,
    locals: [thisObj, ...args],
  });
}

export function runInvokestatic(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const invoker = thread.getClassName();
  const methodRef = memoryArea.getConstant(
    invoker,
    instruction.operands[0]
  ) as constant_Methodref_info;

  const className = memoryArea.getConstant(
    invoker,
    memoryArea.getConstant(invoker, methodRef.class_index).nameIndex
  ).value;
  const nameAndTypeIndex = memoryArea.getConstant(
    invoker,
    methodRef.name_and_type_index
  ) as constant_NameAndType_info;
  const methodName = memoryArea.getConstant(
    invoker,
    nameAndTypeIndex.name_index
  ).value;
  const methodDescriptor = memoryArea.getConstant(
    invoker,
    nameAndTypeIndex.descriptor_index
  ).value;

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

  const classRef = memoryArea.getClass(className);

  thread.pushStackFrame({
    class: classRef,
    operandStack: [],
    method: classRef.methods[methodName + methodDescriptor],
    pc: 0,
    this: null,
    locals: args,
  });

  // Load + initialize if needed
  tryInitialize(memoryArea, thread, className);
}

export function runInvokeinterface(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const invoker = thread.getClassName();
  const methodRef = memoryArea.getConstant(
    invoker,
    instruction.operands[0]
  ) as constant_Methodref_info;
  const className = memoryArea.getConstant(
    invoker,
    memoryArea.getConstant(invoker, methodRef.class_index).nameIndex
  ).value;
  const nameAndTypeIndex = memoryArea.getConstant(
    invoker,
    methodRef.name_and_type_index
  ) as constant_NameAndType_info;
  const methodName = memoryArea.getConstant(
    invoker,
    nameAndTypeIndex.name_index
  ).value;
  const methodDescriptor = memoryArea.getConstant(
    invoker,
    nameAndTypeIndex.descriptor_index
  ).value;

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

  // Load class if not loaded
  tryLoad(memoryArea, thread, className);

  const classRef = memoryArea.getClass(className);

  thread.pushStackFrame({
    class: classRef,
    operandStack: [],
    method: classRef.methods[methodName + methodDescriptor],
    pc: 0,
    this: thisObj,
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
  const callSiteSpecifier = memoryArea.getConstant(
    invoker,
    instruction.operands[0]
  );

  // resolve call site specifier
  const methodHandle = console.debug(callSiteSpecifier);
  console.debug(memoryArea.getClass(invoker));

  throw new Error('invokedynamic: not implemented');
}

export function runNew(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const invoker = thread.getClassName();
  const type = instruction.operands[0];
  const className = memoryArea.getConstant(
    invoker,
    memoryArea.getConstant(invoker, type).nameIndex
  ).value;

  // Load + initialize if needed
  tryInitialize(memoryArea, thread, className);

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
  const className = memoryArea.getConstant(
    invoker,
    memoryArea.getConstant(invoker, instruction.operands[0]).nameIndex
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
}

export function runAthrow(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const exception = thread.popStack();
  thread.throwException(memoryArea, exception);
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

  const resolvedType = memoryArea.getConstant(
    thread.getClassName(),
    instruction.operands[0]
  ) as constant_Class_info;
  const className = memoryArea.getConstant(
    thread.getClassName(),
    resolvedType.name_index
  );

  // recursive checkcast.
  throw new Error('runInstruction: Not implemented');
}

export function runInstanceof(
  thread: NativeThread,
  memoryArea: MemoryArea,
  instruction: InstructionType
) {
  const ref = thread.popStack();
  const cls = memoryArea.getConstant(
    thread.getClassName(),
    instruction.operands[0]
  );

  if (ref === null) {
    thread.pushStack(0);
    thread.offsetPc(3);
    return;
  }

  if (cls.tag === constantTag.constant_Class) {
    const refClass = memoryArea.getConstant(
      thread.getClassName(),
      cls.nameIndex
    ) as constant_Utf8_info;
    const refClsName = refClass.value;

    const clsData = memoryArea.getClass(ref.cls);

    if (
      refClsName === clsData.this_class ||
      clsData.interfaces.includes(refClsName)
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
