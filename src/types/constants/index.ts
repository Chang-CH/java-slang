import { initString } from '#jvm/components/JNI/utils';
import Thread from '#jvm/components/Threads/Thread';
import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import * as info from '#jvm/external/ClassFile/types/constants';
import { FieldRef } from '#types/FieldRef';
import { MethodRef } from '#types/MethodRef';
import { ClassRef } from '#types/class/ClassRef';
import { JvmObject } from '#types/reference/Object';
import { DeferResult, ErrorResult, Result, SuccessResult } from '#types/result';
import { newString } from '#utils/index';

export abstract class Constant {
  private tag: CONSTANT_TAG;
  protected cls: ClassRef;
  protected isResolved: boolean = true;

  constructor(tag: CONSTANT_TAG, cls: ClassRef) {
    this.cls = cls;
    this.tag = tag;
  }

  public resolve(...args: any[]): Result<any> {
    return new SuccessResult<any>(this.get());
  }

  public abstract get(): any;

  public getTag(): CONSTANT_TAG {
    return this.tag;
  }
}

// #region static values

export class ConstantInteger extends Constant {
  private value: number;

  constructor(cls: ClassRef, value: number) {
    super(CONSTANT_TAG.Integer, cls);
    this.value = value;
  }

  static check(c: Constant): c is ConstantInteger {
    return c.getTag() === CONSTANT_TAG.Integer;
  }

  public get(): number {
    return this.value;
  }
}

export class ConstantFloat extends Constant {
  private value: number;

  constructor(cls: ClassRef, value: number) {
    super(CONSTANT_TAG.Float, cls);
    this.value = value;
  }

  static check(c: Constant): c is ConstantFloat {
    return c.getTag() === CONSTANT_TAG.Float;
  }

  public get(): number {
    return this.value;
  }

  static fromInfo(
    cls: ClassRef,
    constant: info.ConstantFloatInfo
  ): ConstantFloat {
    return new ConstantFloat(cls, constant.value);
  }
}

export class ConstantLong extends Constant {
  private value: bigint;

  constructor(cls: ClassRef, value: bigint) {
    super(CONSTANT_TAG.Long, cls);
    this.value = value;
  }

  static check(c: Constant): c is ConstantLong {
    return c.getTag() === CONSTANT_TAG.Long;
  }

  public get(): bigint {
    return this.value;
  }

  static fromInfo(
    cls: ClassRef,
    constant: info.ConstantLongInfo
  ): ConstantLong {
    return new ConstantLong(cls, constant.value);
  }
}

export class ConstantDouble extends Constant {
  private value: number;

  constructor(cls: ClassRef, value: number) {
    super(CONSTANT_TAG.Double, cls);
    this.value = value;
  }

  static check(c: Constant): c is ConstantDouble {
    return c.getTag() === CONSTANT_TAG.Double;
  }

  public get(): number {
    return this.value;
  }

  static fromInfo(
    cls: ClassRef,
    constant: info.ConstantDoubleInfo
  ): ConstantDouble {
    return new ConstantDouble(cls, constant.value);
  }
}

export class ConstantUtf8 extends Constant {
  private value: string;

  constructor(cls: ClassRef, value: string) {
    super(CONSTANT_TAG.Utf8, cls);
    this.value = value;
  }

  static check(c: Constant): c is ConstantUtf8 {
    return c.getTag() === CONSTANT_TAG.Utf8;
  }

  public get(): string {
    return this.value;
  }

  static fromInfo(
    cls: ClassRef,
    constant: info.ConstantUtf8Info
  ): ConstantUtf8 {
    return new ConstantUtf8(cls, constant.value);
  }
}

// #endregion

// #region utf8 dependency

export class ConstantString extends Constant {
  private str: ConstantUtf8;
  private result?: Result<JvmObject>;

  constructor(cls: ClassRef, str: ConstantUtf8) {
    super(CONSTANT_TAG.String, cls);
    this.str = str;
    this.isResolved = false;
  }

  static check(c: Constant): c is ConstantString {
    return c.getTag() === CONSTANT_TAG.String;
  }

  public resolve(): Result<JvmObject> {
    if (this.result) {
      return this.result;
    }

    const strVal = this.str.get();
    this.result = newString(this.cls.getLoader(), strVal);
    return this.result;
  }

  public get() {
    if (!this.result) {
      this.resolve();
    }

    if (!this.result?.checkSuccess()) {
      throw new Error('Resolution incomplete or failed');
    }

    return this.result.getResult();
  }
}

export class ConstantNameAndType extends Constant {
  private name: ConstantUtf8;
  private descriptor: ConstantUtf8;

  constructor(cls: ClassRef, name: ConstantUtf8, descriptor: ConstantUtf8) {
    super(CONSTANT_TAG.NameAndType, cls);
    this.name = name;
    this.descriptor = descriptor;
  }

