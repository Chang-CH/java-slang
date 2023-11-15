import { ClassData } from '#types/class/ClassData';
import { Method } from '#types/class/Method';
import { JvmObject } from '#types/reference/Object';
import Thread from './Thread';

export abstract class StackFrame {
  public operandStack: any[];
  public maxStack: number;
  public class: ClassData;
  public method: Method;
  public pc: number;
  public locals: any[];

  constructor(
    operandStack: any[],
    maxStack: number,
    cls: ClassData,
    method: Method,
    pc: number,
    locals: any[]
  ) {
    this.operandStack = operandStack;
    this.maxStack = maxStack;
    this.class = cls;
    this.method = method;
    this.pc = pc;
    this.locals = locals;
  }

  public onReturn(thread: Thread, retn: any) {
    if (retn !== undefined) {
      thread.pushStack(retn);
    }
  }

  public onReturn64(thread: Thread, retn: any) {
    thread.pushStack64(retn);
  }

  onError(thread: Thread, err: JvmObject) {
    // Do nothing (exception handling?)
  }
}

export class JavaStackFrame extends StackFrame {
  constructor(
    operandStack: any[],
    maxStack: number,
    cls: ClassData,
    method: Method,
    pc: number,
    locals: any[]
  ) {
    super(operandStack, maxStack, cls, method, pc, locals);
  }
}

/**
 * Used for internal methods, does not push return value to stack.
 */
export class InternalStackFrame extends StackFrame {
  private callback: (ret: any, err?: any) => void;
  constructor(
    operandStack: any[],
    maxStack: number,
    cls: ClassData,
    method: Method,
    pc: number,
    locals: any[],
    callback: (ret: any, err?: any) => void
  ) {
    super(operandStack, maxStack, cls, method, pc, locals);
    this.callback = callback;
  }

  public onReturn(thread: Thread, retn: any) {
    this.callback(retn);
  }

  public onReturn64(thread: Thread, retn: any) {
    this.callback(retn);
  }

  onError(thread: Thread, err: JvmObject): void {
    this.callback(null, err);
  }
}
