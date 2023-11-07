import { primitiveNameToType } from '#jvm/components/ExecutionEngine/Interpreter/utils';
import { JNI } from '#jvm/components/JNI';
import Thread from '#jvm/components/Thread/Thread';
import { FieldRef } from '#types/FieldRef';
import { ArrayClassRef } from '#types/class/ArrayClassRef';
import { ClassRef } from '#types/class/ClassRef';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';

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
      console.log(name);
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
};