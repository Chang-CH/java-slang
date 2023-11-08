import Thread from '#jvm/components/Thread/Thread';
import { JNI } from '../..';

export const registerSource = (jni: JNI) => {
  jni.registerNativeMethod(
    'Source',
    'display(I)V',
    (thread: Thread, locals: any[]) => {
      console.log(locals[0]);
      thread.returnSF();
    }
  );
};
