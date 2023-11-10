import AbstractClassLoader from '#jvm/components/ClassLoader/AbstractClassLoader';
import { primitiveNameToType } from '#jvm/components/ExecutionEngine/Interpreter/utils';
import { JNI } from '#jvm/components/JNI';
import Thread from '#jvm/components/Thread/Thread';
import { FieldRef } from '#types/FieldRef';
import { ArrayClassRef } from '#types/class/ArrayClassRef';
import { ClassRef } from '#types/class/ClassRef';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';
import { ErrorResult } from '#types/result';

export const registerJavaLangClass = (jni: JNI) => {
  const clsName = 'java/lang/Class';
  jni.registerNativeMethod(
    clsName,
    'desiredAssertionStatus0(Ljava/lang/Class;)Z',
    (thread: Thread, locals: any[]) => {
      const clsObj = locals[0] as JvmObject;
      console.warn('Class.desiredAssertionStatus0: assertions disabled');
      thread.returnSF(0);
    }
  );

  jni.registerNativeMethod(
    clsName,
    'registerNatives()V',
    (thread: Thread, locals: any[]) => {
      thread.returnSF();
    }
  );

  jni.registerNativeMethod(
    clsName,
    'getDeclaredFields0(Z)[Ljava/lang/reflect/Field;',
    (thread: Thread, locals: any[]) => {
      const clsObj = locals[0] as JvmObject;
      const publicOnly = locals[1];
      const clsRef = clsObj.getNativeField('classRef') as ClassRef;
      const fields = clsRef.getFields();

      const result = [];

      for (const [name, field] of Object.entries(fields)) {
        const refRes = field.getReflectedObject(thread);
        if (refRes.checkError()) {
          const err = refRes.getError();
          thread.returnSF();
          thread.throwNewException(err.className, err.msg);
          return;
        }
        result.push(refRes.getResult());
      }

      const faClsRes = thread
        .getClass()
        .getLoader()
        .getClassRef('[Ljava/lang/reflect/Field;');
      if (faClsRes.checkError()) {
        const err = faClsRes.getError();
        thread.returnSF();
        thread.throwNewException(err.className, err.msg);
        return;
      }
      const faCls = faClsRes.getResult() as ArrayClassRef;
      const faObj = faCls.instantiate();
      faObj.initArray(result.length, result);

      thread.returnSF(faObj);
    }
  );

  jni.registerNativeMethod(
    clsName,
    'getPrimitiveClass(Ljava/lang/String;)Ljava/lang/Class;',
    (thread: Thread, locals: any[]) => {
      const javaStr = locals[0] as JvmObject;
      const loader = thread.getClass().getLoader();
      const strRes = loader.getClassRef('java/lang/String');
      if (strRes.checkError()) {
        const err = strRes.getError();
        thread.throwNewException(err.className, err.msg);
        return;
      }
      const strCls = strRes.getResult();
      const fieldRef = strCls.getFieldRef('value[C') as FieldRef;
      const cArr = javaStr.getField(fieldRef as FieldRef) as JvmArray;
      const primitiveName = String.fromCharCode(...cArr.getJsArray());
      const primitiveClsName =
        primitiveNameToType(primitiveName) ?? primitiveName;

      const cls = thread
        .getClass()
        .getLoader()
        .getPrimitiveClassRef(primitiveClsName);
      const initRes = cls.initialize(thread);
      if (!initRes.checkSuccess()) {
        if (initRes.checkError()) {
          const err = initRes.getError();
          thread.throwNewException(err.className, err.msg);
        }
        return;
      }
      thread.returnSF(cls.getJavaObject());
    }
  );

  jni.registerNativeMethod(
    clsName,
    'isArray()Z',
    (thread: Thread, locals: any[]) => {
      const clsObj = locals[0] as JvmObject;
      const clsRef = clsObj.getNativeField('classRef') as ClassRef;
      thread.returnSF(ArrayClassRef.check(clsRef) ? 1 : 0);
    }
  );
  jni.registerNativeMethod(
    clsName,
    'isPrimitive()Z',
    (thread: Thread, locals: any[]) => {
      const clsObj = locals[0] as JvmObject;
      const clsRef = clsObj.getNativeField('classRef') as ClassRef;
      thread.returnSF(clsRef.checkPrimitive() ? 1 : 0);
    }
  );

  jni.registerNativeMethod(
    clsName,
    'getName0()Ljava/lang/String;',
    (thread: Thread, locals: any[]) => {
      const clsObj = locals[0] as JvmObject;
      const clsRef = clsObj.getNativeField('classRef') as ClassRef;
      const name = clsRef.getClassname();
      const strRes = thread.getJVM().getInternedString(name);
      thread.returnSF(strRes);
    }
  );

  jni.registerNativeMethod(
    clsName,
    'getComponentType()Ljava/lang/Class;',
    (thread: Thread, locals: any[]) => {
      const clsObj = locals[0] as JvmObject;
      const clsRef = clsObj.getNativeField('classRef') as ClassRef;

      if (!ArrayClassRef.check(clsRef)) {
        thread.returnSF(null);
        return;
      }

      const itemCls = clsRef.getComponentClass();
      thread.returnSF(itemCls.getJavaObject());
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

      const name = String.fromCharCode(
        ...nameJStr._getField('value', '[C', 'java/lang/String').getJsArray()
      ).replaceAll('.', '/');

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
      if (loadRes.checkError()) {
        const err = loadRes.getError();
        thread.returnSF();
        thread.throwNewException(err.className, err.msg);
        return;
      }
      const loadedCls = loadRes.getResult();

      if (!initialize) {
        thread.returnSF(loadedCls.getJavaObject());
        return;
      }

      const initRes = loadedCls.initialize(thread);
      if (!initRes.checkSuccess()) {
        if (initRes.checkError()) {
          const err = initRes.getError();
          thread.returnSF();
          thread.throwNewException(err.className, err.msg);
          return;
        }
        return;
      }
      thread.returnSF(loadedCls.getJavaObject());
    }
  );

  jni.registerNativeMethod(
    clsName,
    'isInterface()Z',
    (thread: Thread, locals: any[]) => {
      const clsObj = locals[0] as JvmObject;
      const clsRef = clsObj.getNativeField('classRef') as ClassRef;
      thread.returnSF(clsRef.checkInterface() ? 1 : 0);
    }
  );

  jni.registerNativeMethod(
    clsName,
    'getDeclaredConstructors0(Z)[Ljava/lang/reflect/Constructor;',
    (thread: Thread, locals: any[]) => {
      const clsObj = locals[0] as JvmObject;
      const publicOnly = locals[1] === 1;

      const clsRef = clsObj.getNativeField('classRef') as ClassRef;
      const methods: JvmObject[] = [];
      let error: ErrorResult<JvmObject> | null = null;
      Object.entries(clsRef.getMethods()).forEach(([key, value]) => {
        if (!key.startsWith('<init>') || (publicOnly && !value.checkPublic())) {
          return;
        }

        const refRes = value.getReflectedObject(thread);
        if (refRes.checkError()) {
          error = refRes;
          return;
        }
        methods.push(refRes.getResult());
      });
      if (error) {
        const err = (error as ErrorResult<JvmObject>).getError();
        thread.returnSF();
        thread.throwNewException(err.className, err.msg);
        return;
      }

      const caRes = clsRef
        .getLoader()
        .getClassRef('[Ljava/lang/reflect/Constructor;');
      if (caRes.checkError()) {
        const err = caRes.getError();
        thread.returnSF();
        thread.throwNewException(err.className, err.msg);
        return;
      }
      const caCls = caRes.getResult() as ArrayClassRef;
      const caObj = caCls.instantiate();
      caObj.initArray(methods.length, methods);

      thread.returnSF(caObj);
    }
  );
};
