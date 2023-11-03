import { FieldRef } from '#types/FieldRef';
import { ClassRef } from '#types/class/ClassRef';
import { JavaType } from '#types/dataTypes';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';
import { newString } from '#utils/index';
import { parseFieldDescriptor } from '../ExecutionEngine/Interpreter/utils';
import { StackFrame } from '../Thread/StackFrame';
import Thread, { ThreadStatus } from '../Thread/Thread';
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
          thread.returnSF();
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

  jni.registerNativeMethod(
    'java/lang/Thread',
    'sleep(J)V',
    (thread: Thread, locals: any[]) => {
      thread.setStatus(ThreadStatus.WAITING);
      setTimeout(
        () => {
          thread.setStatus(ThreadStatus.RUNNABLE);
          thread.returnSF();
        },
        Number(locals[0] as BigInt)
      );
    }
  );

  jni.registerNativeMethod(
    'java/lang/System',
    'initProperties(Ljava/util/Properties;)Ljava/util/Properties;',
    (thread: Thread, locals: any[]) => {
      console.log('RUNNING: initProperties');
      const props = locals[0] as JvmObject;
      // FIXME: use actual values
      // modified from Doppio https://github.com/plasma-umass/doppio/blob/master/src/jvm.ts
      const systemProperties = {
        'java.class.path': 'example',
        'java.home': 'natives',
        'java.ext.dirs': 'natives/lib/ext',
        'java.io.tmpdir': 'temp',
        'sun.boot.class.path': 'natives',
        'file.encoding': 'UTF-8',
        'java.vendor': 'Source Academy',
        'java.version': '1.0',
        'java.vendor.url': 'https://github.com/source-academy/java-slang',
        'java.class.version': '52.0',
        'java.specification.version': '1.8',
        'line.separator': '\n',
        'file.separator': '/',
        'path.separator': ':',
        'user.dir': 'example',
        'user.home': '.',
        'user.name': 'SourceAcademy',
        'os.name': 'source',
        'os.arch': 'js',
        'os.version': '0',
        'java.vm.name': 'Source Academy JVM',
        'java.vm.version': '0.1',
        'java.vm.vendor': 'Source Academy',
        'java.awt.headless': 'true', // true if we're using the console frontend
        'java.awt.graphicsenv': 'classes.awt.CanvasGraphicsEnvironment',
        'jline.terminal': 'jline.UnsupportedTerminal', // we can't shell out to `stty`,
        'sun.arch.data.model': '32', // Identify as 32-bit, because that's how we act.
        'sun.jnu.encoding': 'UTF-8', // Determines how Java parses command line options.
      };

      const loader = thread.getClass().getLoader();
      const propClass = props.getClass();
      const method = propClass.getMethod(
        'setProperty(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/Object;'
      );
      if (!method) {
        thread.throwNewException(
          'java/lang/NoSuchMethodException',
          'setProperty(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/Object;'
        );
        return;
      }

      thread.returnSF(props);

      Object.entries(systemProperties).forEach(([key, value]) => {
        const keyRes = newString(loader, key);
        const valueRes = newString(loader, value);
        if (!keyRes.checkSuccess()) {
          if (keyRes.checkError()) {
            const err = keyRes.getError();
            thread.throwNewException(err.className, err.msg);
          }
          return;
        }
        if (!valueRes.checkSuccess()) {
          if (valueRes.checkError()) {
            const err = valueRes.getError();
            thread.throwNewException(err.className, err.msg);
          }
          return;
        }
        const keyObj = keyRes.getResult();
        const valueObj = valueRes.getResult();

        thread.invokeSf(
          props.getClass(),
          method,
          0,
          [props, keyObj, valueObj],
          () => {}
        );
      });
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
      const mRes = paCls.$resolveMethod('run()Ljava/lang/Object;', acCls);
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

      console.log('DOPRIVILEGED');
      thread.returnSF();
      thread.invokeSf(runtimeCls, method, 0, [action]);
    }
  );

  // public static 'getDeclaredFields0(Z)[Ljava/lang/reflect/Field;'(thread: JVMThread, javaThis: JVMTypes.java_lang_Class, publicOnly: number): void {
  //   var fields = javaThis.$cls.getFields();
  //   if (publicOnly) {
  //     fields = fields.filter((f) => f.accessFlags.isPublic());
  //   }
  //   var rv = util.newArray<JVMTypes.java_lang_reflect_Field>(thread, thread.getBsCl(), '[Ljava/lang/reflect/Field;', fields.length),
  //     i: number = 0;
  //   thread.setStatus(ThreadStatus.ASYNC_WAITING);
  //   util.asyncForEach<Field>(fields,
  //     (f, nextItem) => {
  //       f.reflector(thread, (fieldObj: JVMTypes.java_lang_reflect_Field) => {
  //         if (fieldObj !== null) {
  //           rv.array[i++] = fieldObj;
  //           nextItem();
  //         }
  //       });
  //     }, () => {
  //       thread.asyncReturn(rv);
  //     });
  // }

  // var createObj = (typeObj: JVMTypes.java_lang_Class): JVMTypes.java_lang_reflect_Field => {
  //   var fieldCls = <ReferenceClassData<JVMTypes.java_lang_reflect_Field>> bsCl.getInitializedClass(thread, 'Ljava/lang/reflect/Field;'),
  //     fieldObj = new (fieldCls.getConstructor(thread))(thread);

  //   fieldObj['java/lang/reflect/Field/clazz'] = this.cls.getClassObject(thread);
  //   fieldObj['java/lang/reflect/Field/name'] = jvm.internString(this.name);
  //   fieldObj['java/lang/reflect/Field/type'] = typeObj;
  //   fieldObj['java/lang/reflect/Field/modifiers'] = this.accessFlags.getRawByte();
  //   fieldObj['java/lang/reflect/Field/slot'] = this.slot;
  //   fieldObj['java/lang/reflect/Field/signature'] = signatureAttr !== null ? initString(bsCl, signatureAttr.sig) : null;
  //   fieldObj['java/lang/reflect/Field/annotations'] = this.getAnnotationType(thread, 'RuntimeVisibleAnnotations');

  //   return fieldObj;
  // };

  jni.registerNativeMethod(
    'java/lang/Class',
    'getDeclaredFields0(Z)[Ljava/lang/reflect/Field;',
    (thread: Thread, locals: any[]) => {
      const clsObj = locals[0] as JvmObject;
      const publicOnly = locals[1];
      const clsRef = clsObj.$getNativeField('classRef') as ClassRef;
      const fields = clsRef.getFields();

      for (const [name, field] of Object.entries(fields)) {
        field.getClass();
      }
    }
  );

  // jni.registerNativeMethod(
  //   'source/Source',
  //   'println(I)V',
  //   (thread: Thread, locals: any[]) => console.log(locals[0])
  // );
}
