import MemoryArea from '#jvm/components/MemoryArea';
import { JavaReference } from '#types/DataTypes';
import { InstructionPointer, StackFrame } from './types';

export default class NativeThread {
  stack: StackFrame[];
  stackPointer: number;

  constructor(initialFrame: StackFrame) {
    this.stack = [initialFrame];
    this.stackPointer = 0;
  }

  getCurrentInstruction(): InstructionPointer | undefined {
    const currentFrame = this.stack?.[this.stackPointer];

    if (!currentFrame) {
      return;
    }

    return {
      className: currentFrame.className,
      methodName: currentFrame.methodName,
      pc: currentFrame.pc,
    };
  }

  getClassName(): string {
    return this.stack[this.stackPointer].className;
  }

  getMethodName(): string {
    return this.stack[this.stackPointer].methodName;
  }

  peekStackFrame() {
    return this.stack[this.stackPointer];
  }

  pushStack(value: any) {
    // check for stack overflow?
    this.stack[this.stackPointer].operandStack.push(value);
  }

  pushStackWide(value: any) {
    // check for stack overflow?
    this.stack[this.stackPointer].operandStack.push(value);
    this.stack[this.stackPointer].operandStack.push(value);
  }

  popStackWide() {
    if (this.stack?.[this.stackPointer]?.operandStack?.length <= 1) {
      throw new Error('JVM Stack underflow');
      // TODO: throw java error
    }
    this.stack?.[this.stackPointer]?.operandStack?.pop();
    const value = this.stack?.[this.stackPointer]?.operandStack?.pop();
    if (value === undefined) {
      throw new Error('JVM Stack underflow');
      // TODO: throw java error
    }
    return value;
  }

  popStack() {
    if (this.stack?.[this.stackPointer]?.operandStack?.length <= 0) {
      throw new Error('JVM Stack underflow');
      // TODO: throw java error
    }
    const value = this.stack?.[this.stackPointer]?.operandStack?.pop();
    return value;
  }

  popStackFrame() {
    const sf = this.stack.pop();
    this.stackPointer -= 1;
    // TODO: remove thread from threadpool?
  }

  pushStackFrame(frame: StackFrame) {
    this.stack.push(frame);
    this.stackPointer += 1;
  }

  storeLocal(index: number, value: any) {
    this.stack[this.stackPointer].locals[index] = value;
  }

  storeLocalWide(index: number, value: any) {
    this.stack[this.stackPointer].locals[index] = value;
  }

  loadLocal(index: number): any {
    return this.stack[this.stackPointer].locals[index];
  }

  loadLocalWide(index: number): any {
    return this.stack[this.stackPointer].locals[index];
  }

  throwNewException(className: string, memoryArea: MemoryArea, msg: string) {
    const invoker = this.getClassName();

    // Load class if not loaded
    memoryArea.getClass(className, e => {
      memoryArea.getClass(invoker).loader.load(
        className,
        () => {},
        e => {
          throw e;
        }
      );
    });
    // Class not initialized, initialize it.
    if (!memoryArea.getClass(className).isInitialized) {
      if (memoryArea.getClass(className).methods['<clinit>()V']) {
        this.pushStackFrame({
          className,
          methodName: '<clinit>()V',
          pc: 0,
          operandStack: [],
          this: null,
          locals: [],
        });
        memoryArea.getClass(className).isInitialized = true;
        return;
      }
      memoryArea.getClass(className).isInitialized = true;
    }

    // Initialize exception
    // TODO: push msg to stack
    // this.pushStackFrame({
    //   operandStack: [],
    //   className: className,
    //   methodName: '<init>(Ljava/lang/String;)V',
    //   pc: 0,
    //   this: undefined,
    //   locals: [],
    // });
    const objectref = new JavaReference(className, {});
    this.throwException(memoryArea, objectref);
  }

  throwException(memoryArea: MemoryArea, exception: any) {
    // Find a stackframe with appropriate exception handlers
    while (this.stack.length > 0) {
      const instruction = this.getCurrentInstruction();

      if (!instruction) {
        this.popStackFrame();
        continue;
      }

      const { className, methodName } = instruction;
      const eTable =
        memoryArea.getClass(className)?.methods[methodName]?.code
          ?.exception_table;

      // TODO: check if exception is handled
      this.popStackFrame();
    }

    // Unhandled exception.
    this.pushStackFrame({
      operandStack: [],
      className: 'java/lang/Thread',
      methodName: 'dispatchUncaughtException(Ljava/lang/Throwable;)V',
      pc: 0,
      this: this,
      locals: [this, exception],
    });
  }
}
