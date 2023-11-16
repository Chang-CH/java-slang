import { JNI } from '#jvm/components/JNI';
import Thread from '#jvm/components/Thread/Thread';

export const registerJavaLangDouble = (jni: JNI) => {
  const dataview = new DataView(new ArrayBuffer(8));
  jni.registerNativeMethod(
    'java/lang/Double',
    'doubleToRawLongBits(D)J',
    (thread: Thread, locals: any[]) => {
      const double = locals[0];
      dataview.setFloat64(0, double);
      thread.returnStackFrame64(dataview.getBigInt64(0));
    }
  );
  jni.registerNativeMethod(
    'java/lang/Double',
    'longBitsToDouble(J)D',
    (thread: Thread, locals: any[]) => {
      const long = locals[0];
      dataview.getBigInt64(0, long);
      thread.returnStackFrame64(dataview.getFloat64(0));
    }
  );
};
