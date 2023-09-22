import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import { asDouble, asFloat } from '..';

export function runGoto(thread: NativeThread) {
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(branchbyte - 3);
}

export function runJsr(thread: NativeThread) {
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);
  thread.pushStack(branchbyte);
}

export function runRet(thread: NativeThread) {
  const index = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);
  const retAddr = thread.loadLocal(index);
  // TODO: update pc to retAddr
  throw new Error('runInstruction: ret not implemented');
}

export function runTableswitch(thread: NativeThread) {
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

export function runLookupswitch(thread: NativeThread) {
  if (thread.getPC() % 4 !== 0) {
    thread.offsetPc((thread.getPC() % 4)); // padding
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

export function runIreturn(thread: NativeThread) {
  const ret = thread.popStack();
  thread.popStackFrame();
  thread.pushStack(ret);
}

export function runLreturn(thread: NativeThread) {
  const ret = thread.popStack64();
  thread.popStackFrame();
  thread.pushStack64(ret);
}

export function runFreturn(thread: NativeThread) {
  const ret = asFloat(thread.popStack());
  thread.popStackFrame();
  thread.pushStack(ret);
}

export function runDreturn(thread: NativeThread) {
  const ret = asDouble(thread.popStack64());
  thread.popStackFrame();
  thread.pushStack64(ret);
}

export function runAreturn(thread: NativeThread) {
  const ret = thread.popStack();
  thread.popStackFrame();
  thread.pushStack(ret);
}

export function runReturn(thread: NativeThread) {
  thread.popStackFrame();
}
