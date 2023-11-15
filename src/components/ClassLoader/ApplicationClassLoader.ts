import { ClassRef } from '#types/class/ClassRef';
import { JvmObject } from '#types/reference/Object';
import { ErrorResult, ImmediateResult, SuccessResult } from '#types/result';
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
   * @param className name of class to load
   */
  protected load(className: string): ImmediateResult<ClassRef> {
    console.debug(`UserClassLoader: loading ${className}`);
    const path = this.classPath ? this.classPath + '/' + className : className;

    let classFile;
    try {
      classFile = this.nativeSystem.readFile(path);
    } catch (e) {
      return new ErrorResult('java/lang/ClassNotFoundException', className);
    }

    this.prepareClass(classFile);
    const classData = this.linkClass(classFile);
    return new SuccessResult(this.loadClass(classData));
  }

  getPrimitiveClassRef(className: string): ClassRef {
    if (this.parentLoader === null) {
      throw new Error('Primitive class not found');
    }
    return this.parentLoader.getPrimitiveClassRef(className);
  }

  getJavaObject(): JvmObject | null {
    console.error('ApplicationClassloader: Java object not created');
    return null;
  }
}
