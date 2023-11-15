import { CodeAttribute } from '#jvm/external/ClassFile/types/attributes';
import JVM from '#jvm/index';
import { ClassData } from '#types/class/ClassData';
import { Method } from '#types/class/Method';
import { JvmArray } from '#types/reference/Array';
import { checkError, checkSuccess } from '#types/result';
import { stringifyCode } from '#utils/Prettify/classfile';
import { JvmObject } from '../../types/reference/Object';
import { InternalStackFrame, JavaStackFrame, StackFrame } from './StackFrame';

export enum ThreadStatus {
  NEW,
  RUNNABLE,
  BLOCKED,
  WAITING,
  TIMED_WAITING,
  TERMINATED,
}

export default class Thread {
  private status: ThreadStatus = ThreadStatus.NEW;
  private stack: StackFrame[];
  private stackPointer: number;
  private javaObject: JvmObject;
  private threadClass: ClassData;
  private jvm: JVM;

  constructor(threadClass: ClassData, jvm: JVM) {
    this.jvm = jvm;
    this.threadClass = threadClass;
    this.stack = [];
    this.stackPointer = -1;
    this.javaObject = threadClass.instantiate();
    // call init?
    this.javaObject.putNativeField('thread', this);
  }

  initialize(thread: Thread) {
    const init = this.threadClass.getMethod('<init>()V') as Method;
    if (!init) {
      throw new Error('Thread constructor not found');
    }

    thread.invokeSf(this.threadClass, init, 0, [this.javaObject]);
  }

  // #region getters

  getJVM() {
    return this.jvm;
  }

  getStatus() {
    return this.status;
  }

  getJavaObject() {
    return this.javaObject;
  }

  getFrames() {
    return this.stack;
  }

  getPC(): number {
    return this.stack[this.stackPointer].pc;
  }

  /**
   * Gets class of current method
   * @returns
   */
  getClass(): ClassData {
    return this.stack[this.stackPointer].class;
  }

  getMethod(): Method {
    return this.stack[this.stackPointer].method;
  }

  getCode(): DataView {
    return (this.stack[this.stackPointer].method._getCode() as CodeAttribute)
      .code;
  }

  // #endregion

  // #region setters

  setStatus(status: ThreadStatus) {
    this.status = status;
  }

  offsetPc(pc: number) {
    this.stack[this.stackPointer].pc += pc;
  }

  setPc(pc: number) {
    this.stack[this.stackPointer].pc = pc;
  }

  // #endregion

  // #region stack

  /**
   * Returns true if there are no stackframes left.
   */
  isStackEmpty() {
    return this.stack.length === 0;
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

  returnSF(
    ret?: any,
    err?: JvmObject | null,
    isWide: boolean = false
  ): StackFrame {
    const sf = this.stack.pop();
    this.stackPointer -= 1;
    if (this.stackPointer < -1 || sf === undefined) {
      this.throwNewException('java/lang/RuntimeException', 'Stack Underflow');
      throw new Error('Stack Underflow');
    }

    if (err) {
      sf.onError(this, err);
      return sf;
    }

    isWide ? sf.onReturn64(this, ret) : sf.onReturn(this, ret);
    return sf;
  }

  invokeSf(
    cls: ClassData,
    method: Method,
    pc: number,
    locals: any[],
    callback?: (ret: any, err?: any) => void
  ) {
    if (callback) {
      this.stack.push(
        new InternalStackFrame(
          [],
          method.getMaxStack(),
          cls,
          method,
          pc,
          locals,
          callback
        )
      );
      this.stackPointer += 1;
      return;
    }

    const stackframe = new JavaStackFrame(
      [],
      method.getMaxStack(),
      cls,
      method,
      pc,
      locals
    );
    this.stack.push(stackframe);
    this.stackPointer += 1;
  }

  // #endregion

  // #region locals

  storeLocal(index: number, value: any) {
    this.stack[this.stackPointer].locals[index] = value;
  }

  storeLocal64(index: number, value: any) {
    this.stack[this.stackPointer].locals[index] = value;
    this.stack[this.stackPointer].locals[index + 1] = value;
  }

  loadLocal(index: number): any {
    return this.stack[this.stackPointer].locals[index];
  }

  // #endregion

  // #region exceptions

  throwNewException(className: string, msg: string) {
    // Initialize exception
    // FIXME: push msg to stack
    const clsRes = this.getClass().getLoader().getClassRef(className);
    if (checkError(clsRes)) {
      if (clsRes.exceptionCls === 'java/lang/ClassNotFoundException') {
        throw new Error(
          'Infinite loop detected: ClassNotFoundException not found'
        );
      }

      this.throwNewException(clsRes.exceptionCls, clsRes.msg);
      return;
    }

    const exceptionCls = clsRes.result;
    const initRes = exceptionCls.initialize(this);
    // TODO: check infinite loops
    if (!checkSuccess(initRes)) {
      if (checkError(initRes)) {
        this.throwNewException(initRes.exceptionCls, initRes.msg);
      }
      return;
    }

    // TODO: initialize exception object with msg

    console.error('throwing exception ', exceptionCls.getClassname(), msg);
    this.throwException(exceptionCls.instantiate());
  }

  throwException(exception: JvmObject) {
    const exceptionCls = exception.getClass();

    // Find a stackframe with appropriate exception handlers
    while (this.stack.length > 0) {
      const method = this.getMethod();

      // Native methods cannot handle exceptions
      if (method.checkNative()) {
        this.returnSF(null, exception);
        this.stackPointer -= 1;
        continue;
      }

      const eTable = method.getExceptionHandlers();
      const pc = this.getPC();

      for (const handler of eTable) {
        // compiler should ensure catch type is an instance of Throwable
        if (
          pc >= handler.startPc &&
          pc <= handler.endPc &&
          (handler.catchType === null ||
            exceptionCls.checkCast(handler.catchType))
        ) {
          // clear the operand stack and push exception
          this.stack[this.stackPointer].operandStack = [exception];
          this.setPc(handler.handlerPc);
          return;
        }
      }
      this.returnSF(null, exception);
    }

    const unhandledMethod = this.threadClass.getMethod(
      'dispatchUncaughtException(Ljava/lang/Throwable;)V'
    );
    if (unhandledMethod === null) {
      throw new Error(
        'Uncaught exception could not be thrown: dispatchUncaughtException(Ljava/lang/Throwable;)V not found'
      );
    }

    this.invokeSf(this.threadClass, unhandledMethod, 0, [
      this.getJavaObject(),
      exception,
    ]);
  }

  // #endregion
}
