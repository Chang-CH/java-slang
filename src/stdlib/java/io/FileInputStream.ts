import Thread from '#jvm/components/thread';
import { logger } from '#utils/index';

const functions = {
  'initIDs()V': (thread: Thread, locals: any[]) => {
    logger.warn('FileInputStream.initIDs()V not implemented');
    thread.returnStackFrame();
  },
};

export default functions;
