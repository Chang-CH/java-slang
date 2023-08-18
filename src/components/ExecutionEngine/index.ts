import OsInterface from '#utils/OsInterface';
import MemoryArea from '../MemoryArea';
import NativeThreadGroup from './NativeThreadGroup';

export default class ExecutionEngine {
  memoryArea: MemoryArea;
  nativeThreadGroup: NativeThreadGroup;
  os: OsInterface;

  constructor(memoryArea: MemoryArea, os: OsInterface) {
    this.memoryArea = memoryArea;
    this.os = os;
    this.nativeThreadGroup = new NativeThreadGroup();
  }
  runClass(className: string) {
    console.warn('ExecutionEngine.runClass not implemented.');
  }
}
