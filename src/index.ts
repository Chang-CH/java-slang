import { ClassRef } from '#types/ConstantRef';
import JsSystem from '#utils/JsSystem';
import BootstrapClassLoader from './components/ClassLoader/BootstrapClassLoader';
import ClassLoader from './components/ClassLoader/ClassLoader';
import ExecutionEngine from './components/ExecutionEngine';
import NativeThread from './components/ExecutionEngine/NativeThreadGroup/NativeThread';
import { JNI } from './components/JNI';

export default class JVM {
  private bootstrapClassLoader: BootstrapClassLoader;
  private applicationClassLoader: ClassLoader;
  private engine: ExecutionEngine;
  private nativeSystem: JsSystem;
  private jni: JNI;

  constructor(nativeSystem: JsSystem) {
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

    // Load thread class manually
    this.applicationClassLoader.load('java/lang/Thread');
  }

  runClass(className: string) {
    // TODO: check JVM status initialized
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
