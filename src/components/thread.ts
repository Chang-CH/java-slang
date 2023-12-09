import JVM from '#jvm/index';
import { checkError, checkSuccess } from '#types/Result';
import { Code } from '#types/class/Attributes';
import { ClassData, ReferenceClassData } from '#types/class/ClassData';
import { Method } from '#types/class/Method';
import type { JvmArray } from '#types/reference/Array';
import type { JvmObject } from '../types/reference/Object';
import { AbstractThreadPool } from './ThreadPool';
import { InternalStackFrame, JavaStackFrame, StackFrame } from './stackframe';

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
  private threadClass: ReferenceClassData;
  private jvm: JVM;

  private quantumLeft: number = 0;
  private tpool: AbstractThreadPool;

  constructor(
    threadClass: ReferenceClassData,
    jvm: JVM,
    tpool: AbstractThreadPool
  ) {
    this.jvm = jvm;
    this.threadClass = threadClass;
    this.stack = [];
    this.stackPointer = -1;
    this.javaObject = threadClass.instantiate();
    // call init?
    this.javaObject.putNativeField('thread', this);
    this.tpool = tpool;
  }

  initialize(thread: Thread) {
    const init = this.threadClass.getMethod('<init>()V') as Method;
    if (!init) {
      throw new Error('Thread constructor not found');
    }

    thread.invokeStackFrame(
      new InternalStackFrame(
        this.threadClass,
        init,
        0,
        [this.javaObject],
        () => {}
      )
    );
  }

  runFor(quantum: number) {
    this.quantumLeft = quantum;

    while (
      this.quantumLeft &&
      this.stack.length > 0 &&
      this.status === ThreadStatus.RUNNABLE
    ) {
      this.peekStackFrame().run(this);
      this.quantumLeft -= 1;
    }

    if (this.stack.length === 0) {
      this.status = ThreadStatus.TERMINATED;
    }

    this.tpool.quantumOver(this);
  }

  /**
   * Used internally to run the thread without terminating the thread at the end.
   */
  _run() {
    while (this.stack.length > 0) {
      this.peekStackFrame().run(this);
    }
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
    return (this.stack[this.stackPointer].method._getCode() as Code).code;
  }

  // #endregion

  // #region setters

  setStatus(status: ThreadStatus) {
    const oldStatus = this.status;
    this.status = status;
    this.tpool.updateStatus(this, oldStatus);
  }

  offsetPc(pc: number) {
    const sf = this.stack[this.stackPointer];

    // no more stackframes or native method
    if (!sf || sf.checkNative()) {
      return;
    }

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

  private _returnSF(ret?: any, err?: JvmObject, isWide?: boolean) {
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

    console.debug(
      sf.class.getClassname() +
        '.' +
        sf.method.getName() +
        sf.method.getDescriptor() +
        ' return: ' +
        (ret === null
          ? 'null'
          : ret?.getClass
          ? (ret?.getClass() as ReferenceClassData).getClassname()
          : ret)
    );

    isWide ? sf.onReturn64(this, ret) : sf.onReturn(this, ret);
    return sf;
  }

  returnStackFrame(ret?: any, err?: JvmObject): StackFrame {
    return this._returnSF(ret, err, false);
  }

  returnStackFrame64(ret?: any, err?: JvmObject): StackFrame {
    return this._returnSF(ret, err, true);
  }

  invokeStackFrame(sf: StackFrame) {
    console.debug(
      ''.padEnd(this.stackPointer + 2, '#') +
        sf.class.getClassname() +
        '.' +
        sf.method.getName() +
        sf.method.getDescriptor() +
        ': [' +
        sf.locals
          .map(v => {
            return v === null
              ? 'null'
              : v?.getClass
              ? (v?.getClass() as ReferenceClassData).getClassname()
              : v;
          })
          .join(', ') +
        ']'
    );
    this.stack.push(sf);
    this.stackPointer += 1;
  }

  /**
   * Creates an InternalStackFrame and pushes it onto the stack.
   * Workaround for circular dependencies in JvmObject
   */
  _invokeInternal(
    cls: ReferenceClassData,
    method: Method,
    pc: number,
    locals: any[],
    callback: (ret: any, err?: any) => void
  ) {
    const sf = new InternalStackFrame(cls, method, pc, locals, callback);
    this.invokeStackFrame(sf);
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

    this.throwException(exceptionCls.instantiate());
  }

  throwException(exception: JvmObject) {
    const exceptionCls = exception.getClass();
    console.log(
      this.stack.map(
        frame =>
          frame.class.getClassname() +
          '.' +
          frame.method.getName() +
          frame.method.getDescriptor()
      )
    );

    console.error(
      'throwing exception ',
      exceptionCls.getClassname(),
      this.getMethod().getName(),
      this.getPC()
    );

    // Find a stackframe with appropriate exception handlers
    while (this.stack.length > 0) {
      const method = this.getMethod();

      // Native methods cannot handle exceptions
      if (method.checkNative()) {
        this.returnStackFrame(null, exception);
        continue;
      }

      const eTable = method.getExceptionHandlers();
      const pc = this.getPC();

      for (const handler of eTable) {
        let handlerCls: ClassData | null;
        if (handler.catchType !== null) {
          const clsResolution = handler.catchType.resolve();
          if (checkError(clsResolution)) {
            this.throwNewException(
              clsResolution.exceptionCls,
              clsResolution.msg
            );
            return;
          }
          handlerCls = clsResolution.result;
        } else {
          handlerCls = null;
        }

        if (
          pc >= handler.startPc &&
          pc < handler.endPc &&
          (handlerCls === null || exceptionCls.checkCast(handlerCls))
        ) {
          console.log(
            'EXCEPTION CAUGHT: @',
            method.getClass().getClassname(),
            ' FOR: ',
            exceptionCls.getClassname()
          );
          // clear the operand stack and push exception
          this.stack[this.stackPointer].operandStack = [exception];
          this.setPc(handler.handlerPc);
          return;
        }
      }

      this.returnStackFrame(null, exception);
    }

    const unhandledMethod = this.threadClass.getMethod(
      'dispatchUncaughtException(Ljava/lang/Throwable;)V'
    );
    if (unhandledMethod === null) {
      throw new Error(
        'Uncaught exception could not be thrown: dispatchUncaughtException(Ljava/lang/Throwable;)V not found'
      );
    }

    this.invokeStackFrame(
      new JavaStackFrame(this.threadClass, unhandledMethod, 0, [
        this.getJavaObject(),
        exception,
      ])
    );
  }

  // #endregion
}
