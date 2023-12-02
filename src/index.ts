import { Field } from '#types/class/Field';
import { ArrayClassData, ReferenceClassData } from '#types/class/ClassData';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';
import AbstractSystem from '#utils/AbstractSystem';
import BootstrapClassLoader from './components/ClassLoader/BootstrapClassLoader';
import ApplicationClassLoader from './components/ClassLoader/ApplicationClassLoader';
import { JNI, registerNatives } from './components/JNI';
import Thread, { ThreadStatus } from './components/thread';
import { UnsafeHeap } from './components/unsafe-heap';
import {
  AbstractThreadPool,
  RoundRobinThreadPool,
} from './components/ThreadPool';
import { InternalStackFrame, JavaStackFrame } from './components/stackframe';
import {
  checkError,
  checkSuccess,
  ImmediateResult,
  SuccessResult,
} from '#types/Result';

export default class JVM {
  private bootstrapClassLoader: BootstrapClassLoader;
  private applicationClassLoader?: ApplicationClassLoader;
  private nativeSystem: AbstractSystem;
  private jni: JNI;
  private threadpool: AbstractThreadPool;

  cachedClasses: { [key: string]: ReferenceClassData } = {};
  private internedStrings: { [key: string]: JvmObject } = {};
  private unsafeHeap: UnsafeHeap = new UnsafeHeap();

  // Reuse the thread we use in initialization for running main method
  private _initialThread?: Thread;
  private jvmOptions: {
    javaClassPath: string;
    userDir: string;
  };

  constructor(
    nativeSystem: AbstractSystem,
    options?: {
      javaClassPath?: string;
      userDir?: string;
    }
  ) {
    this.jvmOptions = {
      javaClassPath: 'natives',
      userDir: 'example',
      ...options,
    };

    this.nativeSystem = nativeSystem;
    this.bootstrapClassLoader = new BootstrapClassLoader(
      this.nativeSystem,
      this.jvmOptions.javaClassPath
    );
    this.jni = new JNI();
    this.threadpool = new RoundRobinThreadPool(() => {});
  }

  initialize() {
    // #region load classes
    const objRes = this.bootstrapClassLoader.getClassRef('java/lang/Object');
    const tRes = this.bootstrapClassLoader.getClassRef('java/lang/Thread');
    const sysRes = this.bootstrapClassLoader.getClassRef('java/lang/System');
    const clsRes = this.bootstrapClassLoader.getClassRef('java/lang/Class');
    const tgRes = this.bootstrapClassLoader.getClassRef(
      'java/lang/ThreadGroup'
    );
    const unsafeRes = this.bootstrapClassLoader.getClassRef('sun/misc/Unsafe');
    if (
      checkError(objRes) ||
      checkError(sysRes) ||
      checkError(tRes) ||
      checkError(tgRes) ||
      checkError(clsRes) ||
      checkError(unsafeRes)
    ) {
      throw new Error('Initialization classes not found');
    }
    const sysCls = sysRes.result;
    const threadCls = tRes.result;
    const threadGroupCls = tgRes.result;
    // #endregion

    // register natives
    registerNatives(this.jni);

    const mainThread = new Thread(
      threadCls as ReferenceClassData,
      this,
      this.threadpool
    );

    // #region initialize threadgroup object
    const tgInitRes = threadGroupCls.initialize(mainThread);
    if (!checkSuccess(tgInitRes)) {
      throw new Error('ThreadGroup initialization failed');
    }
    const initialTg = threadGroupCls.instantiate();
    initialTg.initialize(mainThread);
    mainThread._run();
    // #endregion

    // #region initialize Thread class
    const tgfr = threadCls.getFieldRef('groupLjava/lang/ThreadGroup;');
    const pFr = threadCls.getFieldRef('priorityI');
    if (!tgfr || !pFr) {
      throw new Error('Initial thread fields not found');
    }
    const javaThread = mainThread.getJavaObject();
    javaThread.putField(tgfr, initialTg);
    javaThread.putField(pFr, 1);

    threadCls.initialize(mainThread);
    mainThread._run();
    // #endregion

    // #region initialize thread object
    mainThread.initialize(mainThread);
    mainThread._run();
    this._initialThread = mainThread;
    // #endregion
    console.log('Thread initialized');

    // #region initialize system class
    const sInitMr = sysCls.getMethod('initializeSystemClass()V');
    if (!sInitMr) {
      throw new Error('System initialization method not found');
    }
    mainThread.invokeStackFrame(
      new InternalStackFrame(
        sysCls as ReferenceClassData,
        sInitMr,
        0,
        [],
        () => {}
      )
    );
    mainThread._run();
    console.log('System initialized');
    // #endregion
  }

  runClass(className: string) {
    this.applicationClassLoader = new ApplicationClassLoader(
      this.nativeSystem,
      this.jvmOptions.userDir,
      this.bootstrapClassLoader
    );

    // convert args to Java String[]
    const mainRes = this.applicationClassLoader.getClassRef(className);

    const threadRes =
      this.applicationClassLoader.getClassRef('java/lang/Thread');

    if (checkError(threadRes)) {
      throw new Error('Thread class not found');
    }
    if (checkError(mainRes)) {
      throw new Error('Main class not found');
    }

    const mainCls = mainRes.result;
    const threadCls = threadRes.result;

    const mainMethod = mainCls.getMethod('main([Ljava/lang/String;)V');
    if (!mainMethod) {
      throw new Error('Main method not found');
    }
    const mainThread = this._initialThread as Thread;
    mainThread.invokeStackFrame(new JavaStackFrame(mainCls, mainMethod, 0, []));
    mainCls.initialize(mainThread);
    mainThread.setStatus(ThreadStatus.RUNNABLE);
    this.threadpool.addThread(mainThread);
    this.threadpool.run();
  }

  private newCharArr(str: string): JvmArray {
    // Assume char array loaded at init
    const cArrRes = this.bootstrapClassLoader.getClassRef(
      '[C'
    ) as SuccessResult<ArrayClassData>;
    const cArrCls = cArrRes.result;
    const cArr = cArrCls.instantiate() as JvmArray;
    const jsArr = [];
    for (let i = 0; i < str.length; i++) {
      jsArr.push(str.charCodeAt(i));
    }
    cArr.initArray(str.length, jsArr);
    return cArr;
  }

  newString(str: string): JvmObject {
    const charArr = this.newCharArr(str);
    const strRes = this.bootstrapClassLoader.getClassRef(
      'java/lang/String'
    ) as SuccessResult<ReferenceClassData>;
    const strCls = strRes.result;
    const strObj = strCls.instantiate();
    const fieldRef = strCls.getFieldRef('value[C') as Field;
    strObj.putField(fieldRef as Field, charArr);
    return strObj;
  }

  getInternedString(str: string) {
    if (this.internedStrings[str]) {
      return this.internedStrings[str];
    }
    this.internedStrings[str] = this.newString(str);
    return this.internedStrings[str];
  }

  getBootstrapClassLoader() {
    return this.bootstrapClassLoader;
  }

  getUnsafeHeap() {
    return this.unsafeHeap;
  }

  getSystem() {
    return this.nativeSystem;
  }

  getJNI() {
    return this.jni;
  }
}
