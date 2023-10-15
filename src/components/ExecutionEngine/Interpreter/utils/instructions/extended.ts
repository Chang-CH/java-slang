import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import {
  ArrayPrimitiveType,
  JavaArray,
  JavaReference,
  JavaType,
} from '#types/dataTypes';
import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import { asFloat, asDouble, parseFirstDescriptor } from '..';
import {
  ConstantClassInfo,
  ConstantUtf8Info,
} from '#jvm/external/ClassFile/types/constants';

export function runWide(thread: NativeThread): void {
  const opcode = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);

  const indexbyte = thread.getCode().getUint16(thread.getPC());
  thread.offsetPc(2);

  switch (opcode) {
    case OPCODE.ILOAD:
      thread.pushStack(thread.loadLocal(indexbyte));
      return;
    case OPCODE.LLOAD:
      thread.pushStack64(thread.loadLocal64(indexbyte));
      return;
    case OPCODE.FLOAD:
      thread.pushStack(thread.loadLocal(indexbyte));
      return;
    case OPCODE.DLOAD:
      thread.pushStack64(thread.loadLocal64(indexbyte));
      return;
    case OPCODE.ALOAD:
      thread.pushStack(thread.loadLocal(indexbyte));
      return;
    case OPCODE.ISTORE:
      thread.storeLocal(indexbyte, thread.popStack());
      return;
    case OPCODE.LSTORE:
      thread.storeLocal64(indexbyte, thread.popStack64());
      return;
    case OPCODE.FSTORE:
      thread.storeLocal(indexbyte, asFloat(thread.popStack()));
      return;
    case OPCODE.DSTORE:
      thread.storeLocal64(indexbyte, asDouble(thread.popStack64()));
      return;
    case OPCODE.ASTORE:
      thread.storeLocal(indexbyte, thread.popStack());
      return;

    case OPCODE.IINC:
      const constbyte = thread.getCode().getInt16(thread.getPC());
      thread.offsetPc(2);

      thread.storeLocal(
        indexbyte,
        (thread.loadLocal(indexbyte) + constbyte) | 0
      );
      return;
  }
  throw new Error('Invalid opcode');
}

export function runMultianewarray(thread: NativeThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC());
  thread.offsetPc(2);
  const arrayTypeIdx = thread
    .getClass()
    .getConstant(indexbyte) as ConstantClassInfo;
  const arrayType = (
    thread.getClass().getConstant(arrayTypeIdx.nameIndex) as ConstantUtf8Info
  ).value;

  const dimensions = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);

  const dimArray = [];
  for (let i = 0; i < dimensions; i++) {
    const dim = thread.popStack();

    if (dim < 0) {
      thread.throwNewException(
        'java/lang/NegativeArraySizeException',
        'Negative array size'
      );
      return;
    }
    dimArray[dimensions - i - 1] = dim;
  }

  let currentType = arrayType.slice(1); // first item '['
  const res = new JavaArray(dimArray[0], currentType);
  let pendingInit = [res];
  let nextInit = [];

  for (let i = 1; i < dimensions; i++) {
    const len = dimArray[i];
    const descriptor: any = parseFirstDescriptor(currentType);

    switch (descriptor.type) {
      case JavaType.boolean:
        descriptor.type = ArrayPrimitiveType.boolean;
        break;
      case JavaType.char:
        descriptor.type = ArrayPrimitiveType.char;
        break;
      case JavaType.float:
        descriptor.type = ArrayPrimitiveType.float;
        break;
      case JavaType.double:
        descriptor.type = ArrayPrimitiveType.double;
        break;
      case JavaType.byte:
        descriptor.type = ArrayPrimitiveType.byte;
        break;
      case JavaType.short:
        descriptor.type = ArrayPrimitiveType.short;
        break;
      case JavaType.int:
        descriptor.type = ArrayPrimitiveType.int;
        break;
      case JavaType.long:
        descriptor.type = ArrayPrimitiveType.long;
        break;
      case JavaType.array:
        descriptor.type = currentType.slice(1);
        break;
      case JavaType.reference:
        descriptor.type = currentType.slice(1);
        break;
    }

    currentType = currentType.slice(descriptor.index);

    for (const arr of pendingInit) {
      for (let j = 0; j < dimArray[i]; j++) {
        const newArr = new JavaArray(len, descriptor.type);
        arr.set(j, newArr);
        nextInit.push(newArr);
      }
    }

    if (len === 0) {
      break;
    }

    pendingInit = nextInit;
    nextInit = [];
  }

  thread.pushStack(res);
}

export function runIfnull(thread: NativeThread): void {
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);

  const ref = thread.popStack() as JavaReference;
  if (ref === null) {
    thread.offsetPc(branchbyte - 3);
    return;
  }
}

export function runIfnonnull(thread: NativeThread): void {
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);

  const ref = thread.popStack() as JavaReference;
  if (ref !== null) {
    thread.offsetPc(branchbyte - 3);
    return;
  }
}

export function runGotoW(thread: NativeThread): void {
  const branchbyte = thread.getCode().getInt32(thread.getPC());
  thread.offsetPc(branchbyte - 1);
}

export function runJsrW(thread: NativeThread): void {
  const branchbyte = thread.getCode().getInt32(thread.getPC());
  thread.offsetPc(4);
  thread.pushStack(thread.getPC());
  thread.setPc(thread.getPC() + branchbyte - 5);
}
