import AbstractClassLoader from '#jvm/components/ClassLoader/AbstractClassLoader';
import Thread from '#jvm/components/Threads/Thread';
import { initString } from '#jvm/components/JNI/utils';
import { CLASS_FLAGS } from '#jvm/external/ClassFile/types';
import {
  BootstrapMethodsAttribute,
  AttributeInfo,
} from '#jvm/external/ClassFile/types/attributes';
import {
  ConstantUtf8Info,
  ConstantNameAndTypeInfo,
  ConstantMethodHandleInfo,
  REFERENCE_KIND,
  ConstantFieldrefInfo,
} from '#jvm/external/ClassFile/types/constants';
import { FieldInfo } from '#jvm/external/ClassFile/types/fields';
import { MethodInfo } from '#jvm/external/ClassFile/types/methods';
import {
  ConstantRef,
  ConstantClass,
  ConstantMethodref,
  ConstantString,
  ConstantInterfaceMethodref,
} from '../ConstantRef';
import { FieldRef } from '../FieldRef';
import { MethodRef } from '../MethodRef';
import { JvmObject } from '../reference/Object';

interface MethodResolutionResult {
  error?: string;
  methodRef?: MethodRef;
}

export enum CLASS_STATUS {
  PREPARED,
  INITIALIZING,
  INITIALIZED,
  ERROR,
}

export class ClassRef {
  public status: CLASS_STATUS = CLASS_STATUS.PREPARED;

  private loader: AbstractClassLoader;

  private constantPool: Array<ConstantRef>;
  private accessFlags: number;

  private thisClass: string;
  protected packageName: string;
  private superClass: ClassRef | null;

  private interfaces: Array<ClassRef>;

  private fields: {
    [fieldName: string]: FieldRef;
  };
  private instanceFields: { [key: string]: FieldRef } | null = null;

  private methods: {
    [methodName: string]: MethodRef;
  };

  private bootstrapMethods?: BootstrapMethodsAttribute;
  private attributes: Array<AttributeInfo>;

  // private javaObj: JvmObject;

  constructor(
    constantPool: Array<ConstantRef>,
    accessFlags: number,
    thisClass: string,
    superClass: ClassRef | null,
    interfaces: Array<ClassRef>,
    fields: Array<FieldInfo>,
    methods: Array<MethodInfo>,
    attributes: Array<AttributeInfo>,
    loader: AbstractClassLoader
  ) {
    this.constantPool = constantPool;
    this.accessFlags = accessFlags;
    this.thisClass = thisClass;
    this.packageName = thisClass.split('/').slice(0, -1).join('/');
    this.superClass = superClass;
    this.interfaces = interfaces;
    this.fields = {};
    fields.forEach(field => {
      const fieldRef = FieldRef.fromFieldInfo(this, field);
      this.fields[fieldRef.getFieldName() + fieldRef.getFieldDesc()] = fieldRef;
    });
    this.methods = {};
    methods.forEach(method => {
      const methodRef = new MethodRef(this, method);
      this.methods[methodRef.getMethodName() + methodRef.getMethodDesc()] =
        methodRef;
    });
    this.attributes = attributes;
    this.loader = loader;

    for (const attribute of attributes) {
      const attrName = (
        this.constantPool[attribute.attributeNameIndex] as ConstantUtf8Info
      ).value;
      if (attrName === 'BootstrapMethods') {
        this.bootstrapMethods = attribute as BootstrapMethodsAttribute;
      }
    }

    // const clsRes = this.loader.getClassRef('java/lang/Class');
    // if (clsRes.error || !clsRes.result) {
    //   throw new Error('Could not load class java/lang/Class');
    // }
    // this.javaObj = new JvmObject(clsRes.result);
  }

  private resolveClass(toResolve: string) {
    const trim = toResolve.lastIndexOf('[');
    const className = toResolve.slice(trim + 1);
    const res = this.loader.getClassRef(className);
    if (res.error) {
      return res;
    }

    if (!res.result) {
      return { error: 'java/lang/ClassNotFoundException' };
    }

    if (
      !res.result.checkPublic() &&
      res.result.getPackageName() !== this.getPackageName()
    ) {
      return { error: 'java/lang/IllegalAccessError', result: res.result };
    }

    return res;
  }

