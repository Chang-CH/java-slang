import Thread from '#jvm/components/thread';

const functions = {
  'availableProcessors()I': (thread: Thread, locals: any[]) => {
    thread.returnStackFrame(1);
  },
};
export default functions;
