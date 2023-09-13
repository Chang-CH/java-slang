import MemoryArea from '#jvm/components/MemoryArea';
import { readInstruction } from '#jvm/components/MemoryArea/utils/readInstruction';
import { InstructionType } from '#types/ClassFile/instructions';
import { MethodRef, NativeMethodRef } from '#types/ClassFile/methods';
import { ClassRef } from '#types/ClassRef';
import { JavaReference } from '#types/DataTypes';
import { checkNative } from '#utils/parseBinary/utils/readMethod';
import { tryInitialize } from '../../Interpreter/utils';
import { StackFrame } from './types';

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
        className: currentFrame.class.this_class,
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
    return this.stack[this.stackPointer].class.this_class;
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
    tryInitialize(memoryArea, this, className);

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
    const objectref = new JavaReference(memoryArea.getClass(className), {});
    this.throwException(memoryArea, objectref);
  }

  throwException(memoryArea: MemoryArea, exception: any) {
    // Find a stackframe with appropriate exception handlers
    while (this.stack.length > 0) {
      const method = this.getMethod();

      // Native methods cannot handle exceptions
      if (checkNative(method)) {
        this.popStackFrame();
        continue;
      }

      const eTable = method?.code?.exception_table;

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