  resolveClassRef(clsRef: ConstantClass): {
    error?: string;
    classRef?: ClassRef;
  } {
    // resolved before
    if (clsRef.error) {
      return { error: clsRef.error };
    }
    if (clsRef.classRef) {
      return { classRef: clsRef.classRef };
    }

    const className = this.constantPool[clsRef.nameIndex] as ConstantUtf8Info;
    const res = this.resolveClass(className.value);

    clsRef.error = res.error;
    if (res.result) {
      clsRef.classRef = res.result;
    }

    return { classRef: res.result, error: res.error };
  }

  /**
   * 5.4.3 method resolution
   */

  /**
   * 5.4.3.3.2 Method resolution in superclass
   * @param methodName
   * @returns MethodRef, if any
   */
  private _resolveMethodSuper(methodName: string): MethodRef | null {
    // SKIPPED: If C declares exactly one method with the name specified by the method reference,
    // and the declaration is a signature polymorphic method (§2.9.3), then method lookup succeeds.

    // Otherwise, if C declares a method with the name and descriptor specified by the method reference, method lookup succeeds.
    if (this.methods[methodName]) {
      return this.methods[methodName];
    }

    // Otherwise, if C has a superclass, step 2 of method resolution is recursively invoked on the direct superclass of C.
    const superClass = this.getSuperClass();
    return superClass ? superClass._resolveMethodSuper(methodName) : null;
  }

  /**
   * 5.4.3.3.2 Method resolution in superinterfaces
   * @param methodName
   * @returns MethodRef, if any
   */
  private _resolveMethodInterface(methodName: string): MethodRef | null {
    let abstractMethod = null;
    for (const inter of this.interfaces) {
      let method = inter.getMethod(methodName);

      if (!method) {
        method = inter._resolveMethodInterface(methodName);
      }

      if (method && !method.checkPrivate() && !method.checkStatic()) {
        if (method.checkAbstract()) {
          abstractMethod = method;
          continue;
        }
        return method;
      }
    }
    if (abstractMethod !== null) {
      return abstractMethod;
    }
    return null;
  }

  private _checkMethodAccess(method: MethodRef, symbolClass: ClassRef) {
    // R is public
    if (method.checkPublic()) {
      return true;
    }

    // R is protected and is declared in a class C, and D is either a subclass of C or C itself
    if (method.checkProtected()) {
      if (!this.checkCast(method.getClass())) {
        return false;
      }
      // if R is not static, then the symbolic reference to R must contain a symbolic reference to a class T,
      // such that T is either a subclass of D, a superclass of D, or D itself.
      // or is declared by a class in the same run-time package as D
      return (
        method.checkStatic() ||
        symbolClass.checkCast(this) ||
        this.getPackageName() === method.getClass().getPackageName()
      );
    }

    // R is private
    return symbolClass === method.getClass();
  }

  private _resolveMethod(
    methodName: string,
    symbolClass: ClassRef
  ): MethodResolutionResult {
    // Otherwise, method resolution attempts to locate the referenced method in C and its superclasses
    let result = this._resolveMethodSuper(methodName);
    if (result !== null) {
      const res: MethodResolutionResult = {
        methodRef: result,
      };
      !this._checkMethodAccess(result, symbolClass) &&
        (res.error = 'java/lang/IllegalAccessError');
      return res;
    }

    // Otherwise, method resolution attempts to locate the referenced method in the superinterfaces of the specified class C
    result = this._resolveMethodInterface(methodName);
    if (result !== null) {
      const res: MethodResolutionResult = {
        methodRef: result,
      };
      !this._checkMethodAccess(result, symbolClass) &&
        (res.error = 'java/lang/IllegalAccessError');
      return res;
    }
    // If method lookup fails, method resolution throws a NoSuchMethodError
    const retn: MethodResolutionResult = {
      error: 'java/lang/NoSuchMethodError',
    };
    result && (retn.methodRef = result);
    return retn;
  }

