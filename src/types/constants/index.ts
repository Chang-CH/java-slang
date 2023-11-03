import AbstractClassLoader from '#jvm/components/ClassLoader/AbstractClassLoader';
import {
  parseFieldDescriptor,
  parseMethodDescriptor,
} from '#jvm/components/ExecutionEngine/Interpreter/utils';
import Thread from '#jvm/components/Thread/Thread';
import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import * as info from '#jvm/external/ClassFile/types/constants';
import { FieldRef } from '#types/FieldRef';
import { MethodRef } from '#types/MethodRef';
import { ArrayClassRef } from '#types/class/ArrayClassRef';
import { ClassRef } from '#types/class/ClassRef';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';
import {
  DeferResult,
  ErrorResult,
  ImmediateResult,
  Result,
  SuccessResult,
} from '#types/result';
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

function createMethodType(
  thread: Thread,
  loader: AbstractClassLoader,
  descriptor: string,
  cb: (mt: JvmObject) => void
): Result<JvmObject> {
  const mhnRes = loader.getClassRef('java/lang/invoke/MethodHandleNatives');
  if (mhnRes.checkError()) {
    const err = mhnRes.getError();
    return new ErrorResult(err.className, err.msg);
  }

  const mhnCls = mhnRes.getResult();
  const result = mhnCls.initialize(thread);
  if (!result.checkSuccess()) {
    if (result.checkError()) {
      const err = result.getError();
      return new ErrorResult(err.className, err.msg);
    }
    return new DeferResult();
  }

  // #region create Class object array
  const classes = parseMethodDescriptor(descriptor);
  const classArray: JvmObject[] = [];
  let error: ErrorResult<JvmObject> | null = null;
  const resolver = ({
    type,
    referenceCls,
  }: {
    type: string;
    referenceCls: string | undefined;
  }) => {
    // primitive
    if (!referenceCls) {
      const pClsRes = loader.getPrimitiveClassRef(type);
      classArray.push(pClsRes.getJavaObject());
      return;
    }

    const clsRes = loader.getClassRef(referenceCls);
    if (!clsRes.checkSuccess()) {
      if (!error) {
        const err = clsRes.getError();
        error = new ErrorResult(err.className, err.msg);
      }
      return;
    }
    classArray.push(clsRes.getResult().getJavaObject());
  };
  classes.args.forEach(resolver);
  resolver(classes.ret);
  if (error) {
    return error;
  }

  const clArrRes = loader.getClassRef('[Ljava/lang/Class');
  if (clArrRes.checkError()) {
    if (!error) {
      const err = clArrRes.getError();
      return new ErrorResult(err.className, err.msg);
    }
    return error;
  }
  const paramClsArr = clArrRes.getResult().instantiate() as JvmArray;
  const retCls = classArray.pop();
  paramClsArr.initialize(thread, classArray.length, classArray);
  // #endregion

  // #region create MethodType object
  const toInvoke = mhnCls.getMethod(
    'findMethodHandleType(Ljava/lang/Class;[Ljava/lang/Class;)Ljava/lang/invoke/MethodType;'
  );
  if (!toInvoke) {
    return new ErrorResult('java/lang/NoSuchMethodError', '');
  }
  thread.invokeSf(mhnCls, toInvoke, 0, [retCls, paramClsArr], cb);
  // #endregion

  return new DeferResult<JvmObject>();
}

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
  private result?: Result<JvmObject>;

  constructor(cls: ClassRef, descriptor: ConstantUtf8) {
    super(CONSTANT_TAG.MethodType, cls);
    this.descriptor = descriptor;
    this.isResolved = false;
  }

  static check(c: Constant): c is ConstantMethodType {
    return c.getTag() === CONSTANT_TAG.MethodType;
  }

  public get(): JvmObject {
    if (this.result && this.result.checkSuccess()) {
      return this.result.getResult();
    }
    throw new Error('Resolution incomplete or failed');
  }

  public resolve(thread: Thread): Result<JvmObject> {
    if (this.result) {
      return this.result;
    }
    this.result = new DeferResult<JvmObject>();
    const descriptor = this.descriptor.get();
    const loader = this.cls.getLoader();
    return createMethodType(thread, loader, descriptor, mt => {
      this.result = new SuccessResult<JvmObject>(mt);
    });
  }
}

export class ConstantClass extends Constant {
  private className: ConstantUtf8;
  private result?: ImmediateResult<ClassRef>;

