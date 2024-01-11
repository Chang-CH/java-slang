import { CLASS_FLAGS } from '#jvm/external/ClassFile/types';
import { ImmediateResult, ErrorResult } from '#types/Result';
import { ArrayClassData } from '#types/class/ClassData';
import { ClassData, PrimitiveClassData } from '#types/class/ClassData';
import { JavaType } from '#types/reference/Object';
import type { JvmObject } from '#types/reference/Object';
import AbstractSystem from '#utils/AbstractSystem';
import { primitiveTypeToName } from '#utils/index';
import AbstractClassLoader from './AbstractClassLoader';

/**
 * Reads classfile representation and loads it into memory area
 */
export default class BootstrapClassLoader extends AbstractClassLoader {
  private primitiveClasses: { [className: string]: PrimitiveClassData } = {};

  constructor(nativeSystem: AbstractSystem, classPath: string) {
    super(nativeSystem, classPath, null);
  }

  /**
   * Attempts to load a class file. Class should not already be loaded.
   * @param className name of class to load
   */
  protected load(className: string): ImmediateResult<ClassData> {
    console.debug(`BsCL: loading ${className}`);

    const path = this.classPath ? this.classPath + '/' + className : className;

    let classFile;
    try {
      classFile = this.nativeSystem.readFile(path);
    } catch (e) {
      return {
        exceptionCls: 'java/lang/ClassNotFoundException',
        msg: className,
      };
    }

    const classData = this.linkClass(classFile);
    return { result: this.loadClass(classData) };
  }

  protected _loadArrayClass(
    className: string,
    componentCls: ClassData
  ): ImmediateResult<ArrayClassData> {
    let error: ErrorResult | null = null;
    const arrayClass = new ArrayClassData(
      CLASS_FLAGS.ACC_PUBLIC,
      className,
      this,
      componentCls,
      e => (error = e)
    );
    if (error) {
      return error;
    }

    this.loadClass(arrayClass);
    return { result: arrayClass };
  }

  getPrimitiveClass(className: string): PrimitiveClassData {
    const internalName = primitiveTypeToName(className as JavaType);
    if (!internalName) {
      throw new Error(`Invalid primitive class name: ${className}`);
    }

    if (this.primitiveClasses[internalName]) {
      return this.primitiveClasses[internalName];
    }

    const cls = new PrimitiveClassData(this, internalName);
    this.primitiveClasses[internalName] = cls;
    return cls;
  }

  getJavaObject(): JvmObject | null {
    return null;
  }
}
