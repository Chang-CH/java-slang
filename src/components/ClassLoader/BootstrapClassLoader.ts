import { CLASS_FLAGS, ClassFile } from '#jvm/external/ClassFile/types';
import { ClassRef } from '#types/ClassRef';
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
  load(className: string): { result?: ClassRef; error?: string } {
    console.debug(`BsCL: loading ${className}`);
    // array class
    if (className.startsWith('[')) {
      const objRes = this.getClassRef('java/lang/Object');
      if (objRes.error || !objRes.result) {
        return { error: objRes.error ?? 'java/lang/ClassNotFoundException' };
      }

      const arrayClass = ClassRef.createArrayClassRef(
        className,
        objRes.result,
        this
      );
      return { result: arrayClass };
    }

    const path = this.classPath ? this.classPath + '/' + className : className;

    let classFile;
    try {
      classFile = this.nativeSystem.readFile(path);
    } catch (e) {
      return { error: 'java/lang/ClassNotFoundException' };
    }

    this.prepareClass(classFile);
    const classData = this.linkClass(classFile);
    return { result: this.loadClass(classData) };
  }
}
