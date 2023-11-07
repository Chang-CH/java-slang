import { JNI } from '#jvm/components/JNI';
import Thread from '#jvm/components/Thread/Thread';
import { FieldRef } from '#types/FieldRef';
import { ArrayClassRef } from '#types/class/ArrayClassRef';
import { ClassRef } from '#types/class/ClassRef';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';
import { DeferResult, ErrorResult } from '#types/result';
import assert from 'assert';

export const registerUnsafe = (jni: JNI) => {
  jni.registerNativeMethod(
    'sun/misc/Unsafe',
    'registerNatives()V',
    (thread: Thread, locals: any[]) => {
      thread.returnSF();
    }
  );

  // jni.registerNativeMethod(
  //   'sun/misc/Unsafe',
  //   'arrayIndexScale(Ljava/lang/Class;)I',
  //   (thread: Thread, locals: any[]) => {
  //     const clsObj = locals[0] as JvmObject;
  //     const clsRef = clsObj.getNativeField('classRef') as ClassRef;

  //     if (!ArrayClassRef.check(clsRef)) {
  //       thread.returnSF(-1);
  //       return;
  //     }

  //     const compCls = clsRef.getComponentClass();
  //     if (
  //       compCls.checkPrimitive() &&
  //       (compCls.getClassname() === 'long' ||
  //         compCls.getClassname() === 'double')
  //     ) {
  //       thread.returnSF(2);
  //       return;
  //     }

  //     thread.returnSF(1);
  //     return;
  //   }
  // );

  jni.registerNativeMethod(
    'sun/misc/Unsafe',
    'arrayBaseOffset(Ljava/lang/Class;)I',
    (thread: Thread, locals: any[]) => {
      thread.returnSF(0);
    }
  );

  jni.registerNativeMethod(
    'sun/misc/Unsafe',
    'objectFieldOffset(Ljava/lang/reflect/Field;)J',
    (thread: Thread, locals: any[]) => {
      const unsafe = locals[0] as JvmObject;
      const field = locals[1] as JvmObject;
      const slot = field._getField('slot', 'I', 'java/lang/reflect/Field');

      // TODO: check if slot needs to uniquely identify inherited fields as well
      console.warn(
        'objectFieldOffset: not checking if slot is used to access fields not declared in this class'
      );

      // #region debug
      const fstr = field._getField(
        'name',
        'Ljava/lang/String;',
        'java/lang/reflect/Field'
      );
      const cArr = fstr._getField('value', '[C', 'java/lang/String');
      const chars = cArr.getJsArray();
      console.log(
        'unsafe.objectFieldOffset(Ljava/lang/reflect/Field;)J: ',
        slot,
        String.fromCharCode(...chars)
      );
      // #endregion

      thread.returnSF(BigInt(slot), null, true);
    }
  );

  function getFieldInfo(
    thread: Thread,
    unsafe: JvmObject,
    obj: JvmObject,
    offset: bigint
  ): any {
    // const fieldName: string;
    // const objBase: any;

    // obj is a class obj
    const objCls = obj.getClass();

    // unsafe should be loaded at initialization
    // also init unsafe at JVM startup?
    const unsafeCls = unsafe.getClass();

    if (objCls.getClassname() === 'java/lang/Object') {
      // Static field. The staticFieldBase is always a pure Object that has a
      // class reference on it.
      // There's no reason to get the field on an Object, as they have no fields.

      throw new Error('not implemented');
      //   cls = <ReferenceClassData<JVMTypes.java_lang_Object>>(
      //     (<any>obj).$staticFieldBase
      //   );
      //   objBase = <any>cls.getConstructor(thread);
      //   fieldName = cls.getStaticFieldFromVMIndex(offset.toInt()).fullName;
    } else if (ArrayClassRef.check(objCls)) {
      // obj is an array. offset represents index * unit space
      const compCls = objCls.getComponentClass();
      let stride = 1;
      if (
        compCls.checkPrimitive() &&
        (compCls.getClassname() === 'long' ||
          compCls.getClassname() === 'double')
      ) {
        console.log('long/double array, is index doubled?');
        stride = 2;
      }
      const objBase = (obj as JvmArray).getJsArray();

      assert(
        Number(offset % BigInt(stride)) === 0,
        `\x1b[31munsafeCompareAndSwap: Invalid offset for stride ${stride}: ${offset}\x1b[0m`
      );
      return [objBase, Number(offset) / stride];
    } else {
      // normal class
      const objBase = obj;
      const fieldRef = obj.getFieldFromVMIndex(Number(offset));
      return [objBase, fieldRef];
    }
  }

  /**
   * Checks if the field at the given offset in the given object
   * is equals to the expected value. If so, sets the field to
   * newValue and returns true. Otherwise, returns false.
   * @param thread
   * @param unsafe
   * @param obj
   * @param offset
   * @param expected
   * @param newValue
   * @returns
   */
  function unsafeCompareAndSwap(
    thread: Thread,
    unsafe: JvmObject,
    obj: JvmObject,
    offset: bigint,
    expected: JvmObject,
    newValue: JvmObject
  ): number {
    // obj: Class object w/ field reflectionData
    // offset: field slot of field reflectionData
    // expected: SoftReference object
    // newValue: SoftReference object

    const fi = getFieldInfo(thread, unsafe, obj, offset);
    const objBase = fi[0];
    const ref = fi[1];
    if (typeof ref === 'number') {
      // array type
      const actual = objBase[ref];
      if (actual === expected) {
        objBase[ref] = newValue;
        return 1;
      } else {
        return 0;
      }
    }
    const actual = (ref as FieldRef).getValue();

    if (actual === expected) {
      ref.putValue(newValue);
      return 1;
    } else {
      return 0;
    }
  }

  jni.registerNativeMethod(
    'sun/misc/Unsafe',
    'compareAndSwapObject(Ljava/lang/Object;JLjava/lang/Object;Ljava/lang/Object;)Z',
    (thread: Thread, locals: any[]) => {
      const unsafe = locals[0] as JvmObject;
      const obj1 = locals[1] as JvmObject;
      const offset = locals[2] as bigint;
      const expected = locals[3] as JvmObject;
      const newValue = locals[4] as JvmObject;
      // obj1: Class object w/ field reflectionData
      // offset: field slot of field reflectionData
      // expected: SoftReference object
      // newValue: SoftReference object

      console.log(
        'compareAndSwapObject(Ljava/lang/Object;JLjava/lang/Object;Ljava/lang/Object;)Z: ',
        obj1.getClass().getClassname(),
        offset
      );

      thread.returnSF(
        unsafeCompareAndSwap(thread, unsafe, obj1, offset, expected, newValue)
      );
    }
  );

  //   jni.registerNativeMethod(
  //     'source/Source',
  //     'println(I)V',
  //     (thread: Thread, locals: any[]) => console.log(locals[0])
  //   );
};
