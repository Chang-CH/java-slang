import { ClassRef } from '#types/ClassRef';
import JsSystem from '#utils/JsSystem';
import AbstractClassLoader from '..';

/**
 * Reads classfile representation and loads it into memory area
 */
export default class BootstrapClassLoader extends AbstractClassLoader {
  // TODO: add classpath etc.
  // TODO: store loaded classes here?

  constructor(os: JsSystem, classPath: string) {
    super(os, classPath, null);
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

    onFinish && onFinish(classData);
  }
}
