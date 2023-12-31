import Thread from '#jvm/components/thread/thread';
import type { JvmObject } from '#types/reference/Object';
import { j2jsString } from '#utils/index';

const functions = {
  'display(I)V': (thread: Thread, locals: any[]) => {
    const system = thread.getJVM().getSystem();
    system.stdout(locals[0]);
    thread.returnStackFrame();
  },

  'display(Ljava/lang/String;)V': (thread: Thread, locals: any[]) => {
    const strObj = locals[0] as JvmObject;
    const str = j2jsString(strObj);
    const system = thread.getJVM().getSystem();
    system.stdout(str);
    thread.returnStackFrame();
  },
};

export default functions;
