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

  'wait(J)V': (thread: Thread, locals: any[]) => {
    const obj = locals[0] as JvmObject;
    const monitor = obj.getMonitor();
    monitor.wait(thread, locals[1]);
    thread.returnStackFrame();
  },
  'notifyAll()V': (thread: Thread, locals: any[]) => {
    const obj = locals[0] as JvmObject;
    const monitor = obj.getMonitor();
    monitor.notifyAll(thread);
    thread.returnStackFrame();
  },
};

export default functions;
