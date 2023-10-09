import { ClassRef } from '#types/ConstantRef';
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
      this.applicationClassLoader._resolveClass('java/lang/Thread');
    this.applicationClassLoader._resolveClass('java/lang/System');
    const sysCls =
      this.applicationClassLoader._resolveClass('java/lang/System');
    // this.engine.runMethod(threadCls, sysCls, 'initializeSystemClass()V');
  }

  runClass(className: string) {
    // convert args to Java String[]
    const cls = this.applicationClassLoader._resolveClass(className);

    const threadCls =
      this.applicationClassLoader._resolveClass('java/lang/Thread');

    if (!threadCls) {
      throw new Error('Thread class not found');
    }

    if (!cls) {
      throw new Error('Main class not found');
    }

    this.engine.runClass(threadCls, cls);
  }
}
