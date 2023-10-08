import { ClassRef, MethodRef } from '#types/ConstantRef';
import { JavaReference } from '#types/dataTypes';
import { checkNative } from '#utils/parseBinary/utils/readMethod';
import { tryInitialize } from '../../Interpreter/utils';
import { StackFrame } from './types';
import { CodeAttribute } from '#jvm/external/ClassFile/types/attributes';

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

  getCode(): DataView {
    return (this.stack[this.stackPointer].method.code as CodeAttribute).code;
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

  popStackFrame(): StackFrame {
    const sf = this.stack.pop();
    this.stackPointer -= 1;
    if (sf === undefined) {
      throw new Error('Stack Underflow');
    }
    return sf;
  }

  pushStackFrame(cls: ClassRef, method: MethodRef, pc: number, locals: any[]) {
    // Fix array length
    const opStack = new Array(method.code?.maxStack ?? 0);
    opStack.fill(undefined);
    Object.seal(opStack);

    const stackframe = {
      operandStack: opStack,
      locals,
      class: cls,
      method,
      pc,
    };

    this.stack.push(stackframe);
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
    this.pushStackFrame(
      this.cls,
      this.cls.getMethod(
        this,
        'dispatchUncaughtException(Ljava/lang/Throwable;)V'
      ),
      0,
      [this.javaThis, exception]
    );
  }
}
