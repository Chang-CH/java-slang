import { FieldRef } from '#types/FieldRef';
import { ArrayClassRef } from '#types/class/ArrayClassRef';
import { ClassRef } from '#types/class/ClassRef';
import { JavaType } from '#types/dataTypes';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';
import { parseFieldDescriptor } from '../ExecutionEngine/Interpreter/utils';
import { StackFrame } from '../Thread/StackFrame';
import Thread, { ThreadStatus } from '../Thread/Thread';
import { registerJavaLangClass } from './natives/java/lang/Class';
import { registerJavaLangSystem } from './natives/java/lang/System';
import { registerJavaLangThread } from './natives/java/lang/Thread';
import { registerJavaSecurityAccessController } from './natives/java/security/AccessController';
export class JNI {
  private classes: {
    [className: string]: {
      methods: {
        [methodName: string]: Function;
      };
    };
  };

  constructor() {
    this.classes = {};
  }

  registerNativeMethod(
    className: string,
    methodName: string,
    method: Function
  ) {
    if (!this.classes[className]) {
      this.classes[className] = {
        methods: {},
      };
    }
    this.classes[className].methods[methodName] = method;
  }

  getNativeMethod(className: string, methodName: string) {
    if (!this.classes?.[className]?.methods?.[methodName]) {
      // FIXME: Returns an empty function for now, but should throw an error
      console.error(`Native method ${className}.${methodName} `);
      const retType = parseFieldDescriptor(methodName.split(')')[1], 0).type;

      switch (retType) {
        case JavaType.array:
          return (thread: Thread, ...params: any) => {
            thread.returnSF(null);
          };
        case JavaType.byte:
        case JavaType.int:
        case JavaType.boolean:
        case JavaType.char:
        case JavaType.short:
          return (thread: Thread, ...params: any) => {
            thread.returnSF(0);
          };
        case JavaType.double:
          return (thread: Thread, ...params: any) => {
            thread.returnSF(0.0, null, true);
          };
        case JavaType.float:
          return (thread: Thread, ...params: any) => {
            thread.returnSF(0.0);
          };
        case JavaType.long:
          return (thread: Thread, ...params: any) => {
            thread.returnSF(0n, null, true);
          };
        case JavaType.reference:
          return (thread: Thread, ...params: any) => {
            thread.returnSF(null);
          };
        case JavaType.void:
          return (thread: Thread, ...params: any) => {
            thread.returnSF();
          };
        default:
          return (thread: Thread, ...params: any) => {
            thread.returnSF();
          };
      }
    }
    return this.classes[className].methods[methodName];
  }
}

