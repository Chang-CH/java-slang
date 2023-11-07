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
import { registerUnsafe } from './natives/sun/misc/Unsafe';
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
      const internedStr = thread.getJVM().getInternedString(strVal);
      thread.returnSF(internedStr);
    }
  );

  registerJavaLangClass(jni);
  registerJavaLangThread(jni);
  registerJavaLangSystem(jni);
  registerJavaSecurityAccessController(jni);
  registerUnsafe(jni);

  jni.registerNativeMethod(
    'java/lang/Runtime',
    'availableProcessors()I',
    (thread: Thread, locals: any[]) => {
      thread.returnSF(1);
    }
  );

  /**
   * MethodType Creation
   * java/lang/Object.registerNatives()V
   * java/lang/Thread.registerNatives()V
   * java/lang/System.registerNatives()V
   * java/lang/Class.registerNatives()V
   * java/lang/Class.desiredAssertionStatus0(Ljava/lang/Class;)Z
   * java/lang/Float.floatToRawIntBits(F)I
   * java/lang/Double.doubleToRawLongBits(D)J
   * java/lang/Double.longBitsToDouble(J)D
   * java/lang/Thread.setPriority0(I)V
   * java/lang/Class.desiredAssertionStatus0(Ljava/lang/Class;)Z
   * sun/misc/Unsafe.registerNatives()V
   * java/lang/Object.hashCode()I
   * sun/misc/Unsafe.arrayBaseOffset(Ljava/lang/Class;)I
   * sun/misc/Unsafe.arrayIndexScale(Ljava/lang/Class;)I
   * sun/misc/Unsafe.addressSize()I
   * sun/misc/VM.initialize()V
   * java/lang/Class.forName0(Ljava/lang/String;ZLjava/lang/ClassLoader;Ljava/lang/Class;)Ljava/lang/Class;
   * java/lang/Class.desiredAssertionStatus0(Ljava/lang/Class;)Z
   * java/lang/Class.forName0(Ljava/lang/String;ZLjava/lang/ClassLoader;Ljava/lang/Class;)Ljava/lang/Class;
   * java/lang/Thread.setPriority0(I)V
   * java/lang/Thread.setPriority0(I)V
   * java/lang/Thread.isAlive()Z
   * java/lang/Thread.start0()V
   * java/lang/Object.hashCode()I
   * sun/misc/Unsafe.arrayBaseOffset(Ljava/lang/Class;)I
   * sun/misc/Unsafe.arrayIndexScale(Ljava/lang/Class;)I
   */

  /**
   * system init
   * java/lang/Object.registerNatives()V
   * java/lang/Thread.registerNatives()V
   * java/lang/System.registerNatives()V
   * java/lang/Class.registerNatives()V
   * java/lang/Class.desiredAssertionStatus0(Ljava/lang/Class;)Z
   * java/lang/Float.floatToRawIntBits(F)I
   * java/lang/Double.doubleToRawLongBits(D)J
   * java/lang/Double.longBitsToDouble(J)D
   * java/lang/Thread.setPriority0(I)V
   * sun/misc/VM.initialize()V
   * java/io/FileInputStream.initIDs()V
   * java/io/FileDescriptor.initIDs()V
   * sun/misc/Unsafe.registerNatives()V
   * java/lang/Object.hashCode()I
   * sun/misc/Unsafe.arrayBaseOffset(Ljava/lang/Class;)I
   * sun/misc/Unsafe.arrayIndexScale(Ljava/lang/Class;)I
   * sun/misc/Unsafe.addressSize()I
   * java/io/FileOutputStream.initIDs()V
   * java/lang/Class.forName0(Ljava/lang/String;ZLjava/lang/ClassLoader;Ljava/lang/Class;)Ljava/lang/Class;
   * java/lang/Class.desiredAssertionStatus0(Ljava/lang/Class;)Z
   * java/lang/Class.forName0(Ljava/lang/String;ZLjava/lang/ClassLoader;Ljava/lang/Class;)Ljava/lang/Class;
   * java/lang/Thread.setPriority0(I)V
   * java/lang/Thread.isAlive()Z
   * java/lang/Thread.start0()V
   * java/lang/Object.hashCode()I
   * java/lang/System.setIn0(Ljava/io/InputStream;)V
   * java/lang/Class.desiredAssertionStatus0(Ljava/lang/Class;)Z
   * java/lang/Object.hashCode()I
   * sun/misc/Unsafe.getIntVolatile(Ljava/lang/Object;J)I
   * sun/misc/Unsafe.compareAndSwapInt(Ljava/lang/Object;JII)Z
   */
}
