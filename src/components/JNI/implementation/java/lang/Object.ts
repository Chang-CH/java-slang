import { JNI } from '#jvm/components/JNI';
import Thread from '#jvm/components/Thread/Thread';

export const registerJavaLangObject = (jni: JNI) => {
  jni.registerNativeMethod(
    'java/lang/Object',
    'registerNatives()V',
    (thread: Thread, locals: any[]) => {
      thread.returnSF();
    }
  );

  jni.registerNativeMethod(
    'java/lang/Object',
    'getClass()Ljava/lang/Class;',
    (thread: Thread, locals: any[]) => {
      const obj = locals[0];
      thread.returnSF(obj.getClass().getJavaObject());
    }
  );
};
