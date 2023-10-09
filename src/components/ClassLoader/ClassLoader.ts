import { ClassRef } from '#types/ConstantRef';
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
  load(className: string): ClassRef {
    console.debug(`ClassLoader: loading ${className}`);
    const path = this.classPath ? this.classPath + '/' + className : className;

    const classFile = this.nativeSystem.readFile(path);

    this.prepareClass(classFile);
    const classData = this.linkClass(classFile);
    return this.loadClass(classData);
  }
}
