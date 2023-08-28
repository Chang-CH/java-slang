import OsInterface from '#utils/OsInterface';
import MemoryArea from '../MemoryArea';
import Interpreter from './Interpreter';
import NativeThreadGroup from './NativeThreadGroup';
import NativeThread from './NativeThreadGroup/NativeThread';

export default class ExecutionEngine {
  memoryArea: MemoryArea;
  nativeThreadGroup: NativeThreadGroup;
  os: OsInterface;
  interpreter: Interpreter;

  constructor(memoryArea: MemoryArea, os: OsInterface) {
    this.memoryArea = memoryArea;
    this.os = os;
    this.nativeThreadGroup = new NativeThreadGroup();
    this.interpreter = new Interpreter(this.memoryArea);
  }

  runClass(className: string, args?: any[]) {
    console.warn('ExecutionEngine.runClass not implemented.');
    this.nativeThreadGroup.addThread(
      new NativeThread({
        operandStack: [],
        typeStack: [],
        locals: [],
        localType: [],
        className,
        methodName: 'main([Ljava/lang/String;)V',
        pc: 0,
        arguments: args ?? [],
        argumentTypes: [],
        this: null,
      })
    );

    this.interpreter.runFor(this.nativeThreadGroup.getThread(), 1000, () =>
      console.log('thread finished')
    );
  }
}
