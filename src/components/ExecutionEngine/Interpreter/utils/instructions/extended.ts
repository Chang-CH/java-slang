import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import { JavaReference } from '#types/dataTypes';
import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';

export function runWide(thread: NativeThread): void {
  const opcode = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);

  const indexbyte = thread.getCode().getUint16(thread.getPC());
  thread.offsetPc(2);

  let constbyte;

  if (opcode == OPCODE.IINC) {
    constbyte = thread.getCode().getUint16(thread.getPC());
    thread.offsetPc(2);
  }

  throw new Error('runInstruction: Not implemented');
}

export function runMultianewarray(thread: NativeThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC());
  thread.offsetPc(2);

  const dimension = thread.getCode().getUint8(thread.getPC());
  if (dimension < 0) {
    throw new Error('dimensions must be >= 1');
  }

  thread.offsetPc(1);
  throw new Error('runInstruction: Not implemented');
}

export function runIfnull(thread: NativeThread): void {
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);

  const ref = thread.popStack() as JavaReference;
  if (ref === null) {
    thread.offsetPc(branchbyte);
    return;
  }
}

export function runIfnonnull(thread: NativeThread): void {
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);

  const ref = thread.popStack() as JavaReference;
  if (ref !== null) {
    thread.offsetPc(branchbyte);
    return;
  }
}

export function runGotoW(thread: NativeThread): void {
  const branchbyte = thread.getCode().getInt32(thread.getPC());
  thread.offsetPc(4);

  thread.offsetPc(branchbyte);
}

export function runJsrW(thread: NativeThread): void {
  const branchbyte = thread.getCode().getInt32(thread.getPC());
  thread.offsetPc(4);

  thread.pushStack64(branchbyte);
}
