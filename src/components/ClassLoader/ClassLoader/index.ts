import { ClassRef } from '#types/ClassRef';
import JsSystem from '#utils/JsSystem';
import AbstractClassLoader from '..';

export default class ClassLoader extends AbstractClassLoader {
  // TODO: add classpath etc.
  // TODO: store loaded classes here?
  // TODO: store thisref etc. here, Java ClassLoader Reference

  constructor(
    os: JsSystem,
    classPath: string,
    parentLoader: AbstractClassLoader
  ) {
    super(os, classPath, parentLoader);
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
          // Parent class could not load
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
