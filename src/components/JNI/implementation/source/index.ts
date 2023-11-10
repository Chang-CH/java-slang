import Thread from '#jvm/components/Thread/Thread';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';
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
  jni.registerNativeMethod(
    'Source',
    'display(Ljava/lang/String;)V',
    (thread: Thread, locals: any[]) => {
      const strObj = locals[0] as JvmObject;
      const cArr = strObj._getField(
        'value',
        '[C',
        'java/lang/String'
      ) as JvmArray;
      const str = String.fromCharCode(...cArr.getJsArray());
      console.log(str);
      thread.returnSF();
    }
  );
};
