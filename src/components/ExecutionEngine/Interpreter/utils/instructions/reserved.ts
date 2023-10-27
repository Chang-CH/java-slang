import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';

export function runBreakpoint(thread: NativeThread): void {
  thread.offsetPc(1);
  throw new Error('runInstruction: Not implemented');
}

export function runImpdep1(thread: NativeThread): void {
  thread.offsetPc(1);
  throw new Error('runInstruction: Not implemented');
}

export function runImpdep2(thread: NativeThread): void {
  thread.offsetPc(1);
  throw new Error('runInstruction: Not implemented');
}