  static check(c: Constant): c is ConstantNameAndType {
    return c.getTag() === CONSTANT_TAG.NameAndType;
  }

  public get(): { name: string; descriptor: string } {
    return { name: this.name.get(), descriptor: this.descriptor.get() };
  }
}

export class ConstantMethodType extends Constant {
  private descriptor: ConstantUtf8;

  constructor(cls: ClassRef, descriptor: ConstantUtf8) {
    super(CONSTANT_TAG.MethodType, cls);
    this.descriptor = descriptor;
    this.isResolved = false;
  }

  static check(c: Constant): c is ConstantMethodType {
    return c.getTag() === CONSTANT_TAG.MethodType;
  }

  public get(): JvmObject {
    throw new Error('Method not implemented.');
  }

  public resolve(...args: any[]): Result<any> {
    throw new Error('Method not implemented.');
  }
}

export class ConstantClass extends Constant {
  private className: ConstantUtf8;
  private result?: Result<ClassRef>;

  constructor(cls: ClassRef, className: ConstantUtf8) {
    super(CONSTANT_TAG.Class, cls);
    this.className = className;
  }

  static check(c: Constant): c is ConstantClass {
    return c.getTag() === CONSTANT_TAG.Class;
  }

  public resolve(): Result<ClassRef> {
    // resolved before
    if (this.result) {
      return this.result;
    }

    const res = this.cls.$resolveClass(this.className.get());

    // TODO: remove this when $resolve change to use Result
    if (res.error || !res.result) {
      this.result = new ErrorResult<ClassRef>(
        res.error ?? 'java/lang/ClassNotFoundException',
        ''
      );
    } else {
      this.result = new SuccessResult<ClassRef>(res.result);
    }

    return this.result;
  }

  public get() {
    if (!this.result) {
      this.resolve();
    }

    if (!this.result?.checkSuccess()) {
      throw new Error('Resolution incomplete or failed');
    }

    return this.result.getResult();
  }
}

// #endregion

// #region name and type dependency

export class ConstantInvokeDynamic extends Constant {
  private bootstrapMethodAttrIndex: number;
  private nameAndType: ConstantNameAndType;

  constructor(
    cls: ClassRef,
    bootstrapMethodAttrIndex: number,
    nameAndType: ConstantNameAndType
  ) {
    super(CONSTANT_TAG.MethodType, cls);
    this.bootstrapMethodAttrIndex = bootstrapMethodAttrIndex;
    this.nameAndType = nameAndType;
    this.isResolved = false;
  }

  static check(c: Constant): c is ConstantMethodType {
    return c.getTag() === CONSTANT_TAG.InvokeDynamic;
  }

  public get(): JvmObject {
    throw new Error('Method not implemented.');
  }

  public resolve(...args: any[]): Result<any> {
    throw new Error('Method not implemented.');
  }
}

export class ConstantFieldref extends Constant {
  private classConstant: ConstantClass;
  private nameAndTypeConstant: ConstantNameAndType;
  private result?: Result<FieldRef>;

  constructor(
    cls: ClassRef,
    classConstant: ConstantClass,
    nameAndTypeConstant: ConstantNameAndType
  ) {
    super(CONSTANT_TAG.Fieldref, cls);
    this.classConstant = classConstant;
    this.nameAndTypeConstant = nameAndTypeConstant;
  }

  public get() {
    throw new Error('Method not implemented.');
  }

  static check(c: Constant): c is ConstantFieldref {
    return c.getTag() === CONSTANT_TAG.Fieldref;
  }

  public resolve(): Result<FieldRef> {
    throw new Error('Method not implemented.');
  }
}

export class ConstantMethodref extends Constant {
  private classConstant: ConstantClass;
  private nameAndTypeConstant: ConstantNameAndType;
  private result?: Result<MethodRef>;

  constructor(
    cls: ClassRef,
    classConstant: ConstantClass,
    nameAndTypeConstant: ConstantNameAndType
  ) {
    super(CONSTANT_TAG.Methodref, cls);
    this.classConstant = classConstant;
    this.nameAndTypeConstant = nameAndTypeConstant;
  }

  public get() {
    throw new Error('Method not implemented.');
  }

  static check(c: Constant): c is ConstantMethodref {
    return c.getTag() === CONSTANT_TAG.Methodref;
  }

