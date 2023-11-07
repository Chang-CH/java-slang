import Thread from '#jvm/components/Thread/Thread';
import { JNI } from '../..';

export const registerSource = (jni: JNI) => {
  jni.registerNativeMethod(
    'source/Source',
    'println(I)V',
    (thread: Thread, locals: any[]) => console.log(locals[0])
  );
};
