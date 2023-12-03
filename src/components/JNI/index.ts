import { ReferenceClassData } from '#types/class/ClassData';
import { JavaType } from '#types/reference/Object';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';
import { autoBox, autoUnbox, j2jsString } from '#utils/index';
import { parseFieldDescriptor } from '#utils/index';
import { InternalStackFrame, StackFrame } from '../stackframe';
import Thread from '../thread';
import { registerJavaLangClass } from './implementation/java/lang/Class';
import { registerJavaLangDouble } from './implementation/java/lang/Double';
import { registerJavaLangFloat } from './implementation/java/lang/Float';
import { registerJavaLangObject } from './implementation/java/lang/Object';
import { registerJavaLangSystem } from './implementation/java/lang/System';
import { registerJavaLangThread } from './implementation/java/lang/Thread';
import { registerJavaSecurityAccessController } from './implementation/java/security/AccessController';
import { registerSource } from './implementation/source';
import { registerUnsafe } from './implementation/sun/misc/Unsafe';
import { ArrayClassData } from '#types/class/ClassData';
import { checkSuccess, checkError } from '#types/Result';
import AbstractClassLoader from '../ClassLoader/AbstractClassLoader';
export class JNI {
  private classes: {
    [className: string]: {
      methods: {
        [methodName: string]: (thread: Thread, locals: any[]) => void;
      };
    };
  };

  constructor() {
    this.classes = {};
  }

  registerNativeMethod(
    className: string,
    methodName: string,
    method: (thread: Thread, locals: any[]) => void
  ) {
    if (!this.classes[className]) {
      this.classes[className] = {
        methods: {},
      };
    }
    this.classes[className].methods[methodName] = method;
  }

  getNativeMethod(
    className: string,
    methodName: string
  ): (thread: Thread, locals: any[]) => void {
    if (!this.classes?.[className]?.methods?.[methodName]) {
      // FIXME: Returns an empty function for now, but should throw an error
      console.error(`Native method missing: ${className}.${methodName} `);
      const retType = parseFieldDescriptor(methodName.split(')')[1], 0).type;

      switch (retType) {
        case JavaType.array:
          return (thread: Thread, ...params: any) => {
            thread.returnStackFrame(null);
          };
        case JavaType.byte:
        case JavaType.int:
        case JavaType.boolean:
        case JavaType.char:
        case JavaType.short:
          return (thread: Thread, ...params: any) => {
            thread.returnStackFrame(0);
          };
        case JavaType.double:
          return (thread: Thread, ...params: any) => {
            thread.returnStackFrame64(0.0);
          };
        case JavaType.float:
          return (thread: Thread, ...params: any) => {
            thread.returnStackFrame(0.0);
          };
        case JavaType.long:
          return (thread: Thread, ...params: any) => {
            thread.returnStackFrame64(0n);
          };
        case JavaType.reference:
          return (thread: Thread, ...params: any) => {
            thread.returnStackFrame(null);
          };
        case JavaType.void:
          return (thread: Thread, ...params: any) => {
            thread.returnStackFrame();
          };
        default:
          return (thread: Thread, ...params: any) => {
            thread.returnStackFrame();
          };
      }
    }
    console.log('Native method ', methodName);
    return this.classes[className].methods[methodName];
  }
}

