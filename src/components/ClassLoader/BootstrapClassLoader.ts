import { CLASS_FLAGS } from '#jvm/external/ClassFile/types';
import { ArrayClassRef } from '#types/class/ArrayClassRef';
import { ClassRef } from '#types/class/ClassRef';
import { JavaType } from '#types/dataTypes';
import { ErrorResult, ImmediateResult, SuccessResult } from '#types/result';
import AbstractSystem from '#utils/AbstractSystem';
import { classFileToText } from '#utils/Prettify/classfile';
import AbstractClassLoader from './AbstractClassLoader';

/**
 * Reads classfile representation and loads it into memory area
 */
export default class BootstrapClassLoader extends AbstractClassLoader {
  private primitiveClasses: { [className: string]: ClassRef } = {};

  constructor(nativeSystem: AbstractSystem, classPath: string) {
    super(nativeSystem, classPath, null);
  }

  /**
   * Attempts to load a class file. Class should not already be loaded.
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
      return new SuccessResult(this.loadClass(arrayClass));
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

  getPrimitiveClassRef(className: string): ClassRef {
    if (this.primitiveClasses[className]) {
      return this.primitiveClasses[className];
    }

    let internalName = '';
    switch (className) {
      case JavaType.byte:
        internalName = 'byte';
        break;
      case JavaType.char:
        internalName = 'char';
        break;
      case JavaType.double:
        internalName = 'double';
        break;
      case JavaType.float:
        internalName = 'float';
        break;
      case JavaType.int:
        internalName = 'int';
        break;
      case JavaType.long:
        internalName = 'long';
        break;
      case JavaType.short:
        internalName = 'short';
        break;
      case JavaType.boolean:
        internalName = 'boolean';
        break;
      case JavaType.void:
        internalName = 'void';
        break;
      default:
        throw new Error(`Not a primitive: ${className}`);
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
      this
    );
    this.primitiveClasses[className] = cls;
    return cls;
  }
}
