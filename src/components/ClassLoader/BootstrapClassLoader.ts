import { CLASS_FLAGS } from '#jvm/external/ClassFile/types';
import { ArrayClassRef } from '#types/class/ArrayClassRef';
import { ClassRef } from '#types/class/ClassRef';
import { ErrorResult, ImmediateResult, SuccessResult } from '#types/result';
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
  load(className: string): ImmediateResult<ClassRef> {
    console.debug(`BsCL: loading ${className}`);
    // array class
    if (className.startsWith('[')) {
      const objRes = this.getClassRef('java/lang/Object');

      if (objRes.checkError()) {
        return objRes;
      }
      const arrayClass = new ArrayClassRef(
        [],
        CLASS_FLAGS.ACC_PUBLIC,
        className,
        objRes.getResult(),
        [],
        [],
        [],
        [],
        this
      );
      return new SuccessResult(arrayClass);
    }

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
