import Thread from '#jvm/components/Thread/Thread';
import { asDouble, asFloat } from '../Interpreter/utils';

export function runGoto(thread: Thread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(branchbyte - 1);
}

/**
 * Used to implement finally. pushes pc + 3 onto stack, then goto pc + branchbyte
 * @param thread
 */
export function runJsr(thread: Thread): void {
  thread.offsetPc(1);
  const branchbyte = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);
  thread.pushStack(thread.getPC());
  thread.setPc(thread.getPC() + branchbyte - 3);
}

export function runRet(thread: Thread): void {
  thread.offsetPc(1);
  const index = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);
  const retAddr = thread.loadLocal(index);
  thread.setPc(retAddr);
}

export function runTableswitch(thread: Thread): void {
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

export function runLookupswitch(thread: Thread): void {
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

export function runIreturn(thread: Thread): void {
  thread.offsetPc(1);
  console.warn('IRETURN: monitor not implemented jvms 6.5');
  const ret = thread.popStack();
  thread.returnSF(ret);
}

export function runLreturn(thread: Thread): void {
  thread.offsetPc(1);
  console.warn('LRETURN: monitor not implemented jvms 6.5');
  const ret = thread.popStack64();
  thread.returnSF(ret, null, true);
}

export function runFreturn(thread: Thread): void {
  thread.offsetPc(1);
  console.warn('FRETURN: monitor not implemented jvms 6.5');
  const ret = asFloat(thread.popStack());
  thread.returnSF(ret);
}

export function runDreturn(thread: Thread): void {
  thread.offsetPc(1);
  console.warn('DRETURN: monitor not implemented jvms 6.5');
  const ret = asDouble(thread.popStack64());
  thread.returnSF(ret, null, true);
}

export function runAreturn(thread: Thread): void {
  thread.offsetPc(1);
  console.warn('ARETURN: monitor not implemented jvms 6.5');
  const ret = thread.popStack();
  thread.returnSF(ret);
}

export function runReturn(thread: Thread): void {
  thread.offsetPc(1);
  console.warn('RETURN: monitor not implemented jvms 6.5');
  thread.returnSF();
}