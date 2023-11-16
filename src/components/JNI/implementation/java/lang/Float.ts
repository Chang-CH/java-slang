import { JNI } from '#jvm/components/JNI';
import Thread from '#jvm/components/Thread/Thread';

export const registerJavaLangFloat = (jni: JNI) => {
  const dataview = new DataView(new ArrayBuffer(8));
  jni.registerNativeMethod(
    'java/lang/Float',
    'floatToRawIntBits(F)I',
    (thread: Thread, locals: any[]) => {
      const float = locals[0];
      dataview.setFloat32(0, float);
      thread.returnStackFrame(dataview.getInt32(0));
    }
  );
};
