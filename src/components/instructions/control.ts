import Thread from '#jvm/components/thread/thread';
import { asDouble, asFloat } from '#utils/index';

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

// TODO: test
export function runTableswitch(thread: Thread): void {
  let offset = thread.getPC() + 1;
  if (offset % 4 !== 0) {
    offset += 4 - (offset % 4); // padding
  }

  const def = thread.getCode().getInt32(offset);
  offset += 4;
  const low = thread.getCode().getInt32(offset);
  offset += 4;
  const high = thread.getCode().getInt32(offset);
  offset += 4;

  const index = thread.popStack();
  if (index < low || index > high) {
    thread.offsetPc(def);
    return;
  }

  const offsets = []; // 0 indexed
  for (let i = 0; i < high - low + 1; i++) {
    offsets.push(thread.getCode().getInt32(offset));
    offset += 4;
  }

  thread.offsetPc(offsets[index - low]);
}

// TODO: test
export function runLookupswitch(thread: Thread): void {
  let offset = thread.getPC() + 1;
  if (offset % 4 !== 0) {
    offset += 4 - (offset % 4); // padding
  }

  const def = thread.getCode().getInt32(offset);
  offset += 4;
  const npairCount = thread.getCode().getInt32(offset);
  offset += 4;

  const value = thread.popStack();

  for (let i = 0; i < npairCount; i++) {
    const key = thread.getCode().getInt32(offset);
    if (key === value) {
      const nextPcOffset = thread.getCode().getInt32(offset + 4);
      thread.offsetPc(nextPcOffset);
      return;
    }
    offset += 8;
  }

  thread.offsetPc(def);
}

function _return(thread: Thread, ret?: any, isWide?: boolean): void {
  thread.offsetPc(1);

  const method = thread.getMethod();
  if (method.checkSynchronized()) {
    if (method.checkStatic()) {
      method.getClass().getJavaObject().getMonitor().exit(thread);
    } else {
      thread.loadLocal(0).getMonitor().exit(thread);
    }
  }

  if (isWide) {
    thread.returnStackFrame64(ret);
  } else {
    thread.returnStackFrame(ret);
  }
}

export function runIreturn(thread: Thread): void {
  thread.getMethod().getArgs;
  const ret = thread.popStack();
  _return(thread, ret);
}

export function runLreturn(thread: Thread): void {
  const ret = thread.popStack64();
  _return(thread, ret, true);
}

export function runFreturn(thread: Thread): void {
  const ret = asFloat(thread.popStack());
  _return(thread, ret);
}

export function runDreturn(thread: Thread): void {
  const ret = asDouble(thread.popStack64());
  _return(thread, ret, true);
}

export function runAreturn(thread: Thread): void {
  const ret = thread.popStack();
  _return(thread, ret);
}

export function runReturn(thread: Thread): void {
  _return(thread);
}
