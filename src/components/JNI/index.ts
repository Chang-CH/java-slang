import { Field } from '#types/class/Field';
import { ArrayClassData } from '#types/class/ArrayClassData';
import { ClassData } from '#types/class/ClassData';
import { JavaType } from '#types/reference/Object';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';
import { byteArray2charArray, j2jsString } from '#utils/index';
import { parseFieldDescriptor } from '../ExecutionEngine/Interpreter/utils';
import { StackFrame } from '../Thread/StackFrame';
import Thread, { ThreadStatus } from '../Thread/Thread';
import { registerJavaLangClass } from './implementation/java/lang/Class';
import { registerJavaLangDouble } from './implementation/java/lang/Double';
import { registerJavaLangFloat } from './implementation/java/lang/Float';
import { registerJavaLangObject } from './implementation/java/lang/Object';
import { registerJavaLangSystem } from './implementation/java/lang/System';
import { registerJavaLangThread } from './implementation/java/lang/Thread';
import { registerJavaSecurityAccessController } from './implementation/java/security/AccessController';
import { registerSource } from './implementation/source';
import { registerUnsafe } from './implementation/sun/misc/Unsafe';
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
      console.error(`Native method missing: ${className}.${methodName} `);
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
      const strVal = j2jsString(strObj);
      const internedStr = thread.getJVM().getInternedString(strVal);
      thread.returnSF(internedStr);
    }
  );

  registerJavaLangClass(jni);
  registerJavaLangThread(jni);
  registerJavaLangSystem(jni);
  registerJavaSecurityAccessController(jni);
  registerUnsafe(jni);
  registerJavaLangObject(jni);
  registerJavaLangFloat(jni);
  registerJavaLangDouble(jni);

  registerSource(jni);

  jni.registerNativeMethod(
    'java/lang/Runtime',
    'availableProcessors()I',
    (thread: Thread, locals: any[]) => {
      thread.returnSF(1);
    }
  );

  jni.registerNativeMethod(
    'sun/misc/VM',
    'initialize()V',
    (thread: Thread, locals: any[]) => {
      thread.returnSF();
    }
  );

  jni.registerNativeMethod(
    'sun/reflect/NativeConstructorAccessorImpl',
    'newInstance0(Ljava/lang/reflect/Constructor;[Ljava/lang/Object;)Ljava/lang/Object;',
    (thread: Thread, locals: any[]) => {
      const constructor = locals[0] as JvmObject;
      const paramArr = locals[1] as JvmArray;
      const clsObj = constructor._getField(
        'clazz',
        'Ljava/lang/Class;',
        'java/lang/reflect/Constructor'
      ) as JvmObject;
      const methodSlot = constructor._getField(
        'slot',
        'I',
        'java/lang/reflect/Constructor'
      ) as number;
      const clsRef = clsObj.getNativeField('classRef') as ClassData;
      const methodRef = clsRef.getMethodFromSlot(methodSlot);
      if (!methodRef) {
        throw new Error('Invalid slot?');
      }

      const initRes = clsRef.initialize(thread);
      if (!initRes.checkSuccess()) {
        if (initRes.checkError()) {
          const err = initRes.getError();
          thread.throwNewException(err.className, err.msg);
        }
        return;
      }

      const retObj = clsRef.instantiate();
      // FIXME: unbox args if required
      if (paramArr) {
        console.error('newInstance0: Auto unboxing not implemented');
      }
      const params = [retObj, ...(paramArr ? paramArr.getJsArray() : [])];
      thread.invokeSf(clsRef, methodRef, 0, params, () => {
        thread.returnSF();
        thread.returnSF(retObj);
      });
    }
  );

  jni.registerNativeMethod(
    'java/io/FileOutputStream',
    'writeBytes([BIIZ)V',
    (thread: Thread, locals: any[]) => {
      const stream = locals[0] as JvmObject;
      const bytes = locals[1] as JvmArray;
      const offset = locals[2] as number;
      const len = locals[3] as number;
      const append = locals[4] as boolean;

      const javafd = stream._getField(
        'fd',
        'Ljava/io/FileDescriptor;',
        'java/io/FileOutputStream'
      ) as JvmObject;
      const fd = javafd._getField(
        'fd',
        'I',
        'java/io/FileDescriptor'
      ) as number;

      if (fd === -1) {
        thread.throwNewException('java/io/IOException', 'Bad file descriptor');
        return;
      }

      // stdout
      if (fd === 1 || fd === 2) {
        // const str = String.fromCharCode(
        //   ...byteArray2charArray(bytes.getJsArray())
        // );
        const buf: Buffer = Buffer.from(bytes.getJsArray());
        const str = buf.toString('utf8', offset, offset + len);
        const sys = thread.getJVM().getSystem();
        fd === 1 ? sys.stdout(str) : sys.stderr(str);
        thread.returnSF();
        return;
      }

      throw new Error('Not implemented');
    }
  );

  /**
   * system init
   * java/io/FileInputStream.initIDs()V
   * java/io/FileDescriptor.initIDs()V
   * sun/misc/Unsafe.arrayIndexScale(Ljava/lang/Class;)I
   * sun/misc/Unsafe.addressSize()I
   * java/io/FileOutputStream.initIDs()V
   * java/lang/Thread.isAlive()Z
   * java/lang/Thread.start0()V
   * sun/reflect/Reflection.getClassAccessFlags(Ljava/lang/Class;)I
   * java/lang/Class.getModifiers()I
   * java/lang/Class.getSuperclass()Ljava/lang/Class;
   * java/util/concurrent/atomic/AtomicLong.VMSupportsCS8()Z
   * sun/misc/Signal.findSignal(Ljava/lang/String;)I
   * sun/misc/Signal.handle0(IJ)J
   * sun/io/Win32ErrorMode.setErrorMode(J)J
   * java/lang/Object.notifyAll()V
   * java/io/FileOutputStream.writeBytes([BIIZ)V: used to display println
   * java/lang/Throwable.fillInStackTrace(I)Ljava/lang/Throwable;: for throwing exceptions
   */

  /**
   * MethodType Resolution
   * java/io/FileInputStream.initIDs()V
   * java/io/FileDescriptor.initIDs()V
   * sun/misc/Unsafe.arrayIndexScale(Ljava/lang/Class;)I
   * sun/misc/Unsafe.addressSize()I
   * java/io/FileOutputStream.initIDs()V
   * java/lang/Thread.isAlive()Z
   * sun/misc/Unsafe.compareAndSwapLong(Ljava/lang/Object;JJJ)Z
   * java/lang/Thread.start0()V
   */
}
