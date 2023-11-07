import { CLASS_FLAGS, ClassFile } from '#jvm/external/ClassFile/types';
import {
  ConstantClassInfo,
  ConstantUtf8Info,
} from '#jvm/external/ClassFile/types/constants';
import { ArrayClassRef } from '#types/class/ArrayClassRef';
import { ClassRef } from '#types/class/ClassRef';
import {
  ErrorResult,
  ImmediateResult,
  Result,
  ResultType,
  SuccessResult,
} from '#types/result';
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
  protected prepareClass(cls: ClassFile): void | Error {
    return;
  }

  /**
   * Resolves symbolic references in the constant pool.
   * @param cls class data to resolve
   * @returns class data with resolved references
   */
  protected linkClass(cls: ClassFile): ClassRef {
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

      if (res.checkError()) {
        // FIXME: save linker error, throw when attempting to get superclass
        throw new Error(res.getError().className);
      }

      superClass = res.getResult();
    }

    if ((accessFlags & CLASS_FLAGS.ACC_INTERFACE) !== 0 && !superClass) {
      // Some compilers set superclass to object by default.
      // We force it to be java/lang/Object if it's not set.
      // assume object is loaded at initialization.
      superClass = (
        this.getClassRef('java/lang/Object') as any
      ).getResult() as ClassRef;
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
      if (res.checkError()) {
        throw new Error(res.getError().className);
      }
      interfaces.push(res.getResult());
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
  protected loadClass(cls: ClassRef): ClassRef {
    this.loadedClasses[cls.getClassname()] = cls;
    return cls;
  }

  protected _loadArrayClass(
    className: string,
    componentCls: ClassRef
  ): ImmediateResult<ClassRef> {
    if (!this.parentLoader) {
      throw new Error('ClassLoader has no parent loader');
    }

    return this.parentLoader._loadArrayClass(className, componentCls);
  }

  protected _getClassRef(
    className: string,
    initiator: AbstractClassLoader
  ): ImmediateResult<ClassRef> {
    if (this.loadedClasses[className]) {
      return new SuccessResult(this.loadedClasses[className]);
    }

    // We might need the current loader to load its component class
    if (className.startsWith('[')) {
      const itemClsName = className.slice(1);
      let arrayObjCls;
      // link array component class
      // FIXME: linker errors should be thrown at runtime instead.
      if (itemClsName.startsWith('L')) {
        const itemRes = this._getClassRef(itemClsName.slice(1, -1), initiator);
        if (itemRes.checkError()) {
          return itemRes;
        }
        arrayObjCls = itemRes.getResult();
      } else if (itemClsName.startsWith('[')) {
        const itemRes = this._getClassRef(itemClsName, initiator);
        if (itemRes.checkError()) {
          return itemRes;
        }
        arrayObjCls = itemRes.getResult();
      } else {
        arrayObjCls = this.getPrimitiveClassRef(itemClsName);
      }

      const res = this._loadArrayClass(className, arrayObjCls);
      return res;
    }

    if (this.parentLoader) {
      const res = this.parentLoader._getClassRef(className, initiator);
      if (res.checkSuccess()) {
        return res;
      }
    }

    const res = this.load(className);
    return res;
  }

  /**
   * Gets the class data given the classname, loads the class if not loaded.
   *
   * @param className
   * @returns
   */
  getClassRef(className: string): ImmediateResult<ClassRef> {
    return this._getClassRef(className, this);
  }

  /**
   * Special method for loading primitive classes.
   * @throws Error if class is not a primitive
   * @param className
   */
  abstract getPrimitiveClassRef(className: string): ClassRef;

  // TODO: follow classloading spec 5.3.5
  protected abstract load(className: string): ImmediateResult<ClassRef>;
}
