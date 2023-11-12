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

  jni.registerNativeMethod(
    'java/lang/Object',
    'clone()Ljava/lang/Object;',
    (thread: Thread, locals: any[]) => {
      const obj = locals[0];
      const clone = obj.clone();
      thread.returnSF(clone);
    }
  );

  jni.registerNativeMethod(
    'java/lang/Object',
    'hashCode()I',
    (thread: Thread, locals: any[]) => {
      const obj = locals[0];
      thread.returnSF(obj.hashCode());
    }
  );
};
