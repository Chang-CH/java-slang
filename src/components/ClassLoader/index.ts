import { ClassFile } from '#jvm/external/ClassFile/types';
import { ClassRef } from '#types/ClassRef';
import JsSystem from '#utils/JsSystem';

export default abstract class AbstractClassLoader {
  protected os: JsSystem;
  protected classPath: string;
  protected loadedClasses: {
    [className: string]: ClassRef;
  };
  parentLoader: AbstractClassLoader | null;

  constructor(
    os: JsSystem,
    classPath: string,
    parentLoader: AbstractClassLoader | null
  ) {
    this.os = os;
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
  loadClass(cls: ClassRef): void {
    this.loadedClasses[this.getClassName(cls)] = cls;
  }

  getClassName(cls: ClassRef): string {
    return cls.getClassname();
  }

  /**
   * Returns a reference to the class data of the class with the given name,
   * loading the class if it is not found.
   * @param className className to search for
   * @param onError callback if an error occurs
   * @returns object representing the class data of the class
   */
  getClassRef(className: string, onError: (e: Error) => void): ClassRef {
    if (this.loadedClasses[className]) {
      return this.loadedClasses[className];
    }

    if (this.parentLoader) {
      const res = this.parentLoader.getClassRef(className, () => {});
      if (res) {
        return res;
      }
    }

    // not found, try to load.
    this.load(
      className,
      () => {},
      () => {}
    );

    // still not loaded
    if (!this.loadedClasses[className]) {
      onError && onError(new Error('java/lang/ClassNotFoundException'));
    }
    return this.loadedClasses[className];
  }

  /**
   * Attempts to load a class file.
   * @param className name of class to load
   * @param onFinish callback if successful
   * @param onError callback if an error occurs
   */
  abstract load(
    className: string,
    onFinish?: (classData: ClassRef) => void,
    onError?: (error: Error) => void
  ): void;
}