export function registerNatives(jni: JNI) {
  /**
   * From Doppio
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
      thread.returnStackFrame(callerclass);
    }
  );

  jni.registerNativeMethod(
    'java/lang/String',
    'intern()Ljava/lang/String;',
    (thread: Thread, locals: any[]) => {
      const strObj = locals[0] as JvmObject;
      const strVal = j2jsString(strObj);
      const internedStr = thread.getJVM().getInternedString(strVal);
      thread.returnStackFrame(internedStr);
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
      thread.returnStackFrame(1);
    }
  );

  jni.registerNativeMethod(
    'sun/misc/VM',
    'initialize()V',
    (thread: Thread, locals: any[]) => {
      thread.returnStackFrame();
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
      const clsRef = clsObj.getNativeField('classRef') as ReferenceClassData;
      const methodRef = clsRef.getMethodFromSlot(methodSlot);
      if (!methodRef) {
        throw new Error('Invalid slot?');
      }

      const initRes = clsRef.initialize(thread);
      if (!checkSuccess(initRes)) {
        if (checkError(initRes)) {
          thread.throwNewException(initRes.exceptionCls, initRes.msg);
        }
        return;
      }

      const retObj = clsRef.instantiate();
      // FIXME: unbox args if required
      if (paramArr) {
        console.error('newInstance0: Auto unboxing not implemented');
      }
      const params = [retObj, ...(paramArr ? paramArr.getJsArray() : [])];
      thread.invokeStackFrame(
        new InternalStackFrame(clsRef, methodRef, 0, params, () => {
          thread.returnStackFrame();
          thread.returnStackFrame(retObj);
        })
      );
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
        thread.returnStackFrame();
        return;
      }

      throw new Error('Not implemented');
    }
  );

  // Based on OpenJDK 8 MethodHandleNatives.java #113
  enum MemberNameFlags {
    MN_IS_METHOD = 0x00010000, // method (not constructor)
    MN_IS_CONSTRUCTOR = 0x00020000, // constructor
    MN_IS_FIELD = 0x00040000, // field
    MN_IS_TYPE = 0x00080000, // nested type
    MN_CALLER_SENSITIVE = 0x00100000, // @CallerSensitive annotation detected
    MN_TRUSTED_FINAL = 0x00200000, // trusted final field
    MN_HIDDEN_MEMBER = 0x00400000, // members defined in a hidden class or with @Hidden
    MN_REFERENCE_KIND_SHIFT = 24, // refKind
    MN_REFERENCE_KIND_MASK = 0x0f000000 >> MN_REFERENCE_KIND_SHIFT,
  }

  enum MethodHandleReferenceKind {
    REF_getField = 1,
    REF_getStatic = 2,
    REF_putField = 3,
    REF_putStatic = 4,
    REF_invokeVirtual = 5,
    REF_invokeStatic = 6,
    REF_invokeSpecial = 7,
    REF_newInvokeSpecial = 8,
    REF_invokeInterface = 9,
  }

  // see: https://github.com/AdoptOpenJDK/openjdk-jdk11/blob/master/src/hotspot/share/prims/methodHandles.cpp#L711
  jni.registerNativeMethod(
    'java/lang/invoke/MethodHandleNatives',
    'resolve(Ljava/lang/invoke/MemberName;Ljava/lang/Class;)Ljava/lang/invoke/MemberName;',
    (thread: Thread, locals: any[]) => {
      const memberName = locals[0] as JvmObject; // MemberName

      const type = memberName._getField(
        'type',
        'Ljava/lang/Object;',
        'java/lang/invoke/MemberName'
      ) as JvmObject;
      const jNameString = memberName._getField(
        'name',
        'Ljava/lang/String;',
        'java/lang/invoke/MemberName'
      ) as JvmObject;
      const clsObj = memberName._getField(
        'clazz',
        'Ljava/lang/Class;',
        'java/lang/invoke/MemberName'
      ) as JvmObject;
      const flags = memberName._getField(
        'flags',
        'I',
        'java/lang/invoke/MemberName'
      ) as number;

      if (clsObj === null || jNameString === null || type === null) {
        console.log(clsObj === null, jNameString === null, type === null);
        thread.throwNewException(
          'java/lang/IllegalArgumentException',
          'Invalid MemberName'
        );
        return;
      }

      const clsRef = clsObj.getNativeField('classRef') as ReferenceClassData;
      const methodName = j2jsString(jNameString);

      if (
        flags &
        (MemberNameFlags.MN_IS_CONSTRUCTOR | MemberNameFlags.MN_IS_METHOD)
      ) {
        console.log('resolving method');

        const rtype = (
          (
            type._getField(
              'rtype',
              'Ljava/lang/Class;',
              'java/lang/invoke/MethodType'
            ) as JvmObject
          ).getNativeField('classRef') as ReferenceClassData
        ).getDescriptor();
        const ptypes = (
          type._getField(
            'ptypes',
            '[Ljava/lang/Class;',
            'java/lang/invoke/MethodType'
          ) as JvmArray
        )
          .getJsArray()
          .map((cls: JvmObject) =>
            cls.getNativeField('classRef').getDescriptor()
          );
        const methodDesc = `(${ptypes.join('')})${rtype}`;

        console.log('resolving: ', methodName + methodDesc);

        // method resolution
        const lookupRes = clsRef.lookupMethod(
          methodName + methodDesc,
          null as any,
          false,
          false,
          true,
          true
        );
        if (checkError(lookupRes)) {
          thread.throwNewException(
            'java/lang/NoSuchMethodError',
            `Invalid method ${methodDesc}`
          );
          return;
        }
        const method = lookupRes.result;

        console.log('resolution done: ', methodName + methodDesc);

        const methodFlags = method.getAccessFlags();
        console.warn(
          'MethodHandle resolution: CALLER_SENSITIVE not implemented'
        ); // FIXME: check method caller sensitive and |= caller sensitive flag.
        const refKind = flags >>> MemberNameFlags.MN_REFERENCE_KIND_SHIFT;
        memberName._putField(
          'flags',
          'I',
          'java/lang/invoke/MemberName',
          methodFlags | flags
        );

        memberName.putNativeField('method', method);
        console.log(
          'method resolve(Ljava/lang/invoke/MemberName;Ljava/lang/Class;)Ljava/lang/invoke/MemberName; FINISHED'
        );
        thread.returnStackFrame(memberName);
        return;
      } else if (flags & MemberNameFlags.MN_IS_FIELD) {
        // field resolution
        throw new Error('Field resolution not implemented');
      } else {
        console.log('Unknown member name');
        thread.throwNewException(
          'java/lang/LinkageError',
          `Could not resolve member name`
        );
        return;
      }
    }
  );

  jni.registerNativeMethod(
    'sun/reflect/Reflection',
    'getClassAccessFlags(Ljava/lang/Class;)I',
    (thread: Thread, locals: any[]) => {
      const clsObj = locals[0] as JvmObject;
      const clsRef = clsObj.getNativeField('classRef') as ReferenceClassData;
      thread.returnStackFrame(clsRef.getAccessFlags());
    }
  );

  jni.registerNativeMethod(
    'sun/reflect/NativeMethodAccessorImpl',
    'invoke0(Ljava/lang/reflect/Method;Ljava/lang/Object;[Ljava/lang/Object;)Ljava/lang/Object;',
    (thread: Thread, locals: any[]) => {
      const methodObj = locals[0] as JvmObject; // reflected method
      const methodCls = (
        methodObj._getField(
          'clazz',
          'Ljava/lang/Class;',
          'java/lang/reflect/Method'
        ) as JvmObject
      ).getNativeField('classRef') as ReferenceClassData;
      const methodSlot = methodObj._getField(
        'slot',
        'I',
        'java/lang/reflect/Method'
      ) as number;
      const method = methodCls.getMethodFromSlot(methodSlot);
      if (!method) {
        throw new Error('Invalid slot?');
      }
      const retType = methodObj._getField(
        'returnType',
        'Ljava/lang/Class;',
        'java/lang/reflect/Method'
      ) as JvmObject;

      const paramJavaArray = locals[2] as JvmArray;
      let params: any[] = [];
      if (paramJavaArray != null) {
        params = paramJavaArray.getJsArray().map(x => autoUnbox(x));
      }

      thread.invokeStackFrame(
        new InternalStackFrame(methodCls, method, 0, params, (ret, err) => {
          if (err) {
            // FIXME: wrap exception instead
            thread.throwNewException(
              'java/lang/reflect/InvocationTargetException',
              err.exceptionCls + ': ' + err.msg
            );
            return;
          }

          // void return type returns null
          if (ret === undefined) {
            thread.returnStackFrame(null);
            return;
          }
          thread.returnStackFrame(autoBox(ret));
        })
      );
    }
  );

  jni.registerNativeMethod(
    'java/lang/invoke/MethodHandleNatives',
    'init(Ljava/lang/invoke/MemberName;Ljava/lang/Object;)V',
    (thread: Thread, locals: any[]) => {
      const ref = locals[1] as JvmObject;
      const memberName = locals[0] as JvmObject;
      const refClassname = ref.getClass().getClassname();

      if (refClassname === 'java/lang/reflect/Field') {
        throw new Error('Not implemented');
      } else if (refClassname === 'java/lang/reflect/Method') {
        const clazz = ref._getField(
          'clazz',
          'Ljava/lang/Class;',
          'java/lang/reflect/Method'
        );
        const classData = clazz.getNativeField(
          'classRef'
        ) as ReferenceClassData;
        const methodSlot = ref._getField(
          'slot',
          'I',
          'java/lang/reflect/Method'
        ) as number;
        const method = classData.getMethodFromSlot(methodSlot);
        if (!method) {
          console.error(
            'init(Ljava/lang/invoke/MemberName;Ljava/lang/Object;)V: Method not found'
          );
          thread.returnStackFrame();
          return;
        }

        let flags = method.getAccessFlags() | MemberNameFlags.MN_IS_METHOD;
        if (method.checkStatic()) {
          flags |=
            MethodHandleReferenceKind.REF_invokeStatic <<
            MemberNameFlags.MN_REFERENCE_KIND_SHIFT;
        } else if (classData.checkInterface()) {
          flags |=
            MethodHandleReferenceKind.REF_invokeInterface <<
            MemberNameFlags.MN_REFERENCE_KIND_SHIFT;
        } else {
          flags |=
            MethodHandleReferenceKind.REF_invokeVirtual <<
            MemberNameFlags.MN_REFERENCE_KIND_SHIFT;
        }
        // constructor should be handled separately
        // check and |= callersensitive here in the future

        memberName._putField(
          'flags',
          'I',
          'java/lang/invoke/MemberName',
          flags
        );
        memberName._putField(
          'clazz',
          'Ljava/lang/Class;',
          'java/lang/invoke/MemberName',
          clazz
        );
        memberName.putNativeField('method', method);
        thread.returnStackFrame();
        return;
        // MemberNameFlags
      } else if (refClassname === 'java/lang/reflect/Constructor') {
        const clazz = ref._getField(
          'clazz',
          'Ljava/lang/Class;',
          'java/lang/reflect/Constructor'
        );
        const classData = clazz.getNativeField(
          'classRef'
        ) as ReferenceClassData;
        const methodSlot = ref._getField(
          'slot',
          'I',
          'java/lang/reflect/Constructor'
        ) as number;
        const method = classData.getMethodFromSlot(methodSlot);
        if (!method) {
          thread.returnStackFrame();
          return;
        }
        const flags =
          method.getAccessFlags() |
          MemberNameFlags.MN_IS_CONSTRUCTOR |
          (MethodHandleReferenceKind.REF_invokeSpecial <<
            MemberNameFlags.MN_REFERENCE_KIND_SHIFT);
        memberName._putField(
          'flags',
          'I',
          'java/lang/invoke/MemberName',
          flags
        );
        memberName._putField(
          'clazz',
          'Ljava/lang/Class;',
          'java/lang/invoke/MemberName',
          clazz
        );
        memberName.putNativeField('methodRef', method);
        thread.returnStackFrame();
        return;
      }

      thread.throwNewException(
        'java/lang/InternalError',
        'init: Invalid target.'
      );
    }
  );

  jni.registerNativeMethod(
    'java/lang/reflect/Array',
    'newArray(Ljava/lang/Class;I)Ljava/lang/Object;',
    (thread: Thread, locals: any[]) => {
      const clsRef = (locals[0] as JvmObject).getNativeField(
        'classRef'
      ) as ReferenceClassData;
      const length = locals[1] as number;
      const shouldWrap = !clsRef.checkPrimitive() && !clsRef.checkArray();
      let clsName = '[' + clsRef.getDescriptor();

      const arrClsRes = clsRef.getLoader().getClassRef(clsName);
      if (checkError(arrClsRes)) {
        console.error(
          'init(Ljava/lang/invoke/MemberName;Ljava/lang/Object;)V: Method not found'
        );
        thread.throwNewException(
          'java/lang/ClassNotFoundException',
          arrClsRes.msg
        );
        return;
      }
      const arrClsRef = arrClsRes.result as ArrayClassData;
      const arr = arrClsRef.instantiate();
      arr.initArray(length);
      thread.returnStackFrame(arr);
    }
  );

  jni.registerNativeMethod(
    'java/io/UnixFileSystem',
    'canonicalize0(Ljava/lang/String;)Ljava/lang/String;',
    (thread: Thread, locals: any[]) => {
      const pathStr = j2jsString(locals[1] as JvmObject);

      console.log(
        'canonicalize0(Ljava/lang/String;)Ljava/lang/String;: ',
        pathStr
      );

      thread.returnStackFrame(thread.getJVM().newString(pathStr));
    }
  );

  // sun/misc/Perf.createLong(Ljava/lang/String;IIJ)Ljava/nio/ByteBuffer;
  jni.registerNativeMethod(
    'sun/misc/Perf',
    'createLong(Ljava/lang/String;IIJ)Ljava/nio/ByteBuffer;',
    (thread: Thread, locals: any[]) => {
      const value = locals[4] as bigint;

      const bbRes = thread
        .getMethod()
        .getClass()
        .getLoader()
        .getClassRef('java/nio/DirectByteBuffer');
      if (checkError(bbRes)) {
        thread.throwNewException(bbRes.exceptionCls, bbRes.msg);
        return;
      }

      const bbCls = bbRes.result as ReferenceClassData;
      const heap = thread.getJVM().getUnsafeHeap();
      const addr = heap.allocate(BigInt(8));
      const buff = bbCls.instantiate();

      const bbInit = bbCls.getMethod('<init>(JI)V');
      if (!bbInit) {
        thread.throwNewException('java/lang/NoSuchMethodError', '<init>(JI)V');
        return;
      }

      thread.invokeStackFrame(
        new InternalStackFrame(
          bbCls,
          bbInit,
          0,
          [buff, addr, addr, 8], // Longs occupy 2 indexes
          (ret: JvmObject, err?: any) => {
            if (err) {
              thread.throwNewException(err.exceptionCls, err.msg);
              return;
            }
            heap.get(addr).setBigInt64(0, value);
            thread.returnStackFrame(buff);
          }
        )
      );
    }
  );
  // java/lang/ClassLoader.findLoadedClass0(Ljava/lang/String;)Ljava/lang/Class;
  jni.registerNativeMethod(
    'java/lang/ClassLoader',
    'findLoadedClass0(Ljava/lang/String;)Ljava/lang/Class;',
    (thread: Thread, locals: any[]) => {
      const className = j2jsString(locals[1] as JvmObject).replaceAll('.', '/');
      const loader: AbstractClassLoader =
        (locals[0] as JvmObject).getNativeField('$loader') ??
        thread.getJVM().getBootstrapClassLoader();

      console.log('findLoadedClass0: ', className);

      const res = loader.getClassRef(className);

      if (checkError(res)) {
        thread.throwNewException(res.exceptionCls, res.msg);
        return;
      }
      const cls = res.result;

      thread.returnStackFrame(cls.getJavaObject());
    }
  );

  /**
java/security/AccessController.getStackAccessControlContext()Ljava/security/AccessControlContext; 
java/io/FileInputStream.initIDs()V 
java/io/FileDescriptor.initIDs()V 
java/io/FileDescriptor.set(I)J 
java/io/FileDescriptor.set(I)J 
java/io/FileDescriptor.set(I)J 
java/io/FileOutputStream.initIDs()V 
java/util/concurrent/atomic/AtomicLong.VMSupportsCS8()Z 
sun/misc/Signal.findSignal(Ljava/lang/String;)I 
sun/misc/Signal.handle0(IJ)J 
sun/misc/Signal.findSignal(Ljava/lang/String;)I 
sun/misc/Signal.handle0(IJ)J 
sun/io/Win32ErrorMode.setErrorMode(J)J 
sun/io/Win32ErrorMode.setErrorMode(J)J 
java/lang/Object.notifyAll()V 
java/lang/invoke/MethodHandleNatives.registerNatives()V 
java/lang/invoke/MethodHandleNatives.getConstant(I)I 
Class.getEnclosingMethod0() for reference class
java/lang/Class.getDeclaringClass0()Ljava/lang/Class; 
java/lang/Class.getDeclaringClass0()Ljava/lang/Class; 
Class.getEnclosingMethod0() for reference class
sun/misc/Unsafe.putObjectVolatile(Ljava/lang/Object;JLjava/lang/Object;)V 
java/lang/ClassLoader.registerNatives()V 
java/io/WinNTFileSystem.initIDs()V 
java/io/WinNTFileSystem.getBooleanAttributes(Ljava/io/File;)I 
java/io/WinNTFileSystem.list(Ljava/io/File;)[Ljava/lang/String; 
java/security/AccessController.getStackAccessControlContext()Ljava/security/AccessControlContext; 
sun/misc/URLClassPath.getLookupCacheURLs(Ljava/lang/ClassLoader;)[Ljava/net/URL; 
java/io/WinNTFileSystem.canonicalize0(Ljava/lang/String;)Ljava/lang/String; 
java/lang/System.currentTimeMillis()J 
   */
}
