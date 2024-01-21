import Thread from '#jvm/components/thread';

const functions = {
  'initialize()V': (thread: Thread, locals: any[]) => {
    thread.returnStackFrame();
  },
};

export default functions;
