import { ClassRef } from '#types/ConstantRef';
import { JavaReference } from '#types/dataTypes';
import { checkNative } from '#utils/parseBinary/utils/readMethod';
import { tryInitialize } from '../../Interpreter/utils';
import { StackFrame } from './types';
import { MethodRef } from '#jvm/external/ClassFile/types/methods';
import {
  InstructionType,
  readInstruction,
} from '../../Interpreter/utils/readInstruction';

export default class NativeThread {
  private stack: StackFrame[];
  private stackPointer: number;
  private javaThis?: JavaReference;
  private cls: ClassRef;

  constructor(threadClass: ClassRef, javaThis: JavaReference) {
    this.cls = threadClass;
    this.javaThis = javaThis;
    this.stack = [];
    this.stackPointer = -1;
  }

  getCurrentInstruction(): InstructionType | MethodRef | undefined {
    const currentFrame = this.stack?.[this.stackPointer];

    if (!currentFrame) {
      console.debug('No current frame', this.stack);
      return;
    }

    // Instruction is a native method
    if (checkNative(currentFrame.method) || !currentFrame.method.code) {
      return currentFrame.method;
    }

    return readInstruction(currentFrame.method.code.code, currentFrame.pc);
  }

  getPC(): number {
    return this.stack[this.stackPointer].pc;
  }

  offsetPc(pc: number) {
    this.stack[this.stackPointer].pc += pc;
  }

  setPc(pc: number) {
    this.stack[this.stackPointer].pc = pc;
  }

  getClassName(): string {
    return this.stack[this.stackPointer].class.getClassname();
  }

  getClass(): ClassRef {
    return this.stack[this.stackPointer].class;
  }

  getMethodName(): string {
    return this.stack[this.stackPointer].method.name;
  }

  getMethod(): MethodRef {
    return this.stack[this.stackPointer].method;
  }

  peekStackFrame() {
    return this.stack[this.stackPointer];
  }

  pushStack(value: any) {
    // check for stack overflow?
    this.stack[this.stackPointer].operandStack.push(value);
  }

  pushStack64(value: any) {
    // check for stack overflow?
    this.stack[this.stackPointer].operandStack.push(value);
    this.stack[this.stackPointer].operandStack.push(value);
  }

  popStack64() {
    if (this.stack?.[this.stackPointer]?.operandStack?.length <= 1) {
      this.throwNewException('java/lang/RuntimeException', 'Stack Underflow');
    }
    this.stack?.[this.stackPointer]?.operandStack?.pop();
    const value = this.stack?.[this.stackPointer]?.operandStack?.pop();
    if (value === undefined) {
      this.throwNewException('java/lang/RuntimeException', 'Stack Underflow');
    }
    return value;
  }

  popStack() {
    if (this.stack?.[this.stackPointer]?.operandStack?.length <= 0) {
      this.throwNewException('java/lang/RuntimeException', 'Stack Underflow');
    }
    const value = this.stack?.[this.stackPointer]?.operandStack?.pop();
    return value;
  }

  popStackFrame() {
    const sf = this.stack.pop();
    this.stackPointer -= 1;
  }

  pushStackFrame(frame: StackFrame) {
    this.stack.push(frame);
    this.stackPointer += 1;
  }

  storeLocal(index: number, value: any) {
    this.stack[this.stackPointer].locals[index] = value;
  }

  storeLocal64(index: number, value: any) {
    this.stack[this.stackPointer].locals[index] = value;
  }

  loadLocal(index: number): any {
    return this.stack[this.stackPointer].locals[index];
  }

  loadLocal64(index: number): any {
    return this.stack[this.stackPointer].locals[index];
  }

  throwNewException(className: string, msg: string) {
    // FIXME: Potential infinite loop if ClassNotFoundException is not found
    tryInitialize(this, className);

    // Initialize exception
    // FIXME: push msg to stack
    const objectref = new JavaReference(
      this.getClass().getLoader().resolveClass(this, className) as ClassRef,
      {}
    );
    this.throwException(objectref);
  }

  throwException(exception: any) {
    // Find a stackframe with appropriate exception handlers
    while (this.stack.length > 0) {
      const method = this.getMethod();

      // Native methods cannot handle exceptions
      if (checkNative(method)) {
        this.popStackFrame();
        continue;
      }

      const eTable = method?.code?.exceptionTable;

      // TODO: check if exception is handled
      this.popStackFrame();
    }

    // Unhandled exception.
    this.pushStackFrame({
      operandStack: [],
      class: this.cls,
      method: this.cls.getMethod(
        this,
        'dispatchUncaughtException(Ljava/lang/Throwable;)V'
      ),
      pc: 0,
      locals: [this.javaThis, exception],
    });
  }
}
