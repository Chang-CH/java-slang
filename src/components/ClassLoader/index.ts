import MemoryArea from '#jvm/components/MemoryArea';
import { ClassRef } from '#types/ClassRef';
import { ClassFile } from '#types/ClassFile';
import OsInterface from '#utils/OsInterface';
import parseBin from '#utils/parseBinary';

export default abstract class AbstractClassLoader {
  protected memoryArea: MemoryArea;
  protected os: OsInterface;
  protected classPath: string;

  constructor(memoryArea: MemoryArea, os: OsInterface, classPath: string) {
    this.memoryArea = memoryArea;
    this.os = os;
    this.classPath = classPath;
  }

  /**
   * Prepares the class data by checking jvm constraints
   * @param cls class data to check
   * @returns Error, if any
   */
  prepareClass(cls: ClassFile): void | Error {
    console.warn('BootstrapClassLoader.prepareClass: not implemented.');
    return;
  }

  /**
   * Resolves symbolic references in the constant pool
   * @param cls class data to resolve
   * @returns class data with resolved references
   */
  linkClass(cls: ClassFile): ClassRef {
    const data = {
      ...cls,
      loader: this,
      isInitialized: false,
    };
    return data;
  }

  /**
   * Adds the resolved class data to the memory area
   * @param cls resolved class data
   */
  loadClass(cls: ClassRef): void {
    console.warn('BootstrapClassLoader.loadClass: not implemented.');
    this.memoryArea.loadClass(this.getClassName(cls), cls);
  }

  getClassName(cls: ClassRef): string {
    return cls.this_class;
  }

  /**
   * Attempts to load a class file
   * @param className name of class to load
   */
  abstract load(
    className: string,
    onFinish?: (classData: ClassRef) => void,
    onError?: (error: Error) => void
  ): void;
}
