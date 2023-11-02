import { FieldRef } from '#types/FieldRef';
import { JavaType } from '#types/dataTypes';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';
import { parseFieldDescriptor } from '../ExecutionEngine/Interpreter/utils';
import { StackFrame } from '../Thread/StackFrame';
import Thread from '../Thread/Thread';
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
      console.error(
        `Native method ${className}.${methodName} implementation not found, returning dummy function`
      );
      const retType = parseFieldDescriptor(methodName.split(')')[1], 0).type;

      switch (retType) {
        case JavaType.array:
          return (thread: Thread, ...params: any) => {
            thread.returnSF(null);
          };
        case JavaType.byte:
          return (thread: Thread, ...params: any) => {
            thread.returnSF(0);
          };
        case JavaType.char:
          return (thread: Thread, ...params: any) => {
            thread.returnSF('');
          };
        case JavaType.double:
          return (thread: Thread, ...params: any) => {
            thread.returnSF(0.0, null, true);
          };
        case JavaType.float:
          return (thread: Thread, ...params: any) => {
            thread.returnSF(0.0);
          };
        case JavaType.int:
          return (thread: Thread, ...params: any) => {
            thread.returnSF(0);
          };
        case JavaType.long:
          return (thread: Thread, ...params: any) => {
            thread.returnSF(0n, null, true);
          };
        case JavaType.short:
          return (thread: Thread, ...params: any) => {
            thread.returnSF(0);
          };
        case JavaType.boolean:
          return (thread: Thread, ...params: any) => {
            thread.returnSF(false);
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
    'java/lang/Class',
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
      let primitiveClsName;
      switch (primitiveName) {
        case 'byte':
          primitiveClsName = 'B';
          break;
        case 'char':
          primitiveClsName = 'C';
          break;
        case 'double':
          primitiveClsName = 'D';
          break;
        case 'float':
          primitiveClsName = 'F';
          break;
        case 'int':
          primitiveClsName = 'I';
          break;
        case 'long':
          primitiveClsName = 'J';
          break;
        case 'short':
          primitiveClsName = 'S';
          break;
        case 'void':
          primitiveClsName = 'V';
          break;
        case 'boolean':
          primitiveClsName = 'Z';
          break;
        default:
          primitiveClsName = primitiveName;
      }

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
    'java/lang/Thread',
    'currentThread()Ljava/lang/Thread;',
    (thread: Thread, locals: any[]) => {
      const threadObj = thread.getJavaObject();
      thread.returnSF(threadObj);
    }
  );
  jni.registerNativeMethod(
    'java/security/AccessController',
    'doPrivileged(Ljava/security/PrivilegedExceptionAction;)Ljava/lang/Object;',
    (thread: Thread, locals: any[]) => {
      const action = locals[0] as JvmObject;
      const actionCls = action.getClass();
      const methodRes = actionCls.$resolveMethod(
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
          thread.returnSF(ret);
        }
      );
    }
  );
  jni.registerNativeMethod(
    'java/lang/System',
    'arraycopy(Ljava/lang/Object;ILjava/lang/Object;II)V',
    (thread: Thread, locals: any[]) => {
      // is static.
      const src = locals[0] as JvmArray;
      const srcPos = locals[1];
      const dest = locals[2] as JvmArray;
      const destPos = locals[3];
      const length = locals[4];

      if (src === null || dest === null) {
        thread.throwNewException(
          'java/lang/NullPointerException',
          'Cannot copy to/from a null array.'
        );
        return;
      }

      if (
        src.getClass().getClassname()[0] !== '[' ||
        dest.getClass().getClassname()[0] !== '['
      ) {
        thread.throwNewException(
          'java/lang/ArrayStoreException',
          'src and dest arguments must be of array type.'
        );
        return;
      }

      if (
        srcPos < 0 ||
        srcPos + length > src.len() ||
        destPos < 0 ||
        destPos + length > dest.len() ||
        length < 0
      ) {
        thread.throwNewException(
          'java/lang/ArrayIndexOutOfBoundsException',
          'Tried to write to an illegal index in an array.'
        );
        return;
      }

      const srcCls = src.getClass();
      const destCls = dest.getClass();

      if (srcCls.checkCast(destCls)) {
        // safe to copy
        for (let i = 0; i < length; i++) {
          dest.set(destPos + i, src.get(i + srcPos));
        }
      } else {
        // FIXME: we should check if the types are actually compatible
        for (let i = 0; i < length; i++) {
          dest.set(destPos + i, src.get(i + srcPos));
        }
      }

      thread.returnSF();
    }
  );

  // jni.registerNativeMethod(
  //   'source/Source',
  //   'println(I)V',
  //   (thread: NativeThread, locals: any[]) => console.log(locals[0])
  // );
}
