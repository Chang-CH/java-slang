import MemoryArea from '#jvm/components/MemoryArea';
import { ClassData } from '#types/ClassData';
import OsInterface from '#utils/OsInterface';
import AbstractClassLoader from '..';

/**
 * Reads classfile representation and loads it into memory area
 */
export default class BootstrapClassLoader extends AbstractClassLoader {
  // TODO: add classpath etc.
  // TODO: store loaded classes here?

  constructor(memoryArea: MemoryArea, os: OsInterface, classPath: string) {
    super(memoryArea, os, classPath);
  }

  /**
   * Attempts to load a class file
   * @param className name of class to load
   */
  load(
    className: string,
    onFinish?: (classData: ClassData) => void,
    onError?: (error: Error) => void
  ): void {
    if (this.memoryArea.getClass(className)) {
      onFinish && onFinish(this.memoryArea.getClass(className));
      return;
    }

    console.debug(`BsCL: loading ${className}`);
    // TODO: verify jvm loading path etc.
    const path = this.classPath ? this.classPath + '/' + className : className;
    let classFile;
    try {
      classFile = this.os.readFile(path);
    } catch (e) {
      // Throw ClassNotFoundException isntead.
      e instanceof Error && onError && onError(e);
      return;
    }

    this.prepareClass(classFile);
    const classData = this.linkClass(classFile);
    this.loadClass(classData);

    // if (className === 'java/lang/Class') {
    //   console.debug(classData.constant_pool.filter(x);
    // }

    onFinish && onFinish(classData);
  }
}
