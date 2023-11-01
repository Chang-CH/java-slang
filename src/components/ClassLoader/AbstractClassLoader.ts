import { CLASS_FLAGS, ClassFile } from '#jvm/external/ClassFile/types';
import {
  ConstantClassInfo,
  ConstantUtf8Info,
} from '#jvm/external/ClassFile/types/constants';
import { ClassRef } from '#types/class/ClassRef';
import AbstractSystem from '#utils/AbstractSystem';

export default abstract class AbstractClassLoader {
  protected nativeSystem: AbstractSystem;
  protected classPath: string;
  protected loadedClasses: {
    [className: string]: ClassRef;
  };
  parentLoader: AbstractClassLoader | null;

  constructor(
    nativeSystem: AbstractSystem,
    classPath: string,
    parentLoader: AbstractClassLoader | null
  ) {
    this.nativeSystem = nativeSystem;
    this.classPath = classPath;
    this.loadedClasses = {};
    this.parentLoader = parentLoader;
  }

  /**
   * Prepares the class data by checking jvm constraints.
   * @param cls class data to check
   * @returns Error, if any
   */
  prepareClass(cls: ClassFile): void | Error {
    return;
  }

  /**
   * Resolves symbolic references in the constant pool.
   * @param cls class data to resolve
   * @returns class data with resolved references
   */
  linkClass(cls: ClassFile): ClassRef {
    const constantPool = cls.constantPool;
    const accessFlags = cls.accessFlags;

    // resolve classname
    const clsInfo = cls.constantPool[cls.thisClass] as ConstantClassInfo;
    const clsName = cls.constantPool[clsInfo.nameIndex] as ConstantUtf8Info;
    const thisClass = clsName.value;

    // resolve superclass
    let superClass = null;
    if (cls.superClass !== 0) {
      const superClassIndex = cls.constantPool[
        cls.superClass
      ] as ConstantClassInfo;
      const superClassName = cls.constantPool[
        superClassIndex.nameIndex
      ] as ConstantUtf8Info;
      const res = this.getClassRef(superClassName.value);

      if (res.error) {
        // TODO: throw ClassNotFoundException/NoClassDefFoundError
        throw new Error(res.error);
      }

      if (!res.result) {
        throw new Error('Class reference not found');
      }
      superClass = res.result;
    }

    if ((accessFlags & CLASS_FLAGS.ACC_INTERFACE) !== 0 && !superClass) {
      // Some compilers set superclass to object by default.
      // We force it to be java/lang/Object if it's not set.
      const res = this.getClassRef('java/lang/Object');
      if (res.error || !res.result) {
        throw new Error('Object not loaded');
      }
      superClass = res.result;
    }

    // resolve interfaces
    const interfaces: ClassRef[] = [];
    cls.interfaces.forEach(interfaceIndex => {
      const interfaceNameIdx = (
        cls.constantPool[interfaceIndex] as ConstantClassInfo
      ).nameIndex;
      const interfaceName = (
        cls.constantPool[interfaceNameIdx] as ConstantUtf8Info
      ).value;
      const res = this.getClassRef(interfaceName);
      if (res.error) {
        // TODO: throw ClassNotFoundException/NoClassDefFoundError
        throw new Error(res.error);
      }

      if (!res.result) {
        throw new Error('Class reference not found');
      }
      interfaces.push(res.result);
    });

    const attributes = cls.attributes;

    const data = new ClassRef(
      constantPool,
      accessFlags,
      thisClass,
      superClass,
      interfaces,
      cls.fields,
      cls.methods,
      attributes,
      this
    );
    return data;
  }

  /**
   * Adds the resolved class data to the memory area.
   * @param cls resolved class data
   */
  loadClass(cls: ClassRef): ClassRef {
    this.loadedClasses[this.getClassName(cls)] = cls;
    return cls;
  }

  getClassName(cls: ClassRef): string {
    return cls.getClassname();
  }

  getClassRef(className: string): { result?: ClassRef; error?: string } {
    if (this.loadedClasses[className]) {
      return { result: this.loadedClasses[className] };
    }

    if (this.parentLoader) {
      const res = this.parentLoader.getClassRef(className);

      if (!res.error) {
        return res;
      }
    }
    return this.load(className);
  }

  // TODO: follow classloading spec 5.3.5
  abstract load(className: string): { result?: ClassRef; error?: string };
}
