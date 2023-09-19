import AbstractClassLoader from '#jvm/components/ClassLoader';
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
  ConstantUtf8Info,
} from '#jvm/external/ClassFile/types/constants';
import { FieldType } from '#jvm/external/ClassFile/types/fields';
import { MethodType } from '#jvm/external/ClassFile/types/methods';
import {
  ConstantClass,
  ConstantMethodref,
  ConstantRef,
  ConstantString,
} from './constants';

// TODO: after resolving one method, e.g. methodref, can change it to the actual method object.
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
    [methodName: string]: MethodType;
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
    clsRef.ref = thread
      .getClass()
      .getLoader()
      .getClassRef(className.value, e => {
        if (e.message === 'java/lang/ClassNotFoundException') {
          thread.throwNewException('java/lang/ClassNotFoundException', '');
        }
        throw e;
      });
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

    methodRef.ref = thread
      .getClass()
      .getLoader()
      .getClassRef(className, e => {
        if (e.message === 'java/lang/ClassNotFoundException') {
          thread.throwNewException('java/lang/ClassNotFoundException', '');
        }
        throw e;
      })
      .getMethod(thread, methodName + methodDescriptor);
  }

  private resolveStringRef(thread: NativeThread, strRef: ConstantString) {
    const strConst = this.constantPool[strRef.stringIndex] as ConstantUtf8Info;

    strRef.ref = initString(
      thread
        .getClass()
        .getLoader()
        .getClassRef('java/lang/String', e => {
          if (e.message === 'java/lang/ClassNotFoundException') {
            thread.throwNewException('java/lang/ClassNotFoundException', '');
          }
          throw e;
        }),
      strConst.value
    );
  }

  resolveReference(thread: NativeThread, ref: ConstantRef) {
    // ref has been resolved, return
    if ((ref as ConstantMethodref).ref) {
      return;
    }

    switch (ref.tag) {
      case CONSTANT_TAG.constantClass:
        this.resolveClassRef(thread, ref as ConstantClass);
        return;
      case CONSTANT_TAG.constantMethodref:
        this.resolveMethodRef(thread, ref as ConstantMethodref);
        return;
      case CONSTANT_TAG.constantInterfaceMethodref:
        // interface methods should be processed the same
        this.resolveMethodRef(thread, ref as ConstantMethodref);
        return;
      case CONSTANT_TAG.constantString:
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
      constItem.tag === CONSTANT_TAG.constantClass ||
      constItem.tag === CONSTANT_TAG.constantMethodref ||
      constItem.tag === CONSTANT_TAG.constantInterfaceMethodref ||
      constItem.tag === CONSTANT_TAG.constantString
    ) {
      this.resolveReference(thread, constItem);
    }
    return constItem;
  }

  getConstantWide(thread: NativeThread, constantIndex: number): any {
    const constItem = this.constantPool[constantIndex];
    if (
      constItem.tag === CONSTANT_TAG.constantClass ||
      constItem.tag === CONSTANT_TAG.constantMethodref ||
      constItem.tag === CONSTANT_TAG.constantInterfaceMethodref ||
      constItem.tag === CONSTANT_TAG.constantString
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
      const constantClass = this.getConstant(thread, this.superClass);
      this.resolveReference(thread, constantClass);
    }

    return this.superClass as ClassRef;
  }

  getInterfaces() {
    return this.interfaces;
  }

  getMethod(thread: NativeThread, methodName: string): MethodType {
    // TODO: throw error if method not found
    return this.methods[methodName];
  }

  getStatic(thread: NativeThread, fieldName: string): any {
    // TODO: check initialised
    // TODO: resolve ref if necessary
    return this.fields[fieldName].data;
  }

  getStaticWide(thread: NativeThread, fieldName: string): any {
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

  putStaticWide(thread: NativeThread, fieldName: string, value: any): void {
    // TODO: check initialised
    this.fields[fieldName].data = value;
  }
}
