import Thread from '#jvm/components/Thread/Thread';
import {
  AttributeInfo,
  CodeAttribute,
} from '#jvm/external/ClassFile/types/attributes';
import {
  METHOD_FLAGS,
  MethodInfo,
} from '#jvm/external/ClassFile/types/methods';
import { ClassRef } from './class/ClassRef';
import { ConstantClass, ConstantUtf8 } from './constants';
import { ErrorResult, ImmediateResult, SuccessResult } from './result';

export interface MethodHandler {
  startPc: number;
  endPc: number;
  handlerPc: number;
  catchType: null | ClassRef;
}

export class MethodRef {
  private cls: ClassRef;
  private code: CodeAttribute | null; // native methods have no code
  private accessFlags: number;
  private name: string;
  private descriptor: string;
  private attributes: Array<AttributeInfo>;
  private exceptionHandlers: MethodHandler[];

  constructor(
    cls: ClassRef,
    code: CodeAttribute | null,
    accessFlags: number,
    name: string,
    descriptor: string,
    attributes: Array<AttributeInfo>,
    exceptionHandlers: {
      startPc: number;
      endPc: number;
      handlerPc: number;
      catchType: null | ClassRef;
    }[]
  ) {
    this.cls = cls;
    this.code = code;
    this.accessFlags = accessFlags;
    this.name = name;
    this.descriptor = descriptor;
    this.attributes = attributes;
    this.exceptionHandlers = exceptionHandlers;
  }

  static fromLinkedInfo(
    cls: ClassRef,
    method: MethodInfo,
    exceptionHandlers: MethodHandler[],
    code: CodeAttribute | null
  ) {
    // get name and descriptor
    const name = (cls.getConstant(method.nameIndex) as ConstantUtf8).get();
    const descriptor = (
      cls.getConstant(method.descriptorIndex) as ConstantUtf8
    ).get();

    const accessFlags = method.accessFlags;
    const attributes = method.attributes;

    return new MethodRef(
      cls,
      code,
      accessFlags,
      name,
      descriptor,
      attributes,
      exceptionHandlers
    );
  }

  static checkMethod(obj: any): obj is MethodRef {
    return obj.code !== undefined;
  }

  getName() {
    return this.name;
  }

  getMethodDesc() {
    return this.descriptor;
  }

  getClass() {
    return this.cls;
  }

  getMaxStack() {
    return this.code ? this.code.maxStack : 0;
  }

  getExceptionHandlers() {
    if (this.exceptionHandlers === undefined) {
      console.log(this.cls.getClassname(), this.name, this.descriptor);
      throw new Error('Class not initialized');
    }
    return this.exceptionHandlers;
  }

  /**
   * flags
   */
  checkPublic() {
    return (this.accessFlags & METHOD_FLAGS.ACC_PUBLIC) !== 0;
  }

  checkPrivate() {
    return (this.accessFlags & METHOD_FLAGS.ACC_PRIVATE) !== 0;
  }

  checkProtected() {
    return (
      (this.accessFlags & METHOD_FLAGS.ACC_PROTECTED) !== 0 ||
      (!this.checkPublic() && !this.checkPrivate())
    );
  }

  checkStatic() {
    return (this.accessFlags & METHOD_FLAGS.ACC_STATIC) !== 0;
  }

  checkFinal() {
    return (this.accessFlags & METHOD_FLAGS.ACC_FINAL) !== 0;
  }

  checkSynchronized() {
    return (this.accessFlags & METHOD_FLAGS.ACC_SYNCHRONIZED) !== 0;
  }

  checkBridge() {
    return (this.accessFlags & METHOD_FLAGS.ACC_BRIDGE) !== 0;
  }

  checkVarargs() {
    return (this.accessFlags & METHOD_FLAGS.ACC_VARARGS) !== 0;
  }

  checkNative() {
    return (this.accessFlags & METHOD_FLAGS.ACC_NATIVE) !== 0;
  }

  checkAbstract() {
    return (this.accessFlags & METHOD_FLAGS.ACC_ABSTRACT) !== 0;
  }

  checkStrict() {
    return (this.accessFlags & METHOD_FLAGS.ACC_STRICT) !== 0;
  }

  checkSynthetic() {
    return (this.accessFlags & METHOD_FLAGS.ACC_SYNTHETIC) !== 0;
  }

  _getCode() {
    return this.code;
  }
}
