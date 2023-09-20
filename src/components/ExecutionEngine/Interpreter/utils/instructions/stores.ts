import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';

import { InstructionType } from '../readInstruction';
import { JavaArray } from '#types/dataTypes';

export function runIstore(thread: NativeThread, instruction: InstructionType) {
  thread.storeLocal(instruction.operands[0], thread.popStack());
  thread.offsetPc(2);
}

export function runLstore(thread: NativeThread, instruction: InstructionType) {
  thread.storeLocal64(instruction.operands[0], thread.popStack());
  thread.offsetPc(2);
}

export function runFstore(thread: NativeThread, instruction: InstructionType) {
  thread.storeLocal(instruction.operands[0], thread.popStack());
  thread.offsetPc(2);
}

export function runDstore(thread: NativeThread, instruction: InstructionType) {
  thread.storeLocal64(instruction.operands[0], thread.popStack64());
  thread.offsetPc(2);
}

export function runAstore(thread: NativeThread, instruction: InstructionType) {
  thread.storeLocal(instruction.operands[0], thread.popStack());
  thread.offsetPc(2);
}

export function runIstore0(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(0, value);
  thread.offsetPc(1);
}

export function runIstore1(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(1, value);
  thread.offsetPc(1);
}

export function runIstore2(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(2, value);
  thread.offsetPc(1);
}

export function runIstore3(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(3, value);
  thread.offsetPc(1);
}

export function runLstore0(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal64(0, value);
  thread.offsetPc(1);
}

export function runLstore1(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal64(1, value);
  thread.offsetPc(1);
}

export function runLstore2(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal64(2, value);
  thread.offsetPc(1);
}

export function runLstore3(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal64(3, value);
  thread.offsetPc(1);
}

export function runFstore0(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(0, value);
  thread.offsetPc(1);
}

export function runFstore1(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(1, value);
  thread.offsetPc(1);
}

export function runFstore2(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(2, value);
  thread.offsetPc(1);
}

export function runFstore3(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(3, value);
  thread.offsetPc(1);
}

export function runDstore0(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack64();
  thread.storeLocal64(0, value);
  thread.offsetPc(1);
}

export function runDstore1(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack64();
  thread.storeLocal64(1, value);
  thread.offsetPc(1);
}

export function runDstore2(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack64();
  thread.storeLocal64(2, value);
  thread.offsetPc(1);
}

export function runDstore3(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack64();
  thread.storeLocal64(3, value);
  thread.offsetPc(1);
}

export function runAstore0(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(0, value);
  thread.offsetPc(1);
}

export function runAstore1(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(1, value);
  thread.offsetPc(1);
}

export function runAstore2(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(2, value);
  thread.offsetPc(1);
}

export function runAstore3(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  thread.storeLocal(3, value);
  thread.offsetPc(1);
}

export function runIastore(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;
  console.warn('iastore: exceptions possibly not thrown');
  arrayref.set(index, value);
  thread.offsetPc(1);
}

export function runLastore(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;
  console.warn('lastore: exceptions possibly not thrown');
  arrayref.set(index, value);
  thread.offsetPc(1);
}

export function runFastore(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;
  console.warn('fastore: exceptions possibly not thrown');
  arrayref.set(index, value);
  thread.offsetPc(1);
}

export function runDastore(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;
  console.warn('dastore: exceptions possibly not thrown');
  arrayref.set(index, value);
  thread.offsetPc(1);
}

export function runAastore(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;
  console.warn('aastore: exceptions possibly not thrown');
  arrayref.set(index, value);
  thread.offsetPc(1);
}

export function runBastore(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;
  console.warn('bastore: exceptions possibly not thrown');
  arrayref.set(index, value);
  thread.offsetPc(1);
}

export function runCastore(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;
  console.warn('castore: exceptions possibly not thrown');
  arrayref.set(index, value);
  thread.offsetPc(1);
}

export function runSastore(thread: NativeThread, instruction: InstructionType) {
  const value = thread.popStack();
  const index = thread.popStack();
  const arrayref = thread.popStack() as JavaArray;
  console.warn('sastore: exceptions possibly not thrown');
  arrayref.set(index, value);
  thread.offsetPc(1);
}
