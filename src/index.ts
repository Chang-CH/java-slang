import { ClassRef } from '#types/ClassRef';
import JsSystem from '#utils/JsSystem';
import BootstrapClassLoader from './components/ClassLoader/BootstrapClassLoader';
import ClassLoader from './components/ClassLoader/ClassLoader';
import ExecutionEngine from './components/ExecutionEngine';
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
    this.applicationClassLoader.load(
      'java/lang/Thread',
      () => {},
      e => {
        throw e;
      }
    );
  }

  runClass(filepath: string) {
    // TODO: check JVM status initialized
    // convert args to Java String[]

    // FIXME: should use system class loader instead.
    // should class loader be called by memory area on class not found?
    this.applicationClassLoader.load(filepath, cls => {
      const threadCls = this.bootstrapClassLoader.getClassRef(
        'java/lang/Thread',
        console.error
      ) as ClassRef;

      this.engine.runClass(threadCls, cls);
    });
  }
}
