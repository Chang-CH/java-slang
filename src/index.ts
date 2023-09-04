import OsInterface from '#utils/OsInterface';
import BootstrapClassLoader from './components/ClassLoader/BootstrapClassLoader';
import ExecutionEngine from './components/ExecutionEngine';
import { JNI } from './components/JNI';
import MemoryArea from './components/MemoryArea';

export default class JVM {
  memoryArea: MemoryArea;
  bootstrapClassLoader: BootstrapClassLoader;
  engine: ExecutionEngine;
  os: OsInterface;
  jni: JNI;

  constructor(os: OsInterface) {
    this.memoryArea = new MemoryArea(new JNI());
    this.os = os;
    this.bootstrapClassLoader = new BootstrapClassLoader(
      this.memoryArea,
      this.os
    );
    this.jni = new JNI();
    this.engine = new ExecutionEngine(this.memoryArea, this.os, this.jni);
  }

  runClass(filepath: string) {
    // TODO: check JVM status initialized
    // convert args to Java String[]

    // FIXME: should use system class loader instead.
    // should class loader be called by memory area on class not found?
    this.bootstrapClassLoader.load(filepath, cls => {
      const className = cls.this_class;
      this.engine.runClass(className);
    });
  }
}
