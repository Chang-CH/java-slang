import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import { asDouble, asFloat } from '..';

export function runGoto(thread: NativeThread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(branchbyte - 1);
}

/**
 * Used to implement finally. pushes pc + 3 onto stack, then goto pc + branchbyte
 * @param thread
 */
export function runJsr(thread: NativeThread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);
  thread.pushStack(thread.getPC());
  thread.setPc(thread.getPC() + branchbyte - 3);
}

export function runRet(thread: NativeThread): void {
  thread.offsetPc(1);
  const index = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);
  const retAddr = thread.loadLocal(index);
  thread.setPc(retAddr);
}

export function runTableswitch(thread: NativeThread): void {
  thread.offsetPc(1);
  thread.offsetPc(thread.getPC() % 4); // padding

  const def = thread.getCode().getInt32(thread.getPC());
  thread.offsetPc(4);
  const low = thread.getCode().getInt32(thread.getPC());
  thread.offsetPc(4);
  const high = thread.getCode().getInt32(thread.getPC());
  thread.offsetPc(4);

  const offsets = []; // 0 indexed
  for (let i = 0; i < high - low + 1; i++) {
    offsets.push(thread.getCode().getInt32(thread.getPC()));
    thread.offsetPc(4);
  }
  throw new Error('runInstruction: Not implemented');
}

export function runLookupswitch(thread: NativeThread): void {
  thread.offsetPc(1);
  if (thread.getPC() % 4 !== 0) {
    thread.offsetPc(thread.getPC() % 4); // padding
  }

  const def = thread.getCode().getInt32(thread.getPC());
  thread.offsetPc(4);
  const npairCount = thread.getCode().getInt32(thread.getPC());
  thread.offsetPc(4);

  const npairs = []; // 0 indexed
  for (let i = 0; i < npairCount; i++) {
    npairs.push(thread.getCode().getInt32(thread.getPC()));
    thread.offsetPc(4);
  }
  throw new Error('runInstruction: Not implemented');
}

export function runIreturn(thread: NativeThread): void {
  thread.offsetPc(1);
  console.warn('IRETURN: monitor not implemented jvms 6.5');
  const ret = thread.popStack();
  thread.popStackFrame();
  thread.pushStack(ret);
}

export function runLreturn(thread: NativeThread): void {
  thread.offsetPc(1);
  console.warn('IRETURN: monitor not implemented jvms 6.5');
  const ret = thread.popStack64();
  thread.popStackFrame();
  thread.pushStack64(ret);
}

export function runFreturn(thread: NativeThread): void {
  thread.offsetPc(1);
  console.warn('IRETURN: monitor not implemented jvms 6.5');
  const ret = asFloat(thread.popStack());
  thread.popStackFrame();
  thread.pushStack(ret);
}

export function runDreturn(thread: NativeThread): void {
  thread.offsetPc(1);
  console.warn('IRETURN: monitor not implemented jvms 6.5');
  const ret = asDouble(thread.popStack64());
  thread.popStackFrame();
  thread.pushStack64(ret);
}

export function runAreturn(thread: NativeThread): void {
  thread.offsetPc(1);
  console.warn('IRETURN: monitor not implemented jvms 6.5');
  const ret = thread.popStack();
  thread.popStackFrame();
  console.log('areturn: ', ret);
  thread.pushStack(ret);
}

export function runReturn(thread: NativeThread): void {
  thread.offsetPc(1);
  console.warn('IRETURN: monitor not implemented jvms 6.5');
  thread.popStackFrame();
}
