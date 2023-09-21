import AbstractClassLoader from '#jvm/components/ClassLoader/AbstractClassLoader';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import { initString } from '#jvm/components/JNI/utils';
import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { ClassFile } from '#jvm/external/ClassFile/types';
import {
  AttributeBootstrapMethods,
  AttributeType,
} from '#jvm/external/ClassFile/types/attributes';
import {
  ConstantClassInfo,
  ConstantNameAndTypeInfo,
  ConstantType,
  ConstantUtf8Info,
} from '#jvm/external/ClassFile/types/constants';
import { FieldType } from '#jvm/external/ClassFile/types/fields';
import { MethodRef } from '#jvm/external/ClassFile/types/methods';
import { JavaReference } from '#types/dataTypes';

export interface ConstantClass {
  tag: CONSTANT_TAG;
  nameIndex: number;
  ref: ClassRef;
}

export interface ConstantMethodref {
  tag: CONSTANT_TAG;
  classIndex: number;
  nameAndTypeIndex: number;
  ref: MethodRef;
}

export interface ConstantInterfaceMethodref {
  tag: CONSTANT_TAG;
  classIndex: number;
  nameAndTypeIndex: number;
  ref: MethodRef;
}

export interface ConstantString {
  tag: CONSTANT_TAG;
  stringIndex: number;
  ref: JavaReference;
}

export interface ConstantInvokeDynamic {
  tag: CONSTANT_TAG;
  bootstrapMethodAttrIndex: number;
  nameAndTypeIndex: number;
}

export type ConstantRef =
  | ConstantType
  | ConstantClass
  | ConstantMethodref
  | ConstantInterfaceMethodref
  | ConstantString
  | ConstantInvokeDynamic;

export class ClassRef {
  public isInitialized: boolean = false;

  private loader: AbstractClassLoader;

  private constantPool: Array<ConstantRef>;
  private accessFlags: number;

  private thisClass: string;
  private superClass: number | ClassRef;

  private interfaces: Array<string | ClassRef>;

  private fields: {
    [fieldName: string]: FieldType;
  };

  private methods: {
    [methodName: string]: MethodRef;
  };

  private bootstrapMethods?: AttributeBootstrapMethods;
  private attributes: Array<AttributeType>;

  constructor(classfile: ClassFile, loader: AbstractClassLoader) {
    this.constantPool = classfile.constantPool;
    this.accessFlags = classfile.accessFlags;

    const clsInfo = classfile.constantPool[
      classfile.thisClass
    ] as ConstantClassInfo;
    const clsName = classfile.constantPool[
      clsInfo.nameIndex
    ] as ConstantUtf8Info;
    this.thisClass = clsName.value;

    this.superClass = classfile.superClass;

    this.interfaces = classfile.interfaces;

    this.fields = classfile.fields;
    this.methods = classfile.methods;

    this.attributes = classfile.attributes;

    this.loader = loader;
  }

  private resolveClassRef(thread: NativeThread, clsRef: ConstantClass) {
    const className = this.constantPool[clsRef.nameIndex] as ConstantUtf8Info;
    const ref = this.loader.resolveClass(thread, className.value);

    if (!ref) {
      thread.throwNewException('java/lang/ClassNotFoundException', '');
      return;
    }

    clsRef.ref = ref;
    return;
  }

  private resolveMethodRef(thread: NativeThread, methodRef: ConstantMethodref) {
    const className = thread
      .getClass()
      .getConstant(
        thread,
        thread.getClass().getConstant(thread, methodRef.classIndex).nameIndex
      ).value;

    const nameAndTypeIndex = thread
      .getClass()
      .getConstant(
        thread,
        methodRef.nameAndTypeIndex
      ) as ConstantNameAndTypeInfo;
    const methodName = thread
      .getClass()
      .getConstant(thread, nameAndTypeIndex.nameIndex).value;
    const methodDescriptor = thread
      .getClass()
      .getConstant(thread, nameAndTypeIndex.descriptorIndex).value;

    const clsRef = this.loader.resolveClass(thread, className);
    if (!clsRef) {
      thread.throwNewException('java/lang/ClassNotFoundException', '');
      return;
    }

    methodRef.ref = clsRef.getMethod(thread, methodName + methodDescriptor);
  }