  constructor(cls: ClassRef, className: ConstantUtf8) {
    super(CONSTANT_TAG.Class, cls);
    this.className = className;
  }

  static check(c: Constant): c is ConstantClass {
    return c.getTag() === CONSTANT_TAG.Class;
  }

  public resolve(): ImmediateResult<ClassRef> {
    // resolved before
    if (this.result) {
      return this.result;
    }

    this.result = this.cls.$resolveClass(this.className.get());

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
  private methodTypeObj?: JvmObject;
  private result?: Result<JvmObject>;

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

  public constructCso(thread: Thread) {}

  public resolve(thread: Thread): Result<any> {
    throw new Error('Method not implemented.');
    // // Get MethodType from NameAndType
    // if (!this.methodTypeObj) {
    //   // resolve nameAndType
    //   const nameAndTypeRes = this.nameAndType.get();
    //   createMethodType(
    //     thread,
    //     this.cls.getLoader(),
    //     nameAndTypeRes.descriptor,
    //     mt => {
    //       this.methodTypeObj = mt;
    //     }
    //   );

    //   return new DeferResult();
    // }

    // const loader = this.cls.getLoader();
    // // boostrap method is instance of java.lang.invoke.MethodHandle
    // // #region bootstrap method
    // const bootstrapMethod = this.cls.getBootstrapMethod(
    //   this.bootstrapMethodAttrIndex
    // );
    // const bootstrapMhConst = this.cls.getConstant(
    //   bootstrapMethod.bootstrapMethodRef
    // ) as ConstantMethodHandle;

    // const mhRes = bootstrapMhConst.resolve(thread);
    // if (!mhRes.checkSuccess()) {
    //   return mhRes;
    // }
    // const bootstrapMhn = bootstrapMhConst.get();
    // const bootstrapArgs = bootstrapMethod.bootstrapArguments.map(index => {
    //   const constant = this.cls.getConstant(index);
    //   constant.resolve();
    //   // FIXME: should take ldc logic -- classref resolve to class object
    //   return constant;
    // });
    // // #endregion

    // // #region get arguments
    // const objArrRes = loader.getClassRef('[Ljava/lang/Object;');
    // if (objArrRes.checkError()) {
    //   return new ErrorResult('java/lang/ClassNotFoundException', '');
    // }
    // const arrCls = objArrRes.getResult() as ArrayClassRef;
    // const argsArr = arrCls.instantiate();
    // argsArr.initialize(bootstrapArgs.length, bootstrapArgs);

    // const appendixArr = arrCls.instantiate();
    // appendixArr.initialize(1);
    // // #endregion

    // throw new Error('not implemented');
    // // #region run bootstrap method

    // /**
    //  * doppio logic
    //  *
    //  * const mhnRes = loader.getClassRef('java/lang/invoke/MethodHandleNatives');
    //  * if (!mhnRes.result || mhnRes.error) {
    //  *   return new ErrorResult('java/lang/ClassNotFoundException', '');
    //  * }
    //  * const mhn = mhnRes.result as ClassRef;
    //  * // TODO: check if we need to initialize
    //  * const result = mhn.initialize(thread);
    //  * if (!result.checkSuccess()) {
    //  *   return result;
    //  * }
    //  *
    //  * const method = mhn.getMethod(
    //  *   'java/lang/invoke/MethodHandleNatives/linkCallSite(Ljava/lang/Object;Ljava/lang/Object;Ljava/lang/Object;Ljava/lang/Object;Ljava/lang/Object;[Ljava/lang/Object;)Ljava/lang/invoke/MemberName;'
    //  * );
    //  */

    // // param #1 Ljava/lang/invoke/MethodHandles$Lookup: represents the lookup context
    // // TODO: create lookup context new Lookup(Class<?> lookupClass)

    // const methodSig = this.nameAndType.get();
    // // param #2 Ljava/lang/String methodSignature.name: method name in the call site
    // const stringName = initString(loader, methodSig.name).result as JvmObject;
    // // param #3 Ljava/lang/invoke/MethodType methodSignature.type: method type in the call site
    // // TODO: convert descriptor to methodType
    // const dySignature = methodSig.descriptor;

    // // param #4+: bootstrapArgs additional arguments passed to the bootstrap method
    // // For lambdas:
    // // param #4 Ljava/lang/invoke/MethodType: erased descriptor of the lambda
    // // param #5 Ljava/lang/invoke/MethodHandle: the actual lambda logic. a static method in the current class.
    // // param #6 Ljava/lang/invoke/MethodType: descriptor of the lambda

    // const methodNameStrRes = initString(
    //   loader,
    //   methodSig.name + methodSig.descriptor
    // );
    // if (!methodNameStrRes.result || methodNameStrRes.error) {
    //   return new ErrorResult('java/lang/ClassNotFoundException', '');
    // }
    // const methodNameStr = methodNameStrRes.result as JvmObject;
    // // FIXME: convert name and type to methodType
    // const methodType = methodSig;

    // // TODO: delete returned value
    // // TODO: callback on popped stack frame
    // thread.invokeSf(method?.getClass() as ClassRef, method as MethodRef, 0, [
    //   this.cls.getJavaObject(),
    //   bootstrapMhn,
    //   methodNameStr,
    //   methodType,
    //   argsArr,
    //   appendixArr,
    // ]);
    // // #endregion

    // /**
    //  *   * Do what all OpenJDK-based JVMs do: Call
    //  * MethodHandleNatives.linkCallSite with:
    //  * - The class w/ the invokedynamic instruction `this.cls.getJavaObject()`
    //  * - The bootstrap method `bootstrapMhn`
    //  * - The name string from the nameAndTypeInfo `methodNameStr`
    //  * - The methodType object from the nameAndTypeInfo `methodType`
    //  * - The static arguments from the bootstrap method. `argsArr`
    //  * - A 1-length appendix box. `appendixArr`
    //  *
    //  * On finish:
    //  * returns a MemberName object, which contains:
    //  * - The class containing the invokedynamic instruction
    //  * - method to be run
    //  */
    // console.log('indy bootstrap: ', bootstrapMethod);
    // console.log('indy TD: ', methodSig);
    // // The result of call site specifier resolution is a tuple consisting of:
    // // the reference to an instance of java.lang.invoke.MethodHandle,
    // // the reference to an instance of java.lang.invoke.MethodType,
    // // the references to instances of Class, java.lang.invoke.MethodHandle, java.lang.invoke.MethodType, and String.
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

  /**
   * Checks if the current method has access to the field
   * @param thread thread accessing the field
   * @param isStaticAccess true for getstatic/putstatic
   * @param isPut true for putstatic/putfield
   * @returns
   */
  public checkAccess(
    thread: Thread,
    isStaticAccess: boolean = false,
    isPut: boolean = false
  ): Result<FieldRef> {
    if (!this.result) {
      this.resolve();
      this.result!;
    }

    if (!this.result) {
      throw new Error('Resolution incomplete or failed');
    }

    if (!this.result.checkSuccess()) {
      return this.result;
    }

    const fieldRef = this.result.getResult();
    // logical xor
    if (isStaticAccess !== fieldRef.checkStatic()) {
      return new ErrorResult<FieldRef>(
        'java/lang/IncompatibleClassChangeError',
        ''
      );
    }

    const invokerClass = thread.getClass();
    const fieldClass = fieldRef.getClass();
    if (fieldRef.checkPrivate() && invokerClass !== fieldClass) {
      return new ErrorResult<FieldRef>('java/lang/IllegalAccessError', '');
    }

    if (
      fieldRef.checkProtected() &&
      !invokerClass.checkCast(fieldClass) &&
      invokerClass.getPackageName() !== fieldRef.getClass().getPackageName()
    ) {
      return new ErrorResult<FieldRef>('java/lang/IllegalAccessError', '');
    }

    const invokerMethod = thread.getMethod();
    if (
      isPut &&
      fieldRef.checkFinal() &&
      (fieldClass !== invokerClass ||
        invokerMethod.getName() !== (isStaticAccess ? '<clinit>' : '<init>'))
    ) {
      return new ErrorResult<FieldRef>('java/lang/IllegalAccessError', '');
    }

    return this.result;
  }

  public resolve(): Result<FieldRef> {
    if (this.result) {
      return this.result;
    }

    // resolve class
    const clsRes = this.classConstant.resolve();
    if (!clsRes.checkSuccess()) {
      if (clsRes.checkError()) {
        const err = clsRes.getError();
        this.result = new ErrorResult<FieldRef>(err.className, err.msg);
        return this.result;
      }
      // Should not happen
      throw new Error('Class resolution should not defer');
    }
    const fieldClass = clsRes.getResult();
    const { name, descriptor } = this.nameAndTypeConstant.get();
    const fieldRef = fieldClass.getFieldRef(name + descriptor);

    if (fieldRef === null) {
      this.result = new ErrorResult<FieldRef>('java/lang/NoSuchFieldError', '');
      return this.result;
    }

    this.result = new SuccessResult<FieldRef>(fieldRef);
    return this.result;
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
    this.result = symbolClass.$resolveMethod(nt.name + nt.descriptor, this.cls);
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
    // 1. If C is not an interface, interface method resolution throws an IncompatibleClassChangeError.
    if (!symbolClass.checkInterface()) {
      this.result = new ErrorResult<MethodRef>(
        'java/lang/IncompatibleClassChangeError',
        ''
      );
      return this.result;
    }

    const nt = this.nameAndTypeConstant.get();
    this.result = symbolClass.$resolveMethod(nt.name + nt.descriptor, this.cls);
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
  private result?: Result<JvmObject>;

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

  public resolve(thread: Thread): Result<JvmObject> {
    if (this.result) {
      return this.result;
    }
    this.result = new DeferResult<JvmObject>();

    // #region Step 1: resolve field/method
    const refRes = this.reference.resolve();
    if (!refRes.checkSuccess()) {
      if (refRes.checkError()) {
        const err = refRes.getError();
        this.result = new ErrorResult(err.className, err.msg);
        return this.result;
      }
      return new DeferResult();
    }
    this.result = new DeferResult<JvmObject>();
    const ref = refRes.getResult();
    // #endregion

    // #region Step 3: callback lambda
    const cb = (obj: JvmObject) => {
      // MethodHandleNatives should be resolved by this time
      const mhnCls = (
        this.cls
          .getLoader()
          .getClassRef(
            'java/lang/invoke/MethodHandleNatives'
          ) as SuccessResult<ClassRef>
      ).getResult();

      const method = mhnCls.getMethod(
        'linkMethodHandleConstant(Ljava/lang/Class;ILjava/lang/Class;Ljava/lang/String;Ljava/lang/Object;)Ljava/lang/invoke/MethodHandle;'
      );
      if (!method) {
        this.result = new ErrorResult('java/lang/NoSuchMethodError', '');
        return this.result;
      }
      // Should intern string here, i.e. same string value same object
      const nameStr = newString(this.cls.getLoader(), ref.getName());
      if (!nameStr.checkSuccess()) {
        this.result = nameStr;
        return this.result;
      }

      thread.invokeSf(
        mhnCls,
        method,
        0,
        [
          this.cls.getJavaObject(),
          this.referenceKind,
          ref.getClass().getJavaObject(),
          nameStr.getResult(),
          obj,
        ],
        (mh: JvmObject) => {
          if (!mh) {
            throw new Error('not implemented');
          }
          this.result = new SuccessResult(mh);
        }
      );
    };
    // #endregion

    // #region Step 2:resolve type
    if (FieldRef.checkField(ref)) {
      // #region init MethodHandleNatives. MethodType initializes it already.
      const mhnRes = this.cls
        .getLoader()
        .getClassRef('java/lang/invoke/MethodHandleNatives');
      if (mhnRes.checkError()) {
        const err = mhnRes.getError();
        return new ErrorResult(err.className, err.msg);
      }

      const mhnCls = mhnRes.getResult();
      const result = mhnCls.initialize(thread);
      if (!result.checkSuccess()) {
        if (result.checkError()) {
          const err = result.getError();
          return new ErrorResult(err.className, err.msg);
        }
        return new DeferResult();
      }
      // #endregion

      const parsedField = parseFieldDescriptor(ref.getFieldDesc(), 0);
      if (!parsedField.referenceCls) {
        cb(
          this.cls
            .getLoader()
            .getPrimitiveClassRef(parsedField.type)
            .getJavaObject()
        );
      } else {
        const fieldClsRes = this.cls
          .getLoader()
          .getClassRef(parsedField.referenceCls);
        if (fieldClsRes.checkError()) {
          const err = fieldClsRes.getError();
          this.result = new ErrorResult(err.className, err.msg);
          return this.result;
        }
        cb(fieldClsRes.getResult().getJavaObject());
      }
    } else {
      const descriptor = ref.getMethodDesc();
      const loader = this.cls.getLoader();

      return createMethodType(thread, loader, descriptor, cb);
    }
    // #endregion

    return this.result;
  }
}
// #endregion
