import { JNI } from '#jvm/components/JNI';
import Thread from '#jvm/components/thread';
import { Field } from '#types/class/Field';
import { ArrayClassData } from '#types/class/ArrayClassData';
import { ClassData } from '#types/class/ClassData';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';
import { DeferResult, ErrorResult } from '#types/result';
import { typeIndexScale } from '#utils/index';
import assert from 'assert';

export const registerUnsafe = (jni: JNI) => {
  jni.registerNativeMethod(
    'sun/misc/Unsafe',
    'registerNatives()V',
    (thread: Thread, locals: any[]) => {
      thread.returnStackFrame();
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
      thread.returnStackFrame(0);
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
      // #endregion

      thread.returnStackFrame64(BigInt(slot));
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
    } else if (ArrayClassData.check(objCls)) {
      // obj is an array. offset represents index * unit space
      const compCls = objCls.getComponentClass();
      const stride = typeIndexScale(compCls);
      const objBase = (obj as JvmArray).getJsArray();

      assert(
        Number(offset % BigInt(stride)) === 0,
        `unsafeCompareAndSwap: Invalid offset for stride ${stride}: ${offset}`
      );
      return [objBase, Math.floor(Number(offset) / stride)];
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
    expected: any,
    newValue: any
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
    const actual = (ref as Field).getValue();

    if (actual === expected) {
      ref.putValue(newValue);
      return 1;
    } else {
      return 0;
    }
  }

  // Used for bitwise operations
  jni.registerNativeMethod(
    'sun/misc/Unsafe',
    'arrayIndexScale(Ljava/lang/Class;)I',
    (thread: Thread, locals: any[]) => {
      const clsObj = locals[1] as JvmObject;
      const clsRef = clsObj.getNativeField('classRef') as ClassData;

      // Should be array. return -1 for invalid class
      if (!ArrayClassData.check(clsRef)) {
        thread.returnStackFrame(-1);
        return;
      }

      const scale = typeIndexScale(clsRef.getComponentClass());
      console.log(
        'ArrayIndexScale: ',
        scale,
        ' cls: ',
        clsRef.getComponentClass().getClassname()
      );
      thread.returnStackFrame(scale);
    }
  );

  jni.registerNativeMethod(
    'sun/misc/Unsafe',
    'addressSize()I',
    (thread: Thread, locals: any[]) => {
      thread.returnStackFrame(4);
    }
  );

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

      console.debug(
        'compareAndSwapObject(Ljava/lang/Object;JLjava/lang/Object;Ljava/lang/Object;)Z: ',
        obj1.getClass().getClassname(),
        offset
      );

      thread.returnStackFrame(
        unsafeCompareAndSwap(thread, unsafe, obj1, offset, expected, newValue)
      );
    }
  );

  jni.registerNativeMethod(
    'sun/misc/Unsafe',
    'compareAndSwapInt(Ljava/lang/Object;JII)Z',
    (thread: Thread, locals: any[]) => {
      const unsafe = locals[0] as JvmObject;
      const obj1 = locals[1] as JvmObject;
      const offset = locals[2] as bigint;
      const expected = locals[3] as number;
      const newValue = locals[4] as number;

      thread.returnStackFrame(
        unsafeCompareAndSwap(thread, unsafe, obj1, offset, expected, newValue)
      );
    }
  );

  jni.registerNativeMethod(
    'sun/misc/Unsafe',
    'compareAndSwapLong(Ljava/lang/Object;JJJ)Z',
    (thread: Thread, locals: any[]) => {
      const unsafe = locals[0] as JvmObject;
      const obj1 = locals[1] as JvmObject;
      const offset = locals[2] as bigint;
      const expected = locals[3] as bigint;
      const newValue = locals[4] as bigint;

      thread.returnStackFrame(
        unsafeCompareAndSwap(thread, unsafe, obj1, offset, expected, newValue)
      );
    }
  );

  jni.registerNativeMethod(
    'sun/misc/Unsafe',
    'getIntVolatile(Ljava/lang/Object;J)I',
    (thread: Thread, locals: any[]) => {
      const unsafe = locals[0] as JvmObject;
      const obj = locals[1] as JvmObject;
      const offset = locals[2] as bigint;

      const fi = getFieldInfo(thread, unsafe, obj, offset);
      const objBase = fi[0];
      const ref = fi[1];
      if (typeof ref === 'number') {
        // array type
        thread.returnStackFrame(objBase[ref]);
        return;
      }
      thread.returnStackFrame((ref as Field).getValue());
    }
  );

  jni.registerNativeMethod(
    'sun/misc/Unsafe',
    'allocateMemory(J)J',
    (thread: Thread, locals: any[]) => {
      const size = locals[1] as bigint;
      const heap = thread.getJVM().getUnsafeHeap();
      const addr = heap.allocate(size);
      console.log('ALLOCATE ADDR: ', addr);
      thread.returnStackFrame64(addr);
    }
  );

  jni.registerNativeMethod(
    'sun/misc/Unsafe',
    'putLong(JJ)V',
    (thread: Thread, locals: any[]) => {
      const address = locals[1] as bigint;
      const value = locals[2] as bigint;
      const heap = thread.getJVM().getUnsafeHeap();
      const view = heap.get(address);
      console.log('PUTLONG: ', address, value, view ? 'OK' : 'NULL');
      view.setBigInt64(0, value);
      thread.returnStackFrame();
    }
  );
  jni.registerNativeMethod(
    'sun/misc/Unsafe',
    'getByte(J)B',
    (thread: Thread, locals: any[]) => {
      const address = locals[1] as bigint;
      const heap = thread.getJVM().getUnsafeHeap();
      const view = heap.get(address);
      console.log('GETBYTE: ', view.getInt8(0));
      thread.returnStackFrame(view.getInt8(0));
    }
  );
  jni.registerNativeMethod(
    'sun/misc/Unsafe',
    'freeMemory(J)V',
    (thread: Thread, locals: any[]) => {
      const address = locals[1] as bigint;
      const heap = thread.getJVM().getUnsafeHeap();
      heap.free(address);
      thread.returnStackFrame();
    }
  );
};