  private resolveStringRef(thread: NativeThread, strRef: ConstantString) {
    const strConst = this.constantPool[strRef.stringIndex] as ConstantUtf8Info;

    const clsRef = this.loader.resolveClass(thread, 'java/lang/String');
    if (!clsRef) {
      thread.throwNewException('java/lang/ClassNotFoundException', '');
      return;
    }

    strRef.ref = initString(clsRef, strConst.value);
  }

  resolveReference(thread: NativeThread, ref: ConstantRef) {
    // ref has been resolved, return
    if ((ref as ConstantMethodref).ref) {
      return;
    }

    switch (ref.tag) {
      case CONSTANT_TAG.Class:
        this.resolveClassRef(thread, ref as ConstantClass);
        return;
      case CONSTANT_TAG.Methodref:
        this.resolveMethodRef(thread, ref as ConstantMethodref);
        return;
      case CONSTANT_TAG.InterfaceMethodref:
        // interface methods should be processed the same
        this.resolveMethodRef(thread, ref as ConstantMethodref);
        return;
      case CONSTANT_TAG.String:
        this.resolveStringRef(thread, ref as ConstantString);
        break;
    }
  }

  /**
   * Getters
   */
  getLoader(): AbstractClassLoader {
    return this.loader;
  }

  getConstant(thread: NativeThread, constantIndex: number): any {
    const constItem = this.constantPool[constantIndex];
    if (
      constItem.tag === CONSTANT_TAG.Class ||
      constItem.tag === CONSTANT_TAG.Methodref ||
      constItem.tag === CONSTANT_TAG.InterfaceMethodref ||
      constItem.tag === CONSTANT_TAG.String
    ) {
      this.resolveReference(thread, constItem);
    }
    return constItem;
  }

  getConstantWide(thread: NativeThread, constantIndex: number): any {
    const constItem = this.constantPool[constantIndex];
    if (
      constItem.tag === CONSTANT_TAG.Class ||
      constItem.tag === CONSTANT_TAG.Methodref ||
      constItem.tag === CONSTANT_TAG.InterfaceMethodref ||
      constItem.tag === CONSTANT_TAG.String
    ) {
      this.resolveReference(thread, constItem);
    }
    return constItem;
  }

  checkAccess(): number {
    return this.accessFlags;
  }

  getClassname(): string {
    return this.thisClass;
  }

  getSuperClass(thread: NativeThread): ClassRef {
    // resolve superclass if not resolved
    if (typeof this.superClass === 'number') {
      const Class = this.getConstant(thread, this.superClass);
      this.resolveReference(thread, Class);
    }

    return this.superClass as ClassRef;
  }

  getInterfaces() {
    return this.interfaces;
  }

  getMethod(thread: NativeThread, methodName: string): MethodRef {
    return this.methods[methodName];
  }

  getStatic(thread: NativeThread, fieldName: string): any {
    // TODO: check initialised
    // TODO: resolve ref if necessary
    return this.fields[fieldName].data;
  }

  getStatic64(thread: NativeThread, fieldName: string): any {
    // TODO: check initialised
    // TODO: resolve ref if necessary
    return this.fields[fieldName].data;
  }

  /**
   * Setters
   */
  putStatic(thread: NativeThread, fieldName: string, value: any): void {
    // TODO: check initialised
    this.fields[fieldName].data = value;
  }

  putStatic64(thread: NativeThread, fieldName: string, value: any): void {
    // TODO: check initialised
    this.fields[fieldName].data = value;
  }
}
