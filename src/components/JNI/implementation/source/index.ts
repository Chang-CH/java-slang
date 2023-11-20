import Thread from '#jvm/components/thread';
import { JvmObject } from '#types/reference/Object';
import { j2jsString } from '#utils/index';
import { JNI } from '../..';

export const registerSource = (jni: JNI) => {
  jni.registerNativeMethod(
    'Source',
    'display(I)V',
    (thread: Thread, locals: any[]) => {
      console.log(locals[0]);
      thread.returnStackFrame();
    }
  );
  jni.registerNativeMethod(
    'Source',
    'display(Ljava/lang/String;)V',
    (thread: Thread, locals: any[]) => {
      const strObj = locals[0] as JvmObject;
      const str = j2jsString(strObj);
      console.log(str);
      thread.returnStackFrame();
    }
  );

  jni.registerNativeMethod(
    'dynamic/Source',
    'display(Ljava/lang/String;)V',
    (thread: Thread, locals: any[]) => {
      const strObj = locals[0] as JvmObject;
      const str = j2jsString(strObj);
      console.log('\x1b[31m' + 'SOURCE SHOULD BE GLOBAL' + '\x1b[0m');
      console.log(str);
      thread.returnStackFrame();
    }
  );
};
