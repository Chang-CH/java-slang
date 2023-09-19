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
  private os: JsSystem;
  private jni: JNI;

  constructor(os: JsSystem) {
    this.os = os;
    this.bootstrapClassLoader = new BootstrapClassLoader(this.os, 'natives');
    this.applicationClassLoader = new ClassLoader(
      this.os,
      '',
      this.bootstrapClassLoader
    );
    this.jni = new JNI();
    this.engine = new ExecutionEngine(this.os, this.jni);

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
