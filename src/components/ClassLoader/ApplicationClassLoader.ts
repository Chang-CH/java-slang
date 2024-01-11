import { ImmediateResult } from '#types/Result';
import { ClassData, PrimitiveClassData } from '#types/class/ClassData';
import type { JvmObject } from '#types/reference/Object';
import AbstractSystem from '#utils/AbstractSystem';
import AbstractClassLoader from './AbstractClassLoader';

export default class ApplicationClassLoader extends AbstractClassLoader {
  // TODO: store thisref here, Java ClassLoader Reference
  constructor(
    nativeSystem: AbstractSystem,
    classPath: string,
    parentLoader: AbstractClassLoader
  ) {
    super(nativeSystem, classPath, parentLoader);
  }

  /**
   * Attempts to load a class file
   * @param className name of class to load, e.g. [Ljava/lang/Object;
   * @returns
   */
  protected load(className: string): ImmediateResult<ClassData> {
    console.debug(`UserClassLoader: loading ${className}`);
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

  /**
   * Gets the primitive class data for a given primitive type. Overriden by BootstrapClassLoader.
   * @param className
   * @returns
   */
  getPrimitiveClass(className: string): PrimitiveClassData {
    if (this.parentLoader === null) {
      throw new Error('Primitive class not found');
    }
    return this.parentLoader.getPrimitiveClass(className);
  }

  getJavaObject(): JvmObject | null {
    console.error('ApplicationClassloader: Java object not created');
    return null;
  }
}
