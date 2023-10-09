import { ClassRef } from '#types/ConstantRef';
import AbstractSystem from '#utils/AbstractSystem';
import AbstractClassLoader from './AbstractClassLoader';

/**
 * Reads classfile representation and loads it into memory area
 */
export default class BootstrapClassLoader extends AbstractClassLoader {
  constructor(nativeSystem: AbstractSystem, classPath: string) {
    super(nativeSystem, classPath, null);
  }

  /**
   * Attempts to load a class file
   * @param className name of class to load
   */
  load(className: string): ClassRef {
    console.debug(`BsCL: loading ${className}`);
    const path = this.classPath ? this.classPath + '/' + className : className;
    const classFile = this.nativeSystem.readFile(path);
    this.prepareClass(classFile);
    const classData = this.linkClass(classFile);
    return this.loadClass(classData);
  }
}