  private resolveMethod(
    methodName: string,
    symbolClass: ClassRef
  ): MethodResolutionResult {
    // 1. If C is an interface, method resolution throws an IncompatibleClassChangeError
    if (symbolClass.checkInterface()) {
      return {
        error: 'java/lang/IncompatibleClassChangeError',
      };
    }
    return this._resolveMethod(methodName, symbolClass);
  }

  resolveMethodRef(
    thread: Thread,
    methodRef: ConstantMethodref
  ): MethodResolutionResult {
    // 5.4.3 if initial attempt to resolve a symbolic reference fails
    // then subsequent attempts to resolve the reference always fail with the same error
    if (methodRef.error) {
      return {
        error: methodRef.error,
      };
    }

    // Previously resolved without errors
    if (methodRef.error === '') {
      return {
        methodRef: methodRef.methodRef,
      };
    }

    // resolve class
    const invokerD = thread.getClass();
    const constantCls = invokerD.getConstant(
      methodRef.classIndex
    ) as ConstantClass;

    const classRes = invokerD.resolveClassRef(constantCls);
    if (classRes.error) {
      methodRef.error = methodRef.error ?? classRes.error;
      return {
        error: classRes.error,
      };
    }
    const className = (
      invokerD.getConstant(constantCls.nameIndex) as ConstantUtf8Info
    ).value;
    const { result: clsRef, error } = invokerD
      .getLoader()
      .getClassRef(className);
    if (!clsRef) {
      throw new Error('Unexpected error, class should have been loaded');
    }

    // resolve name
    const nameAndTypeIndex = invokerD.getConstant(
      methodRef.nameAndTypeIndex
    ) as ConstantNameAndTypeInfo;
    const methodName = invokerD.getConstant(nameAndTypeIndex.nameIndex).value;
    const methodDescriptor = invokerD.getConstant(
      nameAndTypeIndex.descriptorIndex
    ).value;
    // 5.4.3.3. Method Resolution
    const methodRes = clsRef.resolveMethod(
      methodName + methodDescriptor,
      clsRef
    );

    if (methodRes.error) {
      methodRef.error = methodRef.error ?? methodRes.error;
      return methodRes;
    }

    methodRef.methodRef = methodRef.methodRef ?? methodRes.methodRef;
    methodRef.error = '';
    return methodRes;
  }

  private resolveInterfaceMethod(
    methodName: string,
    symbolClass: ClassRef
  ): MethodResolutionResult {
    // 1. If C is not an interface, interface method resolution throws an IncompatibleClassChangeError.
    if (!symbolClass.checkInterface()) {
      return {
        error: 'java/lang/IncompatibleClassChangeError',
      };
    }
    return this._resolveMethod(methodName, symbolClass);
  }

  resolveInterfaceMethodRef(
    thread: Thread,
    methodRef: ConstantInterfaceMethodref
  ): MethodResolutionResult {
    // 5.4.3 if initial attempt to resolve a symbolic reference fails
    // then subsequent attempts to resolve the reference always fail with the same error
    if (methodRef.error) {
      return {
        error: methodRef.error,
      };
    }

    // Previously resolved without errors
    if (methodRef.error === '') {
      return {
        error: '',
      };
    }

    // resolve class
    const invokerD = thread.getClass();
    const constantCls = invokerD.getConstant(
      methodRef.classIndex
    ) as ConstantClass;
    const classRes = invokerD.resolveClassRef(constantCls);
    if (classRes.error) {
      methodRef.error = methodRef.error ?? classRes.error;
      return {
        error: classRes.error,
      };
    }
    const className = (
      invokerD.getConstant(constantCls.nameIndex) as ConstantUtf8Info
    ).value;
    const { result: clsRef, error } = invokerD
      .getLoader()
      .getClassRef(className);
    if (!clsRef) {
      throw new Error('Unexpected error, class should have been loaded');
    }

    // resolve name
    const nameAndTypeIndex = invokerD.getConstant(
      methodRef.nameAndTypeIndex
    ) as ConstantNameAndTypeInfo;
    const methodName = invokerD.getConstant(nameAndTypeIndex.nameIndex).value;
    const methodDescriptor = invokerD.getConstant(
      nameAndTypeIndex.descriptorIndex
    ).value;

    // 5.4.3.4. Interface Method Resolution
    const methodRes = clsRef.resolveInterfaceMethod(
      methodName + methodDescriptor,
      clsRef
    );

    methodRef.error = methodRef.error ?? methodRes.error;
    methodRef.methodRef = methodRef.methodRef ?? methodRes.methodRef;

    return methodRes;
  }

