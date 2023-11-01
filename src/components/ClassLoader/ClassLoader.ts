import { ClassRef } from '#types/class/ClassRef';
import { ErrorResult, ImmediateResult, SuccessResult } from '#types/result';
import AbstractSystem from '#utils/AbstractSystem';
import AbstractClassLoader from './AbstractClassLoader';

export default class ClassLoader extends AbstractClassLoader {
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
  load(className: string): ImmediateResult<ClassRef> {
    console.debug(`ClassLoader: loading ${className}`);
    const path = this.classPath ? this.classPath + '/' + className : className;

    let classFile;
    try {
      classFile = this.nativeSystem.readFile(path);
    } catch (e) {
      return new ErrorResult('java/lang/ClassNotFoundException', '');
    }

    this.prepareClass(classFile);
    const classData = this.linkClass(classFile);
    return new SuccessResult(this.loadClass(classData));
  }
}
