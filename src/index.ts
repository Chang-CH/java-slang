import { ClassRef } from '#types/class/ClassRef';
import NodeSystem from '#utils/NodeSystem';
import BootstrapClassLoader from './components/ClassLoader/BootstrapClassLoader';
import ClassLoader from './components/ClassLoader/ClassLoader';
import ExecutionEngine from './components/ExecutionEngine';
import { JNI, registerNatives } from './components/JNI';
import Thread from './components/Thread/Thread';

export default class JVM {
  private bootstrapClassLoader: BootstrapClassLoader;
  private applicationClassLoader?: ClassLoader;
  private engine: ExecutionEngine;
  private nativeSystem: NodeSystem;
  private jni: JNI;

  constructor(nativeSystem: NodeSystem) {
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

    // #region load classes
    const tRes = this.bootstrapClassLoader.getClassRef('java/lang/Thread');
    const sysRes = this.bootstrapClassLoader.getClassRef('java/lang/System');
    const tgRes = this.bootstrapClassLoader.getClassRef(
      'java/lang/ThreadGroup'
    );
    if (sysRes.checkError() || tRes.checkError() || tgRes.checkError()) {
      throw new Error('Initialization classes not found');
    }
    const sysCls = sysRes.getResult();
    const threadCls = tRes.getResult();
    const threadGroupCls = tgRes.getResult();
    // #endregion

    registerNatives(this.jni);

    const mainThread = new Thread(threadCls);

    // #region initialize threadgroup object
    console.log('// #region initializing threadgroup'.padEnd(150, '#'));
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
    console.log('initializing Thread class'.padEnd(150, '#'));
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
    console.log('Thread class loaded'.padEnd(150, '#'));
    // #endregion

    // #region initialize thread object
    console.log('// #region initializing thread object'.padEnd(150, '#'));
    mainThread.initialize(mainThread);
    this.engine.runThread(mainThread);
    console.log('// #endregion thread object initialized'.padEnd(150, '#'));
    // #endregion

    // initialize system class
    console.log('// #region initializing system class'.padEnd(150, '#'));
    const sInitMr = sysCls.getMethod('initializeSystemClass()V');
    if (!sInitMr) {
      throw new Error('System initialization method not found');
    }
    mainThread.invokeSf(sysCls, sInitMr, 0, []);
    this.engine.runThread(mainThread);
    console.log('// #endregion system class initialized'.padEnd(150, '#'));

    // this.jni.registerNativeMethod(
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

    this.engine.runClass(threadRes.getResult(), mainRes.getResult());
  }
}
