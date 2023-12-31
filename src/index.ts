import { ReferenceClassData } from '#types/class/ClassData';
import type { JvmObject } from '#types/reference/Object';
import AbstractSystem from '#utils/AbstractSystem';
import BootstrapClassLoader from './components/ClassLoader/BootstrapClassLoader';
import ApplicationClassLoader from './components/ClassLoader/ApplicationClassLoader';
import { JNI } from './components/JNI';
import { UnsafeHeap } from './components/unsafe-heap';
import {
  AbstractThreadPool,
  RoundRobinThreadPool,
} from './components/ThreadPool';
import { InternalStackFrame } from './components/stackframe';
import { checkError, checkSuccess } from '#types/Result';
import { js2jString } from './utils';
import { ThreadStatus } from './components/thread/constants';
import Thread from './components/thread/thread';

export default class JVM {
  private bootstrapClassLoader: BootstrapClassLoader;
  private applicationClassLoader?: ApplicationClassLoader;
  private nativeSystem: AbstractSystem;
  private jni: JNI;
  private threadpool: AbstractThreadPool;

  cachedClasses: { [key: string]: ReferenceClassData } = {};
  private internedStrings: { [key: string]: JvmObject } = {};
  private unsafeHeap: UnsafeHeap = new UnsafeHeap();
  private _initialThread?: Thread; // Reuse initialization thread as main thread

  private jvmOptions: {
    javaClassPath: string;
    userDir: string;
  };
  private isInitialized = false;

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

  initialize(onInitialized: () => void) {
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

    const mainThread = new Thread(
      threadCls as ReferenceClassData,
      this,
      this.threadpool
    );

    const tasks: (() => void)[] = [];
    // #region initialize threadgroup object
    const tgInitRes = threadGroupCls.initialize(mainThread);
    if (!checkSuccess(tgInitRes)) {
      throw new Error('ThreadGroup initialization failed');
    }
    const initialTg = threadGroupCls.instantiate();
    tasks.push(() => initialTg.initialize(mainThread));
    // #endregion

    // #region initialize Thread class
    const tgfr = threadCls.lookupField('groupLjava/lang/ThreadGroup;');
    const pFr = threadCls.lookupField('priorityI');
    if (!tgfr || !pFr) {
      throw new Error('Initial thread fields not found');
    }
    const javaThread = mainThread.getJavaObject();
    javaThread.putField(tgfr, initialTg);
    javaThread.putField(pFr, 1);
    tasks.push(() => threadCls.initialize(mainThread));
    // #endregion

    // #region initialize thread object
    this._initialThread = mainThread;
    tasks.push(() => mainThread.initialize(mainThread));
    // #endregion

    // #region initialize system class
    const sInitMr = sysCls.getMethod('initializeSystemClass()V');
    if (!sInitMr) {
      throw new Error('System initialization method not found');
    }

    tasks.push(() =>
      mainThread.invokeStackFrame(
        new InternalStackFrame(
          sysCls as ReferenceClassData,
          sInitMr,
          0,
          [],
          () => {
            this.isInitialized = true;
            onInitialized();
          }
        )
      )
    );
    // #endregion

    tasks.reverse().forEach(task => task());
    mainThread.setStatus(ThreadStatus.RUNNABLE);
    this.threadpool.addThread(mainThread);
    this.threadpool.run();
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
    mainThread.invokeStackFrame(
      new InternalStackFrame(mainCls, mainMethod, 0, [], () => {})
    );
    mainCls.initialize(mainThread);
    mainThread.setStatus(ThreadStatus.RUNNABLE);
    // FIXME: thread should have terminated and be removed from tpool
    // this.threadpool.addThread(mainThread);
    this.threadpool.run();
  }

  getInternedString(str: string) {
    if (this.internedStrings[str]) {
      return this.internedStrings[str];
    }
    this.internedStrings[str] = js2jString(this.bootstrapClassLoader, str);
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

  checkInitialized() {
    return this.isInitialized;
  }
}