export function registerNatives(jni: JNI) {
  /**
   * From Doppio:
   * From JDK documentation:
   *   Returns the class of the method realFramesToSkip frames up the stack
   *   (zero-based), ignoring frames associated with
   *   java.lang.reflect.Method.invoke() and its implementation. The first
   *   frame is that associated with this method, so getCallerClass(0) returns
   *   the Class object for sun.reflect.Reflection. Frames associated with
   *   java.lang.reflect.Method.invoke() and its implementation are completely
   *   ignored and do not count toward the number of "real" frames skipped.
   */
  function getCallerClass(
    thread: Thread,
    framesToSkip: number
  ): JvmObject | null {
    const caller = thread.getFrames();
    let idx = caller.length - 1 - framesToSkip;
    let frame: StackFrame = caller[idx];

    while (
      frame.method.getClass().getClassname() === 'java/lang/reflect/Method' &&
      frame.method.getName() === 'invoke'
    ) {
      if (idx === 0) {
        // No more stack to search!
        // XXX: What does the JDK do here, throw an exception?
        return null;
      }
      frame = caller[--idx];
    }

    return frame.method.getClass().getJavaObject();
  }

  jni.registerNativeMethod(
    'sun/reflect/Reflection',
    'getCallerClass()Ljava/lang/Class;',
    (thread: Thread, locals: any[]) => {
      const callerclass = getCallerClass(thread, 2);
      thread.returnSF(callerclass);
    }
  );

  jni.registerNativeMethod(
    'java/lang/String',
    'intern()Ljava/lang/String;',
    (thread: Thread, locals: any[]) => {
      const strObj = locals[0] as JvmObject;
      const strCls = strObj.getClass();
      const str = strObj._getField(
        'value',
        '[C',
        strCls.getClassname()
      ) as JvmArray;
      const strVal = String.fromCharCode(...str.getJsArray());
      console.log('INTERNING', strVal);
      const internedStr = thread.getJVM().getInternedString(strVal);
      thread.returnSF(internedStr);
    }
  );

  registerJavaLangClass(jni);
  registerJavaLangThread(jni);
  registerJavaLangSystem(jni);
  registerJavaSecurityAccessController(jni);

  jni.registerNativeMethod(
    'sun/misc/Unsafe',
    'objectFieldOffset(Ljava/lang/reflect/Field;)J',
    (thread: Thread, locals: any[]) => {
      console.error(
        'Native method sun/misc/Unsafe.objectFieldOffset(Ljava/lang/reflect/Field;)J not implemented'
      );
      const unsafe = locals[0] as JvmObject;
      const field = locals[1] as JvmObject;
      // const fieldRef = field.getField()getNativeField('fieldRef') as FieldRef;
      const fieldRef = field.getNativeField('fieldRef') as FieldRef;
      console.log(fieldRef);
      const fieldCls = fieldRef.getClass();
      const slot = fieldRef.getSlot();
      thread.returnSF(slot);
      // TODO: check if slot is used to access fields not declared in this class

      throw new Error(
        'Native method sun/misc/Unsafe.objectFieldOffset(Ljava/lang/reflect/Field;)J not implemented'
      );
    }
  );

  // function getFieldInfo(
  //   thread: JVMThread,
  //   unsafe: JVMTypes.sun_misc_Unsafe,
  //   obj: JVMTypes.java_lang_Object,
  //   offset: Long
  // ): [any, string] {
  //   var fieldName: string,
  //     objBase: any,
  //     objCls = obj.getClass(),
  //     cls: ReferenceClassData<JVMTypes.java_lang_Object>,
  //     compName: string,
  //     unsafeCons: typeof JVMTypes.sun_misc_Unsafe = <any>(
  //       (<ReferenceClassData<JVMTypes.sun_misc_Unsafe>>(
  //         unsafe.getClass()
  //       )).getConstructor(thread)
  //     ),
  //     stride = 1;
  //   if (objCls.getInternalName() === 'Ljava/lang/Object;') {
  //     // Static field. The staticFieldBase is always a pure Object that has a
  //     // class reference on it.
  //     // There's no reason to get the field on an Object, as they have no fields.
  //     cls = <ReferenceClassData<JVMTypes.java_lang_Object>>(
  //       (<any>obj).$staticFieldBase
  //     );
  //     objBase = <any>cls.getConstructor(thread);
  //     fieldName = cls.getStaticFieldFromVMIndex(offset.toInt()).fullName;
  //   } else if (objCls instanceof ArrayClassData) {
  //     compName = util.internal2external[objCls.getInternalName()[1]];
  //     if (!compName) {
  //       compName = 'OBJECT';
  //     }
  //     compName = compName.toUpperCase();
  //     stride = (<any>unsafeCons)[
  //       `sun/misc/Unsafe/ARRAY_${compName}_INDEX_SCALE`
  //     ];
  //     if (!stride) {
  //       stride = 1;
  //     }

  //     objBase = (<JVMTypes.JVMArray<any>>obj).array;
  //     assert(
  //       offset.toInt() % stride === 0,
  //       `Invalid offset for stride ${stride}: ${offset.toInt()}`
  //     );
  //     fieldName = '' + offset.toInt() / stride;
  //   } else {
  //     cls = <ReferenceClassData<JVMTypes.java_lang_Object>>obj.getClass();
  //     objBase = obj;
  //     fieldName = cls.getObjectFieldFromVMIndex(offset.toInt()).fullName;
  //   }
  //   return [objBase, fieldName];
  // }

  // function unsafeCompareAndSwap<T>(
  //   thread: JVMThread,
  //   unsafe: JVMTypes.sun_misc_Unsafe,
  //   obj: JVMTypes.java_lang_Object,
  //   offset: Long,
  //   expected: T,
  //   x: T
  // ): boolean {
  //   var fi = getFieldInfo(thread, unsafe, obj, offset),
  //     actual = fi[0][fi[1]];
  //   if (actual === expected) {
  //     fi[0][fi[1]] = x;
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  jni.registerNativeMethod(
    'sun/misc/Unsafe',
    'compareAndSwapObject(Ljava/lang/Object;JLjava/lang/Object;Ljava/lang/Object;)Z',
    (thread: Thread, locals: any[]) => {
      const unsafe = locals[0] as JvmObject;
      const obj1 = locals[1] as JvmObject;
      const offset = locals[2] as BigInt;

      const expected = locals[3] as JvmObject;
      const x = locals[4] as JvmObject;

      throw new Error(
        'Native method sun/misc/Unsafe.compareAndSwapObject(Ljava/lang/Object;JLjava/lang/Object;Ljava/lang/Object;)Z not implemented'
      );
    }
  );

  // java/lang/Object.registerNatives()V
  // java/lang/Thread.registerNatives()V
  // java/lang/System.registerNatives()V
  // java/lang/Class.registerNatives()V
  // java/lang/Class.desiredAssertionStatus0(Ljava/lang/Class;)Z
  // java/lang/Float.floatToRawIntBits(F)I
  // java/lang/Double.doubleToRawLongBits(D)J
  // java/lang/Double.longBitsToDouble(J)D
  // java/lang/Double.longBitsToDouble(J)D
  // java/lang/Thread.setPriority0(I)V
  // sun/misc/VM.initialize()V
  // java/io/FileInputStream.initIDs()V
  // java/io/FileDescriptor.initIDs()V
  // sun/misc/Unsafe.registerNatives()V
  // java/lang/Object.hashCode()I
  // sun/misc/Unsafe.arrayBaseOffset(Ljava/lang/Class;)I
  // sun/misc/Unsafe.arrayIndexScale(Ljava/lang/Class;)I
  // sun/misc/Unsafe.addressSize()I
  // java/io/FileOutputStream.initIDs()V
  // java/lang/Class.getName0()Ljava/lang/String;
  // java/lang/Class.forName0(Ljava/lang/String;ZLjava/lang/ClassLoader;Ljava/lang/Class;)Ljava/lang/Class;
  // java/lang/Class.desiredAssertionStatus0(Ljava/lang/Class;)Z
  // java/lang/Class.getName0()Ljava/lang/String;
  // java/lang/Class.forName0(Ljava/lang/String;ZLjava/lang/ClassLoader;Ljava/lang/Class;)Ljava/lang/Class;
  // java/lang/Thread.setPriority0(I)V
  // java/lang/Thread.setPriority0(I)V
  // java/lang/Thread.isAlive()Z
  // java/lang/Thread.start0()V
  // sun/misc/Unsafe.objectFieldOffset(Ljava/lang/reflect/Field;)J
}
