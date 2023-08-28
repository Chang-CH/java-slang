import { JavaPrimitive, JavaType } from '#types/DataTypes';
import { InstructionPointer, StackFrame } from './types';

export default class NativeThread {
  stack: StackFrame[];
  stackPointer: number;

  constructor(initialFrame: StackFrame) {
    this.stack = [initialFrame];
    this.stackPointer = 0;
  }

  getCurrentInstruction(): InstructionPointer {
    const currentFrame = this.stack[this.stackPointer];
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

  pushStack(value: any, type: JavaType) {
    // check for stack overflow?
    this.stack[this.stackPointer].operandStack.push(value);
    this.stack[this.stackPointer].typeStack.push(type);
  }

  popStack() {
    const value = this.stack?.[this.stackPointer]?.operandStack?.pop();
    const type = this.stack?.[this.stackPointer]?.typeStack?.pop();
    if (value === undefined || type === undefined) {
      throw new Error('JVM Stack underflow');
      // TODO: throw java error
    }
    return { value, type };
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

  storeLocal(index: number, value: any, type: JavaType) {
    this.stack[this.stackPointer].locals[index] = value;
  }

  loadLocal(index: number): any {
    return this.stack[this.stackPointer].locals[index];
  }
}
