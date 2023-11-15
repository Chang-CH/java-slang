import { Field } from '#types/class/Field';
import { ClassData } from '#types/class/ClassData';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';
import {
  ImmediateResult,
  ErrorResult,
  SuccessResult,
  checkError,
  checkSuccess,
} from '#types/result';
import AbstractSystem from '#utils/AbstractSystem';
import BootstrapClassLoader from './components/ClassLoader/BootstrapClassLoader';
import ApplicationClassLoader from './components/ClassLoader/ApplicationClassLoader';
import ExecutionEngine from './components/ExecutionEngine';
import { JNI, registerNatives } from './components/JNI';
import Thread from './components/Thread/Thread';
import { UnsafeHeap } from './components/UnsafeHeap';

export default class JVM {
  private bootstrapClassLoader: BootstrapClassLoader;
  private applicationClassLoader?: ApplicationClassLoader;
  private engine: ExecutionEngine;
  private nativeSystem: AbstractSystem;
  private jni: JNI;

  cachedClasses: { [key: string]: ClassData } = {};
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
    this.engine = new ExecutionEngine(this.jni);
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

    const mainThread = new Thread(threadCls, this);

    // #region initialize threadgroup object
    const tgInitRes = threadGroupCls.initialize(mainThread);
    if (!checkSuccess(tgInitRes)) {
      throw new Error('ThreadGroup initialization failed');
    }
    const initialTg = threadGroupCls.instantiate();
    initialTg.initialize(mainThread);
    this.engine.runThread(mainThread);
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
    this.engine.runThread(mainThread);
    // #endregion

    // #region initialize thread object
    mainThread.initialize(mainThread);
    this.engine.runThread(mainThread);
    this._initialThread = mainThread;
    // #endregion

    // #region initialize system class
    console.log('// #region initializing system class'.padEnd(150, '#'));
    const sInitMr = sysCls.getMethod('initializeSystemClass()V');
    if (!sInitMr) {
      throw new Error('System initialization method not found');
    }
    mainThread.invokeSf(sysCls, sInitMr, 0, []);
    this.engine.runThread(mainThread);
    console.log('// #endregion system class initialized'.padEnd(150, '#'));
    // #endregion

    //   'source/Source',
    //   'println(I)V',
    //   (thread: NativeThread, locals: any[]) => console.log(locals[0])
    // );
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
    mainThread.invokeSf(mainCls, mainMethod, 0, []);
    mainCls.initialize(mainThread);

    this.engine.addThread(mainThread);
    this.engine.run();
  }

  private newCharArr(str: string): ImmediateResult<JvmArray> {
    const cArrRes = this.bootstrapClassLoader.getClassRef('[C');
    if (checkError(cArrRes)) {
      return cArrRes;
    }

    const cArrCls = cArrRes.result;
    const cArr = cArrCls.instantiate() as JvmArray;
    const jsArr = [];
    for (let i = 0; i < str.length; i++) {
      jsArr.push(str.charCodeAt(i));
    }
    cArr.initArray(str.length, jsArr);
    return { result: cArr };
  }

  private newString(str: string): ImmediateResult<JvmObject> {
    const charArr = this.newCharArr(str);

    if (!checkSuccess(charArr)) {
      return charArr;
    }

    const strRes = this.bootstrapClassLoader.getClassRef('java/lang/String');

    if (checkError(strRes)) {
      return strRes;
    }
    const strCls = strRes.result;
    const strObj = strCls.instantiate();
    const fieldRef = strCls.getFieldRef('value[C') as Field;
    strObj.putField(fieldRef as Field, charArr.result);
    return { result: strObj };
  }

  getInternedString(str: string) {
    if (this.internedStrings[str]) {
      return this.internedStrings[str];
    }
    const strRes = this.newString(str);
    if (checkError(strRes)) {
      throw new Error('String creation failed');
    }

    this.internedStrings[str] = strRes.result;
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
