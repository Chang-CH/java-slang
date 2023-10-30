import JvmThread from '#types/reference/Thread';
import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import { asFloat, asDouble, parseFirstDescriptor } from '..';
import {
  ConstantClassInfo,
  ConstantUtf8Info,
} from '#jvm/external/ClassFile/types/constants';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';

export function runWide(thread: JvmThread): void {
  thread.offsetPc(1);
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

export function runMultianewarray(thread: JvmThread): void {
  thread.offsetPc(1);
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

  let currentType = arrayType;
  const classResolutionResult = thread
    .getClass()
    .getLoader()
    .getClassRef(currentType);
  if (classResolutionResult.error || !classResolutionResult.result) {
    thread.throwNewException(
      classResolutionResult.error ?? 'java/lang/ClassNotFoundException',
      ''
    );
    return;
  }

  const arrayCls = classResolutionResult.result;
  const res = arrayCls.instantiate() as JvmArray;
  res.initialize(dimArray[0]);

  let pendingInit = [res];
  let nextInit = [];

  for (let i = 1; i < dimensions; i++) {
    currentType = currentType.slice(1); // remove leading '[', array type should be '[[[...'
    const len = dimArray[i];

    const classResolutionResult = thread
      .getClass()
      .getLoader()
      .getClassRef(currentType);
    if (classResolutionResult.error || !classResolutionResult.result) {
      thread.throwNewException(
        classResolutionResult.error ?? 'java/lang/ClassNotFoundException',
        ''
      );
      return;
    }
    const arrayCls = classResolutionResult.result;

    for (const arr of pendingInit) {
      for (let j = 0; j < dimArray[i]; j++) {
        const obj = arrayCls.instantiate() as JvmArray;
        obj.initialize(dimArray[i]);
        arr.set(j, obj);
        nextInit.push(obj);
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

export function runIfnull(thread: JvmThread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);

  const ref = thread.popStack() as JvmObject;
  if (ref === null) {
    thread.offsetPc(branchbyte - 3);
    return;
  }
}

export function runIfnonnull(thread: JvmThread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);

  const ref = thread.popStack() as JvmObject;
  if (ref !== null) {
    thread.offsetPc(branchbyte - 3);
    return;
  }
}

export function runGotoW(thread: JvmThread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt32(thread.getPC());
  thread.offsetPc(branchbyte - 1);
}

export function runJsrW(thread: JvmThread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt32(thread.getPC());
  thread.offsetPc(4);
  thread.pushStack(thread.getPC());
  thread.setPc(thread.getPC() + branchbyte - 5);
}
