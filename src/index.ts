import { ClassRef } from '#types/ClassRef';
import NodeSystem from '#utils/NodeSystem';
import BootstrapClassLoader from './components/ClassLoader/BootstrapClassLoader';
import ClassLoader from './components/ClassLoader/ClassLoader';
import ExecutionEngine from './components/ExecutionEngine';
import { JNI } from './components/JNI';

export default class JVM {
  private bootstrapClassLoader: BootstrapClassLoader;
  private applicationClassLoader: ClassLoader;
  private engine: ExecutionEngine;
  private nativeSystem: NodeSystem;
  private jni: JNI;

  constructor(nativeSystem: NodeSystem) {
    this.nativeSystem = nativeSystem;
    this.bootstrapClassLoader = new BootstrapClassLoader(
      this.nativeSystem,
      'natives'
    );
    this.applicationClassLoader = new ClassLoader(
      this.nativeSystem,
      '',
      this.bootstrapClassLoader
    );
    this.jni = new JNI();
    this.engine = new ExecutionEngine(this.jni);

    const threadCls =
      this.applicationClassLoader.getClassRef('java/lang/Thread').result;
    this.applicationClassLoader.getClassRef('java/lang/System').result;
    const sysCls =
      this.applicationClassLoader.getClassRef('java/lang/System').result;
    // this.engine.runMethod(
    //   threadCls as ClassRef,
    //   sysCls as ClassRef,
    //   'initializeSystemClass()V'
    // );
  }

  runClass(className: string) {
    // convert args to Java String[]
    const mainRes = this.applicationClassLoader.getClassRef(className);

    const threadRes =
      this.applicationClassLoader.getClassRef('java/lang/Thread');

    if (threadRes.error || !threadRes.result) {
      throw new Error('Thread class not found');
    }

    if (mainRes.error || !mainRes.result) {
      throw new Error('Main class not found');
    }

    this.engine.runClass(threadRes.result, mainRes.result);
  }
}
