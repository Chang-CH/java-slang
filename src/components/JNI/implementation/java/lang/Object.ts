import { JNI } from '#jvm/components/JNI';
import Thread from '#jvm/components/thread';
import { JvmObject } from '#types/reference/Object';

export const registerJavaLangObject = (jni: JNI) => {
  jni.registerNativeMethod(
    'java/lang/Object',
    'registerNatives()V',
    (thread: Thread, locals: any[]) => {
      thread.returnStackFrame();
    }
  );

  jni.registerNativeMethod(
    'java/lang/Object',
    'getClass()Ljava/lang/Class;',
    (thread: Thread, locals: any[]) => {
      const obj = locals[0];
      thread.returnStackFrame(obj.getClass().getJavaObject());
    }
  );

  jni.registerNativeMethod(
    'java/lang/Object',
    'clone()Ljava/lang/Object;',
    (thread: Thread, locals: any[]) => {
      const obj = locals[0] as JvmObject;
      const clone = obj.clone();
      thread.returnStackFrame(clone);
    }
  );

  jni.registerNativeMethod(
    'java/lang/Object',
    'hashCode()I',
    (thread: Thread, locals: any[]) => {
      const obj = locals[0];
      thread.returnStackFrame(obj.hashCode());
    }
  );
};
