import Thread from '#jvm/components/thread';
import type { JvmObject } from '#types/reference/Object';
import { j2jsString } from '#utils/index';
import { JNI } from '../..';

export const registerSource = (jni: JNI) => {
  jni.registerNativeMethod(
    'Source',
    'display(I)V',
    (thread: Thread, locals: any[]) => {
      const system = thread.getJVM().getSystem();
      system.stdout(locals[0]);
      thread.returnStackFrame();
    }
  );
  jni.registerNativeMethod(
    'Source',
    'display(Ljava/lang/String;)V',
    (thread: Thread, locals: any[]) => {
      const strObj = locals[0] as JvmObject;
      const str = j2jsString(strObj);
      const system = thread.getJVM().getSystem();
      system.stdout(str);
      thread.returnStackFrame();
    }
  );

  jni.registerNativeMethod(
    'dynamic/Source',
    'display(Ljava/lang/String;)V',
    (thread: Thread, locals: any[]) => {
      const strObj = locals[0] as JvmObject;
      const str = j2jsString(strObj);
      const system = thread.getJVM().getSystem();
      system.stdout('SOURCE SHOULD BE GLOBAL');
      system.stdout(str);
      thread.returnStackFrame();
    }
  );
};
