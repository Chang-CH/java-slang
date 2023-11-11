import { CLASS_FLAGS, ClassFile } from '#jvm/external/ClassFile/types';
import { ArrayClassRef } from '#types/class/ArrayClassRef';
import { CLASS_TYPE, ClassRef } from '#types/class/ClassRef';
import { JavaType } from '#types/dataTypes';
import { JvmObject } from '#types/reference/Object';
import { ErrorResult, ImmediateResult, SuccessResult } from '#types/result';
import AbstractSystem from '#utils/AbstractSystem';
import { classFileToText } from '#utils/Prettify/classfile';
import { primitiveTypeToName } from '../ExecutionEngine/Interpreter/utils';
import AbstractClassLoader from './AbstractClassLoader';

/**
 * Reads classfile representation and loads it into memory area
 */
export default class BootstrapClassLoader extends AbstractClassLoader {
  private primitiveClasses: { [className: string]: ClassRef } = {};

  constructor(nativeSystem: AbstractSystem, classPath: string) {
    super(nativeSystem, classPath, null);
  }

  private loadArray(
    className: string,
    componentCls: ClassRef
  ): ImmediateResult<ClassRef> {
    // #region load array superclasses/interfaces
    const objRes = this.getClassRef('java/lang/Object');
    if (objRes.checkError()) {
      return objRes;
    }
    const cloneableRes = this.getClassRef('java/lang/Cloneable');
    if (cloneableRes.checkError()) {
      return cloneableRes;
    }
    const serialRes = this.getClassRef('java/io/Serializable');
    if (serialRes.checkError()) {
      return serialRes;
    }
    // #endregion

    const arrayClass = new ArrayClassRef(
      [],
      CLASS_FLAGS.ACC_PUBLIC,
      className,
      objRes.getResult(),
      [cloneableRes.getResult(), serialRes.getResult()],
      [],
      [],
      [],
      this
    );
    arrayClass.setComponentClass(componentCls);

    this.loadClass(arrayClass);
    return new SuccessResult(arrayClass);
  }

  /**
   * Attempts to load a class file. Class should not already be loaded.
   * @param className name of class to load
   */
  protected load(className: string): ImmediateResult<ClassRef> {
    console.debug(`BsCL: loading ${className}`);

    const path = this.classPath ? this.classPath + '/' + className : className;

    let classFile;
    try {
      classFile = this.nativeSystem.readFile(path);
    } catch (e) {
      console.log('COULD NOT FIND ', path);
      return new ErrorResult('java/lang/ClassNotFoundException', '');
    }

    this.prepareClass(classFile);
    const classData = this.linkClass(classFile);
    return new SuccessResult(this.loadClass(classData));
  }

  protected _loadArrayClass(
    className: string,
    componentCls: ClassRef
  ): ImmediateResult<ClassRef> {
    return this.loadArray(className, componentCls);
  }

  getPrimitiveClassRef(className: string): ClassRef {
    if (this.primitiveClasses[className]) {
      return this.primitiveClasses[className];
    }
    const internalName = primitiveTypeToName(className as JavaType);
    if (!internalName) {
      throw new Error(`Invalid primitive class name: ${className}`);
    }

    const cls = new ClassRef(
      [],
      CLASS_FLAGS.ACC_PUBLIC,
      internalName,
      null,
      [],
      [],
      [],
      [],
      this,
      CLASS_TYPE.PRIMITIVE
    );
    this.primitiveClasses[className] = cls;
    return cls;
  }

  getJavaObject(): JvmObject | null {
    return null;
  }
}
