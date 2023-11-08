import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { CLASS_FLAGS, ClassFile } from '#jvm/external/ClassFile/types';
import {
  AttributeInfo,
  CodeAttribute,
} from '#jvm/external/ClassFile/types/attributes';
import {
  ConstantClassInfo,
  ConstantInfo,
  ConstantUtf8Info,
} from '#jvm/external/ClassFile/types/constants';
import { FIELD_FLAGS, FieldInfo } from '#jvm/external/ClassFile/types/fields';
import { MethodInfo } from '#jvm/external/ClassFile/types/methods';
import { MethodHandler, MethodRef } from '#types/MethodRef';
import { ArrayClassRef } from '#types/class/ArrayClassRef';
import { CLASS_STATUS, ClassRef } from '#types/class/ClassRef';
import { ConstantUtf8, ConstantClass } from '#types/constants';
import {
  ErrorResult,
  ImmediateResult,
  Result,
  ResultType,
  SuccessResult,
} from '#types/result';
import AbstractSystem from '#utils/AbstractSystem';
import { TestClassLoader, TestSystem } from '#utils/test';

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

  private _linkMethod(
    constantPool: ConstantInfo[],
    method: MethodInfo
  ): ImmediateResult<{
    method: MethodInfo;
    exceptionHandlers: MethodHandler[];
    code: CodeAttribute | null;
  }> {
    // get code attribute
    let code: CodeAttribute | null = null;
    for (const attr of method.attributes) {
      const attrname = (
        constantPool[attr.attributeNameIndex] as ConstantUtf8Info
      ).value;
      if (attrname === 'Code') {
        code = attr as CodeAttribute;
      }
    }

    const handlderTable: MethodHandler[] = [];
    if (code) {
      for (const handler of code.exceptionTable) {
        const ctIndex = handler.catchType;
        if (ctIndex === 0) {
          handlderTable.push({
            startPc: handler.startPc,
            endPc: handler.endPc,
            handlerPc: handler.handlerPc,
            catchType: null,
          });
          continue;
        }

        const catchType = constantPool[
          (constantPool[ctIndex] as ConstantClassInfo).nameIndex
        ] as ConstantUtf8Info;
        const ctRes = this.getClassRef(catchType.value);
        if (ctRes.checkError()) {
          return new ErrorResult('java/lang/NoClassDefFoundError', '');
        }
        const clsRef = ctRes.getResult();

        handlderTable.push({
          startPc: handler.startPc,
          endPc: handler.endPc,
          handlerPc: handler.handlerPc,
          catchType: clsRef,
        });
      }
    }

    return new SuccessResult({
      method,
      exceptionHandlers: handlderTable,
      code,
    });
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

    const methods: {
      method: MethodInfo;
      exceptionHandlers: MethodHandler[];
      code: CodeAttribute | null;
    }[] = [];
    cls.methods.forEach(method => {
      const res = this._linkMethod(constantPool, method);
      if (res.checkError()) {
        throw new Error(res.getError().className);
      }
      const mData = res.getResult();
      methods.push(mData);
    });

    const attributes = cls.attributes;

    const data = new ClassRef(
      constantPool,
      accessFlags,
      thisClass,
      superClass,
      interfaces,
      cls.fields,
      methods,
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

  createAnonymousClass(options: {
    innerClassOf: ClassRef;
    superClass: ClassRef;
    interfaces: ClassRef[];
    constants: ((c: ConstantInfo[]) => ConstantInfo)[];
    methods: {
      accessFlags: number;
      name: string;
      descriptor: string;
      attributes: AttributeInfo[];
      code: DataView;
      maxStack: number;
      maxLocals: number;
      exceptionTable: {
        startPc: number;
        endPc: number;
        handlerPc: number;
        catchType: number;
      }[];
    }[];
    fields: {
      accessFlags: number;
      name: string;
      descriptor: string;
      attributes: Array<AttributeInfo>;
    }[];
    flags: number;
    className?: string;
  }) {
    let constantPool: ConstantInfo[] = [
      { tag: CONSTANT_TAG.Class, nameIndex: 0 }, // dummy
      { tag: CONSTANT_TAG.Utf8, value: 'Code', length: 0 }, // dummy
    ];
    const codeAttributeNameIndex = 1;

    // #region populate constant pool with class refs
    // do we really need to populate the constant pool?
    constantPool.push({
      tag: CONSTANT_TAG.Class,
      nameIndex: constantPool.length + 1,
    });
    const superClsName = options.superClass.getClassname();
    constantPool.push({
      tag: CONSTANT_TAG.Utf8,
      value: superClsName,
      length: superClsName.length,
    });
    const nestHost = options.innerClassOf;
    const clsName =
      nestHost.getClassname() + '$' + nestHost.getAnonymousInnerId();
    let thisClassIndex = constantPool.length;
    constantPool.push({
      tag: CONSTANT_TAG.Class,
      nameIndex: constantPool.length + 1,
    });
    constantPool.push({
      tag: CONSTANT_TAG.Utf8,
      value: clsName,
      length: clsName.length,
    });
    // #endregion

    options.constants.forEach(func => {
      constantPool.push(func(constantPool));
    });

    // #region create constants for methods
    const methods: {
      method: MethodInfo;
      exceptionHandlers: MethodHandler[];
      code: CodeAttribute | null;
    }[] = [];
    options.methods.forEach((method, index) => {
      constantPool.push({
        tag: CONSTANT_TAG.Utf8,
        length: method.descriptor.length,
        value: method.descriptor,
      });
      constantPool.push({
        tag: CONSTANT_TAG.Utf8,
        length: method.name.length,
        value: method.name,
      });
      constantPool.push({
        tag: CONSTANT_TAG.NameAndType,
        nameIndex: constantPool.length - 1,
        descriptorIndex: constantPool.length - 2,
      });
      constantPool.push({
        tag: CONSTANT_TAG.Methodref,
        classIndex: thisClassIndex,
        nameAndTypeIndex: constantPool.length - 1,
      });

      const code: CodeAttribute = {
        attributeNameIndex: codeAttributeNameIndex,
        attributeLength: 0, // should not be needed
        maxStack: method.maxStack,
        maxLocals: method.maxLocals,
        codeLength: method.code.byteLength,
        code: method.code,
        exceptionTableLength: method.exceptionTable.length,
        exceptionTable: method.exceptionTable,
        attributesCount: 0,
        attributes: [],
      };
      const temp: MethodInfo = {
        accessFlags: method.accessFlags,
        nameIndex: constantPool.length - 3,
        descriptorIndex: constantPool.length - 4,
        attributes: [code, ...method.attributes],
        attributesCount: method.attributes.length + 1,
        name: method.name,
        descriptor: method.descriptor,
      };
      const linkRes = this._linkMethod(constantPool, temp);
      if (linkRes.checkError()) {
        throw new Error("Can't link method");
      }

      methods.push(linkRes.getResult());
    });
    // #endregion

    // #region create constants for fields
    const fields: FieldInfo[] = options.fields.map((field, index) => {
      constantPool.push({
        tag: CONSTANT_TAG.Utf8,
        length: field.descriptor.length,
        value: field.descriptor,
      });
      constantPool.push({
        tag: CONSTANT_TAG.Utf8,
        length: field.name.length,
        value: field.name,
      });
      constantPool.push({
        tag: CONSTANT_TAG.NameAndType,
        nameIndex: constantPool.length - 1,
        descriptorIndex: constantPool.length - 2,
      });
      constantPool.push({
        tag: CONSTANT_TAG.Fieldref,
        classIndex: thisClassIndex,
        nameAndTypeIndex: constantPool.length - 2,
      });

      return {
        accessFlags: field.accessFlags,
        nameIndex: constantPool.length - 3,
        descriptorIndex: constantPool.length - 4,
        attributes: field.attributes,
        attributesCount: field.attributes.length,
      };
    });
    // #endregion

    const clsRef = new ClassRef(
      constantPool,
      options.flags,
      clsName,
      options.superClass,
      options.interfaces,
      fields,
      methods,
      [],
      this
    );

    return clsRef;
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
