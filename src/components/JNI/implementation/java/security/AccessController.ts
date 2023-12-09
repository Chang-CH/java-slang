import { JNI } from '#jvm/components/JNI';
import { InternalStackFrame } from '#jvm/components/stackframe';
import { JavaStackFrame } from '#jvm/components/stackframe';
import Thread from '#jvm/components/thread';
import { checkSuccess, checkError } from '#types/Result';
import { Method } from '#types/class/Method';
import type { JvmObject } from '#types/reference/Object';

export const registerJavaSecurityAccessController = (jni: JNI) => {
  const doPrivileged = (thread: Thread, locals: any[]) => {
    const action = locals[0] as JvmObject;
    const actionCls = action.getClass();
    const methodRes = actionCls.resolveMethod(
      'run()Ljava/lang/Object;',
      thread.getClass()
    );

    if (!checkSuccess(methodRes)) {
      thread.throwNewException(methodRes.exceptionCls, methodRes.msg);
      return null;
    }
    const methodRef = methodRes.result as Method;
    thread.invokeStackFrame(
      new InternalStackFrame(
        methodRef.getClass(),
        methodRef,
        0,
        [action],
        (ret: JvmObject) => {
          console.debug(
            'RUN doPrivileged(Ljava/security/PrivilegedExceptionAction;)Ljava/lang/Object;',
            { ...ret, cls: null }
          );
          thread.returnStackFrame();
          thread.returnStackFrame(ret);
        }
      )
    );
  };

  jni.registerNativeMethod(
    'java/security/AccessController',
    'doPrivileged(Ljava/security/PrivilegedExceptionAction;Ljava/security/AccessControlContext;)Ljava/lang/Object;',
    doPrivileged
  );
  jni.registerNativeMethod(
    'java/security/AccessController',
    'doPrivileged(Ljava/security/PrivilegedExceptionAction;)Ljava/lang/Object;',
    doPrivileged
  );

  jni.registerNativeMethod(
    'java/security/AccessController',
    'doPrivileged(Ljava/security/PrivilegedAction;)Ljava/lang/Object;',
    (thread: Thread, locals: any[]) => {
      const action = locals[0] as JvmObject;
      const loader = thread.getClass().getLoader();
      const acRes = loader.getClassRef('java/security/AccessController');
      if (checkError(acRes)) {
        thread.throwNewException(acRes.exceptionCls, acRes.msg);
        return;
      }
      const acCls = acRes.result;

      const paRes = loader.getClassRef('java/security/PrivilegedAction');
      if (checkError(paRes)) {
        thread.throwNewException(paRes.exceptionCls, paRes.msg);
        return;
      }

      const paCls = paRes.result;
      const mRes = paCls.resolveMethod('run()Ljava/lang/Object;', acCls);
      if (checkError(mRes)) {
        thread.throwNewException(mRes.exceptionCls, mRes.msg);
        return;
      }
      const mRef = mRes.result;

      const runtimeCls = action.getClass();
      const lRes = runtimeCls.lookupMethod('run()Ljava/lang/Object;', mRef);
      if (checkError(lRes)) {
        thread.throwNewException(lRes.exceptionCls, lRes.msg);
        return;
      }
      const method = lRes.result;
      if (!method) {
        thread.throwNewException(
          'java/lang/NoSuchMethodException',
          'run()Ljava/lang/Object;'
        );
        return;
      }

      thread.invokeStackFrame(
        new InternalStackFrame(runtimeCls, method, 0, [action], ret => {
          thread.returnStackFrame(ret);
        })
      );
    }
  );
};
