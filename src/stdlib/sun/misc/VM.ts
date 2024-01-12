import Thread from '#jvm/components/thread/thread';

const functions = {
  'initialize()V': (thread: Thread, locals: any[]) => {
    thread.returnStackFrame();
  },
};

export default functions;
