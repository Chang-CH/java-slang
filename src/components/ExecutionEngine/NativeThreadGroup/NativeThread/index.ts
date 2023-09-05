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
    this.stack?.[this.stackPointer]?.operandStack?.pop();
    const value = this.stack?.[this.stackPointer]?.operandStack?.pop();
    if (value === undefined) {
      throw new Error('JVM Stack underflow');
      // TODO: throw java error
    }
    return value;
  }

  popStack() {
    const value = this.stack?.[this.stackPointer]?.operandStack?.pop();
    if (value === undefined) {
      throw new Error('JVM Stack underflow');
      // TODO: throw java error
    }
    return value;
  }

  popStackFrame() {
    this.stack.pop();
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

  throwNewException(cls: string, msg: string) {
    // TODO: push msg to stack
    this.pushStackFrame({
      operandStack: [],
      className: cls,
      methodName: '<init>(Ljava/lang/String;)V',
      pc: 0,
      this: undefined,
      locals: [],
    });
    const exceptionObj = this.popStack();
    this.pushStackFrame({
      operandStack: [],
      className: '',
      methodName: 'dispatchUncaughtException(Ljava/lang/Throwable;)V',
      pc: 0,
      this: undefined,
      locals: [, exceptionObj],
    });
  }
}
