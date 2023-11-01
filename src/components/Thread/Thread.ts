import { CodeAttribute } from '#jvm/external/ClassFile/types/attributes';
import { ClassRef } from '#types/class/ClassRef';
import { MethodRef } from '#types/MethodRef';
import { JvmObject } from '../../types/reference/Object';
import { StackFrame } from './StackFrame';

export default class Thread {
  private stack: StackFrame[];
  private stackPointer: number;
  private javaObject: JvmObject;
  private cls: ClassRef;

  constructor(threadClass: ClassRef) {
    this.cls = threadClass;
    this.stack = [];
    this.stackPointer = -1;
    this.javaObject = new JvmObject(threadClass);
    this.javaObject.$putNativeField('thread', this);
  }

  isStackEmpty() {
    return this.stack.length === 0;
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

  getClass(): ClassRef {
    return this.stack[this.stackPointer].class;
  }

  getMethod(): MethodRef {
    return this.stack[this.stackPointer].method;
  }

  getCode(): DataView {
    return (this.stack[this.stackPointer].method._getCode() as CodeAttribute)
      .code;
  }

  peekStackFrame() {
    return this.stack[this.stackPointer];
  }

  pushStack(value: any, onError?: (e: string) => void) {
    if (
      this.stack[this.stackPointer].operandStack.length + 1 >
      this.stack[this.stackPointer].maxStack
    ) {
      this.throwNewException('java/lang/StackOverflowError', '');
      onError && onError('java/lang/StackOverflowError');
      return;
    }
    this.stack[this.stackPointer].operandStack.push(value);
  }

  pushStack64(value: any, onError?: (e: string) => void) {
    if (
      this.stack[this.stackPointer].operandStack.length + 2 >
      this.stack[this.stackPointer].maxStack
    ) {
      this.throwNewException('java/lang/StackOverflowError', '');
      onError && onError('java/lang/StackOverflowError');
      return;
    }
    this.stack[this.stackPointer].operandStack.push(value);
    this.stack[this.stackPointer].operandStack.push(value);
  }

  popStack64() {
    if (this.stack?.[this.stackPointer]?.operandStack?.length <= 1) {
      this.throwNewException('java/lang/RuntimeException', 'Stack Underflow');
    }
    this.stack?.[this.stackPointer]?.operandStack?.pop();
    const value = this.stack?.[this.stackPointer]?.operandStack?.pop();
    return value;
  }

  popStack() {
    if (this.stack?.[this.stackPointer]?.operandStack?.length <= 0) {
      this.throwNewException('java/lang/RuntimeException', 'Stack Underflow');
    }
    const value = this.stack?.[this.stackPointer]?.operandStack?.pop();
    return value;
  }

  returnSF(ret?: any): StackFrame {
    const sf = this.stack.pop();
    this.stackPointer -= 1;
    if (this.stackPointer < 0 || sf === undefined) {
      this.throwNewException('java/lang/RuntimeException', 'Stack Underflow');
      throw new Error('Stack Underflow');
    }

    sf.onReturn(this, ret);
    return sf;
  }

  returnSF64(ret?: any): StackFrame {
    const sf = this.stack.pop();
    this.stackPointer -= 1;
    if (this.stackPointer < 0 || sf === undefined) {
      this.throwNewException('java/lang/RuntimeException', 'Stack Underflow');
      throw new Error('Stack Underflow');
    }

    sf.onReturn64(this, ret);
    return sf;
  }

  pushStackFrame(
    cls: ClassRef,
    method: MethodRef,
    pc: number,
    locals: any[],
    callback?: (ret: any) => void
  ) {
    const stackframe = {
      operandStack: [],
      maxStack: method.getMaxStack(),
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
    // Initialize exception
    // FIXME: push msg to stack
    const clsRes = this.getClass().getLoader().getClassRef(className);
    if (clsRes.error) {
      if (className === 'java/lang/ClassNotFoundException') {
        throw new Error(
          'Infinite loop detected: ClassNotFoundException not found'
        );
      }
      this.throwNewException('java/lang/ClassNotFoundException', '');
      return;
    }
    // should not happen
    if (clsRes.result === undefined) {
      this.throwNewException('java/lang/ClassNotFoundException', '');
      return;
    }

    const exceptionCls = clsRes.result;
    const initRes = exceptionCls.initialize(this);
    // TODO: check infinite loops
    if (!initRes.checkSuccess()) {
      if (initRes.checkError()) {
        const err = initRes.getError();
        this.throwNewException(err.className, err.msg);
      }
      return;
    }

    console.log('throwing exception ', exceptionCls.getClassname());
    this.throwException(exceptionCls.instantiate());
  }

  throwException(exception: any) {
    // Find a stackframe with appropriate exception handlers
    while (this.stack.length > 0) {
      const method = this.getMethod();

      // Native methods cannot handle exceptions
      if (method.checkNative()) {
        this.stack.pop();
        this.stackPointer -= 1;
        continue;
      }

      const eTable = method.getExceptionHandlers();

      // TODO: check if exception is handled
      this.stack.pop();
      this.stackPointer -= 1;
    }

    const unhandledMethod = this.cls.getMethod(
      'dispatchUncaughtException(Ljava/lang/Throwable;)V'
    );
    if (unhandledMethod === null) {
      throw new Error(
        'Uncaught exception could not be thrown: dispatchUncaughtException(Ljava/lang/Throwable;)V not found'
      );
    }

    this.pushStackFrame(this.cls, unhandledMethod, 0, [this, exception]);
  }
}
