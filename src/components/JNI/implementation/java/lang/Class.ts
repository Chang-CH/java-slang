import AbstractClassLoader from '#jvm/components/ClassLoader/AbstractClassLoader';
import { primitiveNameToType } from '#utils/index';
import { JNI } from '#jvm/components/JNI';
import Thread from '#jvm/components/thread';
import { Field } from '#types/class/Field';
import { ArrayClassData } from '#types/class/ArrayClassData';
import { ClassData } from '#types/class/ClassData';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';
import { ErrorResult, checkError, checkSuccess } from '#types/result';
import { j2jsString } from '#utils/index';

export const registerJavaLangClass = (jni: JNI) => {
  const clsName = 'java/lang/Class';
  jni.registerNativeMethod(
    clsName,
    'desiredAssertionStatus0(Ljava/lang/Class;)Z',
    (thread: Thread, locals: any[]) => {
      const clsObj = locals[0] as JvmObject;
      console.warn('Class.desiredAssertionStatus0: assertions disabled');
      thread.returnStackFrame(0);
    }
  );

  jni.registerNativeMethod(
    clsName,
    'registerNatives()V',
    (thread: Thread, locals: any[]) => {
      thread.returnStackFrame();
    }
  );

  jni.registerNativeMethod(
    clsName,
    'getDeclaredFields0(Z)[Ljava/lang/reflect/Field;',
    (thread: Thread, locals: any[]) => {
      const clsObj = locals[0] as JvmObject;
      const publicOnly = locals[1];
      const clsRef = clsObj.getNativeField('classRef') as ClassData;
      const fields = clsRef.getFields();

      const result = [];

      for (const [name, field] of Object.entries(fields)) {
        const refRes = field.getReflectedObject(thread);
        if (checkError(refRes)) {
          thread.returnStackFrame();
          thread.throwNewException(refRes.exceptionCls, refRes.msg);
          return;
        }
        result.push(refRes.result);
      }

      const faClsRes = thread
        .getClass()
        .getLoader()
        .getClassRef('[Ljava/lang/reflect/Field;');
      if (checkError(faClsRes)) {
        thread.returnStackFrame();
        thread.throwNewException(faClsRes.exceptionCls, faClsRes.msg);
        return;
      }
      const faCls = faClsRes.result as ArrayClassData;
      const faObj = faCls.instantiate();
      faObj.initArray(result.length, result);

      thread.returnStackFrame(faObj);
    }
  );

  jni.registerNativeMethod(
    clsName,
    'getPrimitiveClass(Ljava/lang/String;)Ljava/lang/Class;',
    (thread: Thread, locals: any[]) => {
      const javaStr = locals[0] as JvmObject;
      const primitiveName = j2jsString(javaStr);
      const primitiveClsName =
        primitiveNameToType(primitiveName) ?? primitiveName;

      const cls = thread
        .getClass()
        .getLoader()
        .getPrimitiveClassRef(primitiveClsName);
      const initRes = cls.initialize(thread);
      if (!checkSuccess(initRes)) {
        if (checkError(initRes)) {
          thread.throwNewException(initRes.exceptionCls, initRes.msg);
        }
        return;
      }
      thread.returnStackFrame(cls.getJavaObject());
    }
  );

  jni.registerNativeMethod(
    clsName,
    'isArray()Z',
    (thread: Thread, locals: any[]) => {
      const clsObj = locals[0] as JvmObject;
      const clsRef = clsObj.getNativeField('classRef') as ClassData;
      thread.returnStackFrame(ArrayClassData.check(clsRef) ? 1 : 0);
    }
  );
  jni.registerNativeMethod(
    clsName,
    'isPrimitive()Z',
    (thread: Thread, locals: any[]) => {
      const clsObj = locals[0] as JvmObject;
      const clsRef = clsObj.getNativeField('classRef') as ClassData;
      thread.returnStackFrame(clsRef.checkPrimitive() ? 1 : 0);
    }
  );

  jni.registerNativeMethod(
    clsName,
    'getName0()Ljava/lang/String;',
    (thread: Thread, locals: any[]) => {
      const clsObj = locals[0] as JvmObject;
      const clsRef = clsObj.getNativeField('classRef') as ClassData;
      const name = clsRef.getClassname();
      const strRes = thread.getJVM().getInternedString(name);
      thread.returnStackFrame(strRes);
    }
  );

  jni.registerNativeMethod(
    clsName,
    'getComponentType()Ljava/lang/Class;',
    (thread: Thread, locals: any[]) => {
      const clsObj = locals[0] as JvmObject;
      const clsRef = clsObj.getNativeField('classRef') as ClassData;

      if (!ArrayClassData.check(clsRef)) {
        thread.returnStackFrame(null);
        return;
      }

      const itemCls = clsRef.getComponentClass();
      thread.returnStackFrame(itemCls.getJavaObject());
    }
  );

  jni.registerNativeMethod(
    clsName,
    'forName0(Ljava/lang/String;ZLjava/lang/ClassLoader;Ljava/lang/Class;)Ljava/lang/Class;',
    (thread: Thread, locals: any[]) => {
      const nameJStr = locals[0] as JvmObject;
      const initialize = (locals[1] as number) === 1;
      const loaderObj = locals[2] as JvmObject;
      const callerClassObj = locals[3] as JvmObject;

      const name = j2jsString(nameJStr).replaceAll('.', '/');

      console.log(
        'forName0(Ljava/lang/String;ZLjava/lang/ClassLoader;Ljava/lang/Class;)Ljava/lang/Class;: ',
        name
      );

      let loader: AbstractClassLoader;
      if (loaderObj) {
        throw new Error(
          'forName0 via application class loader object not handled'
        );
      } else {
        loader = thread.getJVM().getBootstrapClassLoader();
      }

      const loadRes = loader.getClassRef(name);
      if (checkError(loadRes)) {
        thread.returnStackFrame();
        thread.throwNewException(loadRes.exceptionCls, loadRes.msg);
        return;
      }
      const loadedCls = loadRes.result;

      if (!initialize) {
        thread.returnStackFrame(loadedCls.getJavaObject());
        return;
      }

      const initRes = loadedCls.initialize(thread);
      if (!checkSuccess(initRes)) {
        if (checkError(initRes)) {
          thread.returnStackFrame();
          thread.throwNewException(initRes.exceptionCls, initRes.msg);
          return;
        }
        return;
      }
      thread.returnStackFrame(loadedCls.getJavaObject());
    }
  );

  jni.registerNativeMethod(
    clsName,
    'isInterface()Z',
    (thread: Thread, locals: any[]) => {
      const clsObj = locals[0] as JvmObject;
      const clsRef = clsObj.getNativeField('classRef') as ClassData;
      thread.returnStackFrame(clsRef.checkInterface() ? 1 : 0);
    }
  );

  jni.registerNativeMethod(
    clsName,
    'getDeclaredConstructors0(Z)[Ljava/lang/reflect/Constructor;',
    (thread: Thread, locals: any[]) => {
      const clsObj = locals[0] as JvmObject;
      const publicOnly = locals[1] === 1;

      const clsRef = clsObj.getNativeField('classRef') as ClassData;
      const methods: JvmObject[] = [];
      let error: ErrorResult | null = null;
      Object.entries(clsRef.getMethods()).forEach(([key, value]) => {
        if (!key.startsWith('<init>') || (publicOnly && !value.checkPublic())) {
          return;
        }

        const refRes = value.getReflectedObject(thread);
        if (checkError(refRes)) {
          error = refRes;
          return;
        }
        methods.push(refRes.result);
      });
      if (error) {
        thread.returnStackFrame();
        thread.throwNewException(
          (error as ErrorResult).exceptionCls,
          (error as ErrorResult).msg
        );
        return;
      }

      const caRes = clsRef
        .getLoader()
        .getClassRef('[Ljava/lang/reflect/Constructor;');
      if (checkError(caRes)) {
        thread.returnStackFrame();
        thread.throwNewException(caRes.exceptionCls, caRes.msg);
        return;
      }
      const caCls = caRes.result as ArrayClassData;
      const caObj = caCls.instantiate();
      caObj.initArray(methods.length, methods);

      thread.returnStackFrame(caObj);
    }
  );
};
