import { ACCESS_FLAGS } from '#jvm/external/ClassFile/types';
import { ImmediateResult, ErrorResult } from '#types/Result';
import { ArrayClassData } from '#types/class/ClassData';
import { ClassData, PrimitiveClassData } from '#types/class/ClassData';
import { JavaType } from '#types/reference/Object';
import AbstractSystem from '#utils/AbstractSystem';
import { primitiveTypeToName } from '#utils/index';
import AbstractClassLoader from './AbstractClassLoader';

export default class BootstrapClassLoader extends AbstractClassLoader {
  private primitiveClasses: { [className: string]: PrimitiveClassData } = {};

  constructor(nativeSystem: AbstractSystem, classPath: string) {
    super(nativeSystem, classPath, null);
  }

  protected _loadArrayClass(
    className: string,
    componentCls: ClassData
  ): ImmediateResult<ArrayClassData> {
    let error: ErrorResult | null = null;
    const arrayClass = new ArrayClassData(
      ACCESS_FLAGS.ACC_PUBLIC,
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
}
