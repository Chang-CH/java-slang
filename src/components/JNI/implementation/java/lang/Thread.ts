import { JNI } from '#jvm/components/JNI';
import Thread, { ThreadStatus } from '#jvm/components/Thread/Thread';

export const registerJavaLangThread = (jni: JNI) => {
  // jni.registerNativeMethod(
  //   'java/lang/Thread',
  //   'isAlive()Z',
  //   (thread: Thread, locals: any[]) => {
  //     const threadObj = locals[0] as JvmObject;
  //     const t = threadObj.getNativeField('thread') as Thread;
  //     const status = t.getStatus();
  //     if (status === ThreadStatus.TERMINATED || status === ThreadStatus.NEW) {
  //       thread.returnSF(0);
  //     }
  //     thread.returnSF(1);
  //   }
  // );
  jni.registerNativeMethod(
    'java/lang/Thread',
    'setPriority0(I)V',
    (thread: Thread, locals: any[]) => {
      // priority field of the thread object is already set.
      // method serves to update our internal priority if we decide to use it.
      thread.returnStackFrame();
    }
  );

  jni.registerNativeMethod(
    'java/lang/Thread',
    'registerNatives()V',
    (thread: Thread, locals: any[]) => {
      thread.returnStackFrame();
    }
  );
  jni.registerNativeMethod(
    'java/lang/Thread',
    'currentThread()Ljava/lang/Thread;',
    (thread: Thread, locals: any[]) => {
      const threadObj = thread.getJavaObject();
      thread.returnStackFrame(threadObj);
    }
  );

  jni.registerNativeMethod(
    'java/lang/Thread',
    'sleep(J)V',
    (thread: Thread, locals: any[]) => {
      thread.setStatus(ThreadStatus.TIMED_WAITING);
      thread.returnStackFrame();
      setTimeout(
        () => {
          thread.setStatus(ThreadStatus.RUNNABLE);
        },
        Number(locals[0] as BigInt)
      );
    }
  );
};
