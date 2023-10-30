import Thread from '#jvm/components/Threads/Thread';

export function runBreakpoint(thread: Thread): void {
  thread.offsetPc(1);
  throw new Error('runInstruction: Not implemented');
}

export function runImpdep1(thread: Thread): void {
  thread.offsetPc(1);
  throw new Error('runInstruction: Not implemented');
}

export function runImpdep2(thread: Thread): void {
  thread.offsetPc(1);
  throw new Error('runInstruction: Not implemented');
}
