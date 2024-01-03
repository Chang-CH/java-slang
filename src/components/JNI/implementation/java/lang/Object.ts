import Thread from '#jvm/components/thread';
import type { JvmObject } from '#types/reference/Object';

const functions = {
  'registerNatives()V': (thread: Thread, locals: any[]) => {
    thread.returnStackFrame();
  },
  'getClass()Ljava/lang/Class;': (thread: Thread, locals: any[]) => {
    const obj = locals[0];
    thread.returnStackFrame(obj.getClass().getJavaObject());
  },
  'clone()Ljava/lang/Object;': (thread: Thread, locals: any[]) => {
    const obj = locals[0] as JvmObject;
    const clone = obj.clone();
    thread.returnStackFrame(clone);
  },
  'hashCode()I': (thread: Thread, locals: any[]) => {
    const obj = locals[0];
    thread.returnStackFrame(obj.hashCode());
  },
};

export default functions;