  resolveStringRef(strRef: ConstantString): {
    error?: string;
    result?: JvmObject;
  } {
    if (strRef.ref) {
      return { result: strRef.ref };
    }
    const strConst = this.constantPool[strRef.stringIndex] as ConstantUtf8Info;
    const stringRes = initString(this.loader, strConst.value);
    if (stringRes.result && !stringRes.error) {
      strRef.ref = stringRes.result;
    }
    return stringRes;
  }

  resolveMethodHandleRef(
    thread: Thread,
    methodHandleRef: ConstantMethodHandleInfo
  ): {
    error?: any;
    result?: string;
  } {
    const kind = methodHandleRef.referenceKind;

    let methodDesc: string;

    switch (kind) {
      // #region field types
      case REFERENCE_KIND.GetField:
        const constantField = this.getConstant(
          methodHandleRef.referenceIndex
        ) as ConstantFieldrefInfo;
        const classResolutionRes = this.resolveClassRef(
          this.getConstant(constantField.classIndex)
        );

        if (classResolutionRes.error || !classResolutionRes.classRef) {
          return {
            error:
              classResolutionRes.error ?? 'java/lang/ClassNotFoundException',
          };
        }
        const fieldClass = classResolutionRes.classRef;

        const nameAndTypeIndex = this.getConstant(
          constantField.nameAndTypeIndex
        ) as ConstantNameAndTypeInfo;
        const fieldName = this.getConstant(nameAndTypeIndex.nameIndex).value;
        const fieldType = this.getConstant(
          nameAndTypeIndex.descriptorIndex
        ).value;

        const fieldRef = fieldClass.getFieldRef(fieldName + fieldType);

        throw new Error('not implemented');
      case REFERENCE_KIND.GetStatic:
        throw new Error('not implemented');
      case REFERENCE_KIND.PutField:
        throw new Error('not implemented');
      case REFERENCE_KIND.PutStatic:
        throw new Error('not implemented');
      // #endregion

      // #region method types
      case REFERENCE_KIND.InvokeVirtual:
      case REFERENCE_KIND.InvokeStatic:
      case REFERENCE_KIND.InvokeSpecial:
      case REFERENCE_KIND.NewInvokeSpecial:
        const methodRes = this.resolveMethodRef(
          thread,
          this.getConstant(methodHandleRef.referenceIndex)
        );
        if (methodRes.error || !methodRes.methodRef) {
          return {
            error: methodRes.error ?? 'java/lang/NoSuchMethodError',
          };
        }
        const method = methodRes.methodRef;

        // constraints checking
        if (
          kind === REFERENCE_KIND.NewInvokeSpecial &&
          (method.getMethodName() !== '<init>' ||
            !method.getMethodDesc().endsWith(')V'))
        ) {
          return { error: 'java/lang/IllegalAccessError' };
        }
        // TODO: 5.4.3.5

        // symbolic references to classes and interfaces whose names correspond to each type in A*, and to the type T, in that order.
        let methodDesc = method.getMethodDesc();
        methodDesc = methodDesc.slice(1, methodDesc.indexOf(')'));
        const paramTypes = methodDesc.split(';');

        for (const param of paramTypes) {
          if (param.length <= 1) {
            // primitive type or ended
            continue;
          }

          let classType = param;
          if (param[0] === 'L') {
            // ref type
            classType = param.slice(1);
          }

          const res = this.resolveClass(classType);

          if (res.error || !res.result) {
            return {
              error: res.error ?? 'java/lang/ClassNotFoundException',
            };
          }
        }

        if (
          kind === REFERENCE_KIND.InvokeVirtual ||
          kind === REFERENCE_KIND.InvokeSpecial
        ) {
          methodDesc = `(L${method.getClass().getClassname()};${method
            .getMethodDesc()
            .slice(1)}`;
        } else if (kind === REFERENCE_KIND.NewInvokeSpecial) {
          methodDesc = `${method.getMethodDesc().slice(0, -1)}L${method
            .getClass()
            .getClassname()}`;
        } else {
          methodDesc = method.getMethodDesc();
        }
        return { result: methodDesc };
      // #endregion

      // #region interface types
      case REFERENCE_KIND.InvokeInterface:
        throw new Error('not implemented');
      // #endregion
    }
  }

