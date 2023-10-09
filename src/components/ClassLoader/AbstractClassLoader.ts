import { ClassFile } from '#jvm/external/ClassFile/types';
import { ClassRef } from '#types/ConstantRef';
import AbstractSystem from '#utils/AbstractSystem';
import NativeThread from '../ExecutionEngine/NativeThreadGroup/NativeThread';

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
    const data = new ClassRef(cls, this);
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

  protected getClassRef(className: string): ClassRef {
    if (this.loadedClasses[className]) {
      return this.loadedClasses[className];
    }

    if (this.parentLoader) {
      try {
        const res = this.parentLoader.getClassRef(className);
        if (res) {
          return res;
        }
      } catch (e) {
        return this.load(className);
      }
    }
    return this.load(className);
  }

  resolveClass(thread: NativeThread, className: string): ClassRef {
    try {
      return this.getClassRef(className);
    } catch (e) {
      thread.throwNewException('java/lang/ClassNotFoundException', className);
      return thread.getClass();
    }
  }

  _resolveClass(className: string): ClassRef {
    return this.getClassRef(className);
  }

  abstract load(className: string): ClassRef;
}
