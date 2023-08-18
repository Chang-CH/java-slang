import OsInterface from '#utils/OsInterface';
import BootstrapClassLoader from './components/ClassLoader/BootstrapClassLoader';
import ExecutionEngine from './components/ExecutionEngine';
import MemoryArea from './components/MemoryArea';

export default class JVM {
  memoryArea: MemoryArea;
  bootstrapClassLoader: BootstrapClassLoader;
  engine: ExecutionEngine;
  os: OsInterface;

  constructor(os: OsInterface) {
    this.memoryArea = new MemoryArea();
    this.os = os;
    this.bootstrapClassLoader = new BootstrapClassLoader(
      this.memoryArea,
      this.os
    );
    this.engine = new ExecutionEngine(this.memoryArea, this.os);
  }

  runClass(filepath: string) {
    console.warn('JVM.runClass not implemented.');
  }
}