  /**
   * Getters
   */
  getLoader(): AbstractClassLoader {
    return this.loader;
  }

  getConstant(constantIndex: number): any {
    const constItem = this.constantPool[constantIndex];
    return constItem;
  }

  getConstant64(constantIndex: number): any {
    const constItem = this.constantPool[constantIndex];
    return constItem;
  }

  getAccessFlags(): number {
    return this.accessFlags;
  }

  getClassname(): string {
    return this.thisClass;
  }

  getPackageName(): string {
    return this.packageName;
  }

  getInstanceFields(): {
    [fieldName: string]: FieldRef;
  } {
    if (this.instanceFields !== null) {
      return this.instanceFields;
    }

    const res = this.superClass?.getInstanceFields() ?? {};
    this.interfaces?.forEach(inter => {
      const fields = inter.getInstanceFields();
      for (const [fieldName, fieldRef] of Object.entries(fields)) {
        res[fieldName] = fieldRef;
      }
    });
    for (const [fieldName, fieldRef] of Object.entries(this.fields).filter(
      ([fn, fr]) => !fr.checkStatic()
    )) {
      res[`${this.thisClass}.${fieldName}`] = fieldRef;
    }

    return res;
  }

  getSuperClass(): ClassRef | null {
    return this.superClass;
  }

  getInterfaces() {
    return this.interfaces;
  }

  private _checkOverrides(overrideMethod: MethodRef, parentMethod: MethodRef) {
    if (overrideMethod === parentMethod) {
      return true;
    }

    const overrideClass = overrideMethod.getClass();
    const parentClass = parentMethod.getClass();
    return (
      overrideMethod.getClass().checkCast(parentMethod.getClass()) &&
      overrideMethod.getMethodName() === parentMethod.getMethodName() &&
      overrideMethod.getMethodDesc() === parentMethod.getMethodDesc() &&
      !overrideMethod.checkPrivate() &&
      (parentMethod.checkPublic() ||
        parentMethod.checkProtected() ||
        (!parentMethod.checkPrivate() &&
          parentClass.getPackageName() === overrideClass.getPackageName()))
    );
  }

  private _lookupMethodSuper(
    methodName: string,
    resolvedMethod: MethodRef,
    checkOverride?: boolean
  ) {
    // If C contains a declaration for an instance method m that overrides the resolved method, then m is the method to be invoked.
    if (
      this.methods[methodName] &&
      (!checkOverride ||
        this._checkOverrides(this.methods[methodName], resolvedMethod))
    ) {
      return this.methods[methodName];
    }

    // Otherwise, if C has a superclass, step 2 of method resolution is recursively invoked on the direct superclass of C.
    const superClass = this.getSuperClass();
    return superClass ? superClass._resolveMethodSuper(methodName) : null;
  }

