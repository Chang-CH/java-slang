import Thread from '#jvm/components/thread';

const functions = {
  'initIDs()V': (thread: Thread, locals: any[]) => {
    console.warn('FileInputStream.initIDs()V not implemented');
    thread.returnStackFrame();
  },
};

export default functions;
