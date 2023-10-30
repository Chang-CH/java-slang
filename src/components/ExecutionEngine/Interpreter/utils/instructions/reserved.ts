import JvmThread from '#types/reference/Thread';

export function runBreakpoint(thread: JvmThread): void {
  thread.offsetPc(1);
  throw new Error('runInstruction: Not implemented');
}

export function runImpdep1(thread: JvmThread): void {
  thread.offsetPc(1);
  throw new Error('runInstruction: Not implemented');
}

export function runImpdep2(thread: JvmThread): void {
  thread.offsetPc(1);
  throw new Error('runInstruction: Not implemented');
}
