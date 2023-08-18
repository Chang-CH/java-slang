import BootstrapClassLoader from './components/ClassLoader/BootstrapClassLoader';
import ExecutionEngine from './components/ExecutionEngine';
import MemoryArea from './components/MemoryArea';

export default class JVM {
  memoryArea: MemoryArea;
  bootstrapClassLoader: BootstrapClassLoader;
  engine: ExecutionEngine;

  constructor() {
    this.memoryArea = new MemoryArea();
    this.bootstrapClassLoader = new BootstrapClassLoader(this.memoryArea);
    this.engine = new ExecutionEngine(this.memoryArea);
  }
  runClass(className: string) {
    console.warn('JVM.runClass not implemented.');
  }
}