  private _lookupMethodInterface(methodName: string): {
    error?: string;
    methodRef?: MethodRef;
  } {
    let res: MethodRef | null = null;
    for (const inter of this.interfaces) {
      let method = inter.getMethod(methodName);

      if (!method) {
        method = inter._lookupMethodInterface(methodName)?.methodRef ?? null;
      }

      if (
        method &&
        !method.checkPrivate() &&
        !method.checkStatic() &&
        !method.checkAbstract()
      ) {
        if (res) {
          return { error: 'java/lang/IncompatibleClassChangeError' };
        }
        res = method;
      }
    }
    return { error: 'java/lang/AbstractMethodError' };
  }

  lookupMethod(
    methodName: string,
    resolvedMethod: MethodRef,
    checkOverride?: boolean,
    checkInterface?: boolean
  ): { error?: string; methodRef?: MethodRef } {
    // If C contains a declaration for an instance method m that overrides
    // the resolved method, then m is the method to be invoked.
    let methodRef = this._lookupMethodSuper(
      methodName,
      resolvedMethod,
      checkOverride
    );
    if (methodRef) {
      if (checkInterface && !methodRef.checkPublic()) {
        return { error: 'java/lang/IllegalAccessError' };
      }

      if (methodRef.checkAbstract()) {
        return { error: 'java/lang/AbstractMethodError' };
      }
      if (methodRef.checkNative()) {
        // FIXME: If the code that implements the method cannot be bound,
        // invokevirtual throws an UnsatisfiedLinkError
      }

      return { methodRef };
    }

    return this._lookupMethodInterface(methodName);
  }

  getMethod(methodName: string): MethodRef | null {
    return this.methods[methodName] ?? null;
  }

  getFieldRef(fieldName: string): FieldRef | null {
    if (this.fields[fieldName]) {
      return this.fields[fieldName];
    }

    for (let i = 0; i < this.interfaces.length; i++) {
      let inter = this.interfaces[i];
      const field = inter.getFieldRef(fieldName);

      if (field) {
        return field;
      }
    }

    const superClass = this.getSuperClass();

    if (superClass === null) {
      return null;
    }

    return superClass.getFieldRef(fieldName);
  }

  getBootstrapMethod(methodIndex: number) {
    if (!this.bootstrapMethods) {
      throw new Error('No bootstrap methods');
    }

    return this.bootstrapMethods.bootstrapMethods[methodIndex];
  }

  /**
   * Setters
   */

  checkCast(castTo: ClassRef): boolean {
    if (this === castTo) {
      return true;
    }

    for (let i = 0; i < this.interfaces.length; i++) {
      let inter = this.interfaces[i];
      if (inter.checkCast(castTo)) {
        return true;
      }
    }

    const superClass = this.getSuperClass();

    if (superClass === null) {
      return false;
    }

    return superClass.checkCast(castTo);
  }

  instantiate(): JvmObject {
    return new JvmObject(this);
  }

  checkPublic() {
    return (this.accessFlags & CLASS_FLAGS.ACC_PUBLIC) !== 0;
  }

  checkFinal() {
    return (this.accessFlags & CLASS_FLAGS.ACC_FINAL) !== 0;
  }

  checkSuper() {
    return (this.accessFlags & CLASS_FLAGS.ACC_SUPER) !== 0;
  }

  checkInterface() {
    return (this.accessFlags & CLASS_FLAGS.ACC_INTERFACE) !== 0;
  }

  checkAbstract() {
    return (this.accessFlags & CLASS_FLAGS.ACC_ABSTRACT) !== 0;
  }

  checkSynthetic() {
    return (this.accessFlags & CLASS_FLAGS.ACC_SYNTHETIC) !== 0;
  }

  checkAnnotation() {
    return (this.accessFlags & CLASS_FLAGS.ACC_ANNOTATION) !== 0;
  }

  checkEnum() {
    return (this.accessFlags & CLASS_FLAGS.ACC_ENUM) !== 0;
  }

  checkModule() {
    return (this.accessFlags & CLASS_FLAGS.ACC_MODULE) !== 0;
  }
}