  public resolve(thread: Thread): Result<MethodRef> {
    // 5.4.3 if initial attempt to resolve a symbolic reference fails
    // then subsequent attempts to resolve the reference always fail with the same error
    if (this.result) {
      return this.result;
    }

    // resolve class
    const clsResResult = this.classConstant.resolve();
    if (!clsResResult.checkSuccess()) {
      if (clsResResult.checkError()) {
        const err = clsResResult.getError();
        this.result = new ErrorResult<MethodRef>(err.className, err.msg);
        return this.result;
      }
      return new DeferResult<MethodRef>();
    }
    const symbolClass = clsResResult.getResult();

    // resolve name and type
    if (!this.nameAndTypeConstant.resolve().checkSuccess()) {
      throw new Error('Name and type resolution failed');
    }

    // 5.4.3.3. Method Resolution
    // 1. If C is an interface, method resolution throws an IncompatibleClassChangeError
    if (symbolClass.checkInterface()) {
      this.result = new ErrorResult<MethodRef>(
        'java/lang/IncompatibleClassChangeError',
        ''
      );
      return this.result;
    }

    const nt = this.nameAndTypeConstant.get();
    // TODO: not implemented: signature poly
    const methodRes = symbolClass.$resolveMethod(
      nt.name + nt.descriptor,
      this.cls
    );

    // #region legacy error handling
    if (methodRes.error || !methodRes.methodRef) {
      this.result = new ErrorResult<MethodRef>(
        methodRes.error ?? 'java/lang/NoSuchMethodError',
        ''
      );
      return this.result;
    }
    this.result = new SuccessResult<MethodRef>(methodRes.methodRef);
    // #endregion

    return this.result;
  }
}

export class ConstantInterfaceMethodref extends Constant {
  private classConstant: ConstantClass;
  private nameAndTypeConstant: ConstantNameAndType;
  private result?: Result<MethodRef>;

  constructor(
    cls: ClassRef,
    classConstant: ConstantClass,
    nameAndTypeConstant: ConstantNameAndType
  ) {
    super(CONSTANT_TAG.InterfaceMethodref, cls);
    this.classConstant = classConstant;
    this.nameAndTypeConstant = nameAndTypeConstant;
  }

  public get() {
    throw new Error('Method not implemented.');
  }

  static check(c: Constant): c is ConstantInterfaceMethodref {
    return c.getTag() === CONSTANT_TAG.InterfaceMethodref;
  }

  public resolve(): Result<MethodRef> {
    // 5.4.3 if initial attempt to resolve a symbolic reference fails
    // then subsequent attempts to resolve the reference always fail with the same error
    if (this.result) {
      return this.result;
    }

    // resolve class
    const clsResResult = this.classConstant.resolve();
    if (!clsResResult.checkSuccess()) {
      if (clsResResult.checkError()) {
        const err = clsResResult.getError();
        this.result = new ErrorResult<MethodRef>(err.className, err.msg);
        return this.result;
      }
      return new DeferResult<MethodRef>();
    }
    const symbolClass = clsResResult.getResult();

    // resolve name and type
    if (!this.nameAndTypeConstant.resolve().checkSuccess()) {
      throw new Error('Name and type resolution failed');
    }

    // 5.4.3.4. Interface Method Resolution
    const clsRef = clsResResult.getResult();

    // 1. If C is not an interface, interface method resolution throws an IncompatibleClassChangeError.
    if (!symbolClass.checkInterface()) {
      this.result = new ErrorResult<MethodRef>(
        'java/lang/IncompatibleClassChangeError',
        ''
      );
      return this.result;
    }

    const nt = this.nameAndTypeConstant.get();
    const methodRes = symbolClass.$resolveMethod(
      nt.name + nt.descriptor,
      this.cls
    );

    // #region legacy error handling
    if (methodRes.error || !methodRes.methodRef) {
      this.result = new ErrorResult<MethodRef>(
        methodRes.error ?? 'java/lang/NoSuchMethodError',
        ''
      );
      return this.result;
    }
    this.result = new SuccessResult<MethodRef>(methodRes.methodRef);
    // #endregion

    return this.result;
  }
}

// #endregion

// #region rest
export class ConstantMethodHandle extends Constant {
  private referenceKind: info.REFERENCE_KIND;
  private reference:
    | ConstantFieldref
    | ConstantMethodref
    | ConstantInterfaceMethodref;

  constructor(
    cls: ClassRef,
    referenceKind: info.REFERENCE_KIND,
    reference: ConstantFieldref | ConstantMethodref | ConstantInterfaceMethodref
  ) {
    super(CONSTANT_TAG.MethodHandle, cls);
    this.referenceKind = referenceKind;
    this.reference = reference;
    this.isResolved = false;
  }

  static check(c: Constant): c is ConstantMethodHandle {
    return c.getTag() === CONSTANT_TAG.MethodHandle;
  }

  public get(): JvmObject {
    throw new Error('Method not implemented.');
  }

  public resolve(...args: any[]): Result<any> {
    throw new Error('Method not implemented.');
  }
}
// #endregion
