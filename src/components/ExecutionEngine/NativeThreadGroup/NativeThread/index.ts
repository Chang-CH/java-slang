import { readInstruction } from '#jvm/components/ExecutionEngine/Interpreter/utils/instructions/readInstruction';
import { InstructionType } from '#types/ClassRef/instructions';
import { ClassRef } from '#types/ClassRef';
import { JavaReference } from '#types/DataTypes';
import { checkNative } from '#utils/parseBinary/utils/readMethod';
import { tryInitialize } from '../../Interpreter/utils';
import { StackFrame } from './types';
import {
  NativeMethodRef,
  MethodType,
} from '#jvm/external/ClassFile/types/methods';

export default class NativeThread {
  stack: StackFrame[];
  stackPointer: number;
  javaThis?: JavaReference;
  cls: ClassRef;

  constructor(
    threadClass: ClassRef,
    javaThis: JavaReference,
    initialFrame: StackFrame
  ) {
    this.cls = threadClass;
    this.javaThis = javaThis;
    this.stack = [initialFrame];
    this.stackPointer = 0;
  }

  getCurrentInstruction(): InstructionType | NativeMethodRef | undefined {
    const currentFrame = this.stack?.[this.stackPointer];

    if (!currentFrame) {
      return;
    }

    // Instruction is a native method
    if (checkNative(currentFrame.method) || !currentFrame.method.code) {
      return {
        className: currentFrame.class.thisClass,
        methodName: currentFrame.method.name + currentFrame.method.descriptor,
        native: true,
      };
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
    return this.stack[this.stackPointer].class.thisClass;
  }

  /**
   * Gets the class ref containing the current method being executed
   * @returns method class ref
   */
  getClass(): ClassRef {
    return this.stack[this.stackPointer].class;
  }

  getMethodName(): string {
    return this.stack[this.stackPointer].method.name;
  }

  getMethod(): MethodType {
    return this.stack[this.stackPointer].method;
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

  throwNewException(className: string, msg: string) {
    tryInitialize(this, className);

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
    const objectref = new JavaReference(
      this.getClass()
        .getLoader()
        .getClassRef(className, e => {
          throw new Error('Failed to load exception class');
        }) as ClassRef,
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
      method:
        this.cls.methods['dispatchUncaughtException(Ljava/lang/Throwable;)V'],
      pc: 0,
      locals: [this.javaThis, exception],
    });
  }
}
