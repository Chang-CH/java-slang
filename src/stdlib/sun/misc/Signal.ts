import Thread from '#jvm/components/thread';
import { logger } from '#utils/index';

const functions = {
  'findSignal(Ljava/lang/String;)I': (thread: Thread, locals: any[]) => {
    logger.warn('Signal.findSignal(Ljava/lang/String;)I not implemented');
    thread.returnStackFrame(-1);
  },
};

export default functions;
