import { JNI } from '#jvm/components/JNI';
import Thread from '#jvm/components/Thread/Thread';
import { JvmObject } from '#types/reference/Object';

export const registerJavaSecurityAccessController = (jni: JNI) => {
  jni.registerNativeMethod(
    'java/security/AccessController',
    'doPrivileged(Ljava/security/PrivilegedExceptionAction;)Ljava/lang/Object;',
    (thread: Thread, locals: any[]) => {
      const action = locals[0] as JvmObject;
      const actionCls = action.getClass();
      const methodRes = actionCls.resolveMethod(
        'run()Ljava/lang/Object;',
        thread.getClass()
      );

      if (!methodRes.checkSuccess()) {
        const err = methodRes.getError();
        thread.throwNewException(err.className, err.msg);
        return null;
      }
      const methodRef = methodRes.getResult();
      thread.invokeSf(
        methodRef.getClass(),
        methodRef,
        0,
        [action],
        (ret: JvmObject) => {
          console.debug(
            'RUN doPrivileged(Ljava/security/PrivilegedExceptionAction;)Ljava/lang/Object;',
            { ...ret, cls: null }
          );
          thread.returnSF();
          thread.returnSF(ret);
        }
      );
    }
  );

  jni.registerNativeMethod(
    'java/security/AccessController',
    'doPrivileged(Ljava/security/PrivilegedAction;)Ljava/lang/Object;',
    (thread: Thread, locals: any[]) => {
      const action = locals[0] as JvmObject;
      const loader = thread.getClass().getLoader();
      const acRes = loader.getClassRef('java/security/AccessController');
      if (acRes.checkError()) {
        const err = acRes.getError();
        thread.throwNewException(err.className, err.msg);
        return;
      }
      const acCls = acRes.getResult();

      const paRes = loader.getClassRef('java/security/PrivilegedAction');
      if (paRes.checkError()) {
        const err = paRes.getError();
        thread.throwNewException(err.className, err.msg);
        return;
      }

      const paCls = paRes.getResult();
      const mRes = paCls.resolveMethod('run()Ljava/lang/Object;', acCls);
      if (mRes.checkError()) {
        const err = mRes.getError();
        thread.throwNewException(err.className, err.msg);
        return;
      }
      const mRef = mRes.getResult();

      const runtimeCls = action.getClass();
      const lRes = runtimeCls.lookupMethod('run()Ljava/lang/Object;', mRef);
      if (lRes.checkError()) {
        const err = lRes.getError();
        thread.throwNewException(err.className, err.msg);
        return;
      }
      const method = lRes.getResult();
      if (!method) {
        thread.throwNewException(
          'java/lang/NoSuchMethodException',
          'run()Ljava/lang/Object;'
        );
        return;
      }

      thread.returnSF();
      thread.invokeSf(runtimeCls, method, 0, [action]);
    }
  );
};
