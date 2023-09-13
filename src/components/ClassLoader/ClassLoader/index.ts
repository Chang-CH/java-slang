import MemoryArea from '#jvm/components/MemoryArea';
import { ClassRef } from '#types/ClassRef';
import { ClassFile } from '#types/ClassFile';
import OsInterface from '#utils/OsInterface';
import parseBin from '#utils/parseBinary';
import AbstractClassLoader from '..';

/**
 * Reads classfile representation and loads it into memory area
 */
export default class ClassLoader extends AbstractClassLoader {
  // TODO: add classpath etc.
  // TODO: store loaded classes here?
  // TODO: store thisref etc. here, Java ClassLoader Reference
  parentLoader: AbstractClassLoader;
  constructor(
    memoryArea: MemoryArea,
    os: OsInterface,
    classPath: string,
    parentLoader: AbstractClassLoader
  ) {
    super(memoryArea, os, classPath);
    this.parentLoader = parentLoader;
  }

  /**
   * Attempts to load a class file
   * @param className name of class to load
   */
  load(
    className: string,
    onFinish?: (classData: ClassRef) => void,
    onError?: (error: Error) => void
  ): void {
    console.debug(`ClassLoader: loading ${className}`);
    // TODO: verify jvm loading path etc.
    const path = this.classPath ? this.classPath + '/' + className : className;

    if (this.parentLoader) {
      this.parentLoader.load(
        className,
        () => {},
        e => {
          let classFile;
          try {
            classFile = this.os.readFile(path);
          } catch (e) {
            e instanceof Error && onError && onError(e);
          }

          if (!classFile) {
            onError && onError(new Error('class not found'));
            return;
          }

          this.prepareClass(classFile);
          const classData = this.linkClass(classFile);
          this.loadClass(classData);
          onFinish && onFinish(classData);
        }
      );
      return;
    }
    let classFile;
    try {
      classFile = this.os.readFile(path);
    } catch (e) {
      console.error(e);
      e instanceof Error && onError && onError(e);
    }
    if (!classFile) {
      onError && onError(new Error('class not found'));
      return;
    }

    this.prepareClass(classFile);
    const classData = this.linkClass(classFile);
    this.loadClass(classData);
    onFinish && onFinish(classData);
  }
}
