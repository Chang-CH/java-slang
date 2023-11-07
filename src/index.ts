import { FieldRef } from '#types/FieldRef';
import { ClassRef } from '#types/class/ClassRef';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';
import { ImmediateResult, ErrorResult, SuccessResult } from '#types/result';
import AbstractSystem from '#utils/AbstractSystem';
import NodeSystem from '#utils/NodeSystem';
import AbstractClassLoader from './components/ClassLoader/AbstractClassLoader';
import BootstrapClassLoader from './components/ClassLoader/BootstrapClassLoader';
import ClassLoader from './components/ClassLoader/ClassLoader';
import ExecutionEngine from './components/ExecutionEngine';
import { JNI, registerNatives } from './components/JNI';
import Thread from './components/Thread/Thread';

export default class JVM {
  private bootstrapClassLoader: BootstrapClassLoader;
  private applicationClassLoader?: ClassLoader;
  private engine: ExecutionEngine;
  private nativeSystem: AbstractSystem;
  private jni: JNI;

  cachedClasses: { [key: string]: ClassRef } = {};
  private internedStrings: { [key: string]: JvmObject } = {};

  // Reuse the thread we use in initialization for running main method
  private _initialThread?: Thread;

  constructor(nativeSystem: AbstractSystem) {
    this.nativeSystem = nativeSystem;
    this.bootstrapClassLoader = new BootstrapClassLoader(
      this.nativeSystem,
      'natives'
    );
    // native classes loaded with bscl loaded as null classloader
    //   private java.lang.Class(java.lang.ClassLoader, java.lang.Class<?> array class, null otherwise);

    // this.applicationClassLoader = new ClassLoader(
    //   this.nativeSystem,
    //   'example',
    //   this.bootstrapClassLoader
    // );
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
      objRes.checkError() ||
      sysRes.checkError() ||
      tRes.checkError() ||
      tgRes.checkError() ||
      clsRes.checkError() ||
      unsafeRes.checkError()
    ) {
      throw new Error('Initialization classes not found');
    }
    const sysCls = sysRes.getResult();
    const threadCls = tRes.getResult();
    const threadGroupCls = tgRes.getResult();
    // #endregion

    // register natives
    registerNatives(this.jni);

    const mainThread = new Thread(threadCls, this);

    // #region 1: initialize threadgroup object
    const tgInitRes = threadGroupCls.initialize(mainThread);
    if (!tgInitRes.checkSuccess()) {
      throw new Error('ThreadGroup initialization failed');
    }
    const initialTg = threadGroupCls.instantiate();
    initialTg.initialize(mainThread);
    this.engine.runThread(mainThread);
    console.log('// #endregion threadGroup loaded'.padEnd(150, '#'));
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

  runClass(classPath: string) {
    let classDir: any = classPath.split('/');
    const className = classDir.pop();
    classDir = classDir.join('/');

    this.applicationClassLoader = new ClassLoader(
      this.nativeSystem,
      classDir,
      this.bootstrapClassLoader
    );

    // convert args to Java String[]
    const mainRes = this.applicationClassLoader.getClassRef(className);

    const threadRes =
      this.applicationClassLoader.getClassRef('java/lang/Thread');

    if (threadRes.checkError()) {
      throw new Error('Thread class not found');
    }
    if (mainRes.checkError()) {
      throw new Error('Main class not found');
    }

    const mainCls = mainRes.getResult();
    const threadCls = threadRes.getResult();

    const mainMethod = mainCls.getMethod('main([Ljava/lang/String;)V');
    if (!mainMethod) {
      throw new Error('Main method not found');
    }
    const mainThread = this._initialThread as Thread;
    mainThread.invokeSf(mainCls, mainMethod, 0, []);

    this.engine.addThread(mainThread);
    this.engine.run();
  }

  private newCharArr(str: string): ImmediateResult<JvmArray> {
    const cArrRes = this.bootstrapClassLoader.getClassRef('[C');
    if (cArrRes.checkError()) {
      const err = cArrRes.getError();
      return new ErrorResult<JvmArray>(err.className, err.msg);
    }

    const cArrCls = cArrRes.getResult();
    const cArr = cArrCls.instantiate() as JvmArray;
    const jsArr = [];
    for (let i = 0; i < str.length; i++) {
      jsArr.push(str.charCodeAt(i));
    }
    cArr.initArray(str.length, jsArr);
    return new SuccessResult<JvmArray>(cArr);
  }

  private newString(str: string): ImmediateResult<JvmObject> {
    const charArr = this.newCharArr(str);

    if (!charArr.checkSuccess()) {
      return charArr;
    }

    const strRes = this.bootstrapClassLoader.getClassRef('java/lang/String');

    if (strRes.checkError()) {
      const err = strRes.getError();
      return new ErrorResult<JvmObject>(err.className, err.msg);
    }
    const strCls = strRes.getResult();
    const strObj = strCls.instantiate();
    const fieldRef = strCls.getFieldRef('value[C') as FieldRef;
    strObj.putField(fieldRef as FieldRef, charArr.getResult());
    return new SuccessResult<JvmObject>(strObj);
  }

  getInternedString(str: string) {
    if (this.internedStrings[str]) {
      return this.internedStrings[str];
    }
    const strRes = this.newString(str);
    if (strRes.checkError()) {
      throw new Error('String creation failed');
    }

    this.internedStrings[str] = strRes.getResult();
    return this.internedStrings[str];
  }
}
