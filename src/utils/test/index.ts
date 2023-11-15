import AbstractClassLoader from '#jvm/components/ClassLoader/AbstractClassLoader';
import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { CLASS_FLAGS, ClassFile } from '#jvm/external/ClassFile/types';
import {
  AttributeInfo,
  CodeAttribute,
  ExceptionHandler,
} from '#jvm/external/ClassFile/types/attributes';
import {
  ConstantClassInfo,
  ConstantInfo,
  ConstantUtf8Info,
} from '#jvm/external/ClassFile/types/constants';
import { FIELD_FLAGS, FieldInfo } from '#jvm/external/ClassFile/types/fields';
import {
  METHOD_FLAGS,
  MethodInfo,
} from '#jvm/external/ClassFile/types/methods';
import { MethodHandler } from '#types/class/Method';
import { ArrayClassData } from '#types/class/ArrayClassData';
import { CLASS_STATUS, ClassData } from '#types/class/ClassData';
import { JavaType } from '#types/reference/Object';
import { JvmObject } from '#types/reference/Object';
import {
  ErrorResult,
  ImmediateResult,
  SuccessResult,
  checkError,
} from '#types/result';
import AbstractSystem from '#utils/AbstractSystem';

export class TestClassLoader extends AbstractClassLoader {
  getJavaObject(): JvmObject | null {
    return null;
  }
  private primitiveClasses: { [className: string]: ClassData } = {};
  getPrimitiveClassRef(className: string): ClassData {
    if (this.primitiveClasses[className]) {
      return this.primitiveClasses[className];
    }

    let internalName = '';
    switch (className) {
      case JavaType.byte:
        internalName = 'byte';
        break;
      case JavaType.char:
        internalName = 'char';
        break;
      case JavaType.double:
        internalName = 'double';
        break;
      case JavaType.float:
        internalName = 'float';
        break;
      case JavaType.int:
        internalName = 'int';
        break;
      case JavaType.long:
        internalName = 'long';
        break;
      case JavaType.short:
        internalName = 'short';
        break;
      case JavaType.boolean:
        internalName = 'boolean';
        break;
      case JavaType.void:
        internalName = 'void';
        break;
      default:
        throw new Error(`Not a primitive: ${className}`);
    }

    const cls = new ClassData(
      [],
      CLASS_FLAGS.ACC_PUBLIC,
      internalName,
      null,
      [],
      [],
      [],
      [],
      this
    );
    this.primitiveClasses[className] = cls;
    return cls;
  }

  private loadArray(
    className: string,
    componentCls: ClassData
  ): ImmediateResult<ClassData> {
    // #region load array superclasses/interfaces
    const objRes = this.getClassRef('java/lang/Object');
    if (checkError(objRes)) {
      return objRes;
    }
    const cloneableRes = this.getClassRef('java/lang/Cloneable');
    if (checkError(cloneableRes)) {
      return cloneableRes;
    }
    const serialRes = this.getClassRef('java/io/Serializable');
    if (checkError(serialRes)) {
      return serialRes;
    }
    // #endregion

    const arrayClass = new ArrayClassData(
      [],
      CLASS_FLAGS.ACC_PUBLIC,
      className,
      objRes.result,
      [cloneableRes.result, serialRes.result],
      [],
      [],
      [],
      this
    );
    arrayClass.setComponentClass(componentCls);

    this.loadClass(arrayClass);
    return { result: arrayClass };
  }

  load(className: string): ImmediateResult<ClassData> {
    const stubRef = this.createClass({
      className: className,
      loader: this,
    });
    return { result: stubRef };
  }

  loadTestClassRef(className: string, ref: ClassData) {
    this.loadedClasses[className] = ref;
  }

  private linkMethod2(
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
        const catchType = handler.catchType;
        const ctRes = this.getClassRef(catchType as unknown as string);
        if (checkError(ctRes)) {
          return { exceptionCls: 'java/lang/NoClassDefFoundError', msg: '' };
        }
        const clsRef = ctRes.result;

        handlderTable.push({
          startPc: handler.startPc,
          endPc: handler.endPc,
          handlerPc: handler.handlerPc,
          catchType: clsRef,
        });
      }
    }

    return {
      result: {
        method,
        exceptionHandlers: handlderTable,
        code,
      },
    };
  }

  createClass(options: {
    className?: string;
    loader?: TestClassLoader;
    superClass?: ClassData;
    constants?: ((c: ConstantInfo[]) => ConstantInfo)[];
    interfaces?: ClassData[];
    methods?: {
      accessFlags?: METHOD_FLAGS[];
      name?: string;
      descriptor?: string;
      attributes?: AttributeInfo[];
      code: DataView;
      exceptionTable?: {
        startPc: number;
        endPc: number;
        handlerPc: number;
        catchType: string;
      }[];
    }[];
    fields?: {
      accessFlags?: FIELD_FLAGS[];
      name?: string;
      descriptor?: string;
      attributes?: Array<AttributeInfo>;
      data?: any;
    }[];
    flags?: number;
    status?: CLASS_STATUS;
    isArray?: boolean;
  }) {
    let constantPool: ConstantInfo[] = [
      { tag: 7, nameIndex: 0 }, // dummy
      { tag: 7, nameIndex: 2 }, // superclass
      {
        tag: 1,
        length: 16,
        value:
          typeof options.superClass === 'string'
            ? options.superClass
            : 'java/lang/Object',
      }, // superclass name
      { tag: 7, nameIndex: 4 },
      {
        tag: 1,
        length: options.className?.length ?? 9,
        value: options.className ?? 'Test/Test',
      },
      {
        tag: CONSTANT_TAG.Utf8,
        length: 4,
        value: 'Code',
      },
    ];
    if (options.constants) {
      options.constants.forEach(func => {
        constantPool.push(func(constantPool));
      });
    }

    const methods = options.methods
      ? options.methods.map((method, index) => {
          constantPool.push({
            tag: CONSTANT_TAG.Utf8,
            length: 3,
            value: method.descriptor ?? `()V`,
          });

          constantPool.push({
            tag: CONSTANT_TAG.Utf8,
            length: 5,
            value: method.name ?? `test${index}`,
          });
          constantPool.push({
            tag: CONSTANT_TAG.Utf8,
            length: 4,
            value: 'Test',
          });
          constantPool.push({
            tag: CONSTANT_TAG.NameAndType,
            nameIndex: constantPool.length - 2,
            descriptorIndex: constantPool.length - 3,
          });
          constantPool.push({
            tag: CONSTANT_TAG.Class,
            nameIndex: constantPool.length - 2,
          });
          constantPool.push({
            tag: CONSTANT_TAG.Methodref,
            classIndex: constantPool.length - 1,
            nameAndTypeIndex: constantPool.length - 2,
          });

          const temp: MethodInfo = {
            accessFlags: (method.accessFlags ?? []).reduce((a, b) => a | b, 0),
            nameIndex: constantPool.length - 5,
            name: method.name ?? `test${index}`,
            descriptor: method.descriptor ?? `()V`,
            descriptorIndex: constantPool.length - 6,
            attributes: method.attributes ?? [],
            attributesCount: method.attributes?.length ?? 0,
          };

          temp.attributes.push({
            attributeNameIndex: 5,
            attributeLength: 0,
            maxStack: 100,
            maxLocals: 0,
            codeLength: 0,
            code: method.code,
            exceptionTableLength: method.exceptionTable?.length ?? 0,
            exceptionTable: (method.exceptionTable as any) ?? [],
            attributesCount: 0,
            attributes: [],
          } as CodeAttribute);

          const res = this.linkMethod2(constantPool, temp);
          if (checkError(res)) {
            throw new Error("Can't link method");
          }

          return res.result;
        })
      : [];
    const loader =
      options.loader ?? new TestClassLoader(new TestSystem(), 'test/', null);

    const fields: FieldInfo[] = options.fields
      ? options.fields.map((field, index) => {
          constantPool.push({
            tag: CONSTANT_TAG.Utf8,
            length: 3,
            value: field.descriptor ?? `I`,
          });
          constantPool.push({
            tag: CONSTANT_TAG.Utf8,
            length: 6,
            value: field.name ?? `field${index}`,
          });
          constantPool.push({
            tag: CONSTANT_TAG.Utf8,
            length: 4,
            value: options.className ?? 'Test',
          });
          constantPool.push({
            tag: CONSTANT_TAG.NameAndType,
            nameIndex: constantPool.length - 2,
            descriptorIndex: constantPool.length - 3,
          });
          constantPool.push({
            tag: CONSTANT_TAG.Class,
            nameIndex: constantPool.length - 2,
          });
          constantPool.push({
            tag: CONSTANT_TAG.Methodref,
            classIndex: constantPool.length - 1,
            nameAndTypeIndex: constantPool.length - 2,
          });

          return {
            accessFlags: (field.accessFlags ?? []).reduce((a, b) => a | b, 0),
            nameIndex: constantPool.length - 5,
            descriptorIndex: constantPool.length - 6,
            attributes: field.attributes ?? [],
            attributesCount: field.attributes?.length ?? 0,
          };
        })
      : [];

    const interfaces = options.interfaces ?? [];

    const clsRef = options.isArray
      ? new ArrayClassData(
          constantPool,
          options.flags ?? 33,
          options.className ?? '[LTest',
          options.superClass ?? (null as any),
          interfaces,
          fields,
          methods,
          [],
          loader
        )
      : new ClassData(
          constantPool,
          options.flags ?? 33,
          options.className ?? 'Test/Test',
          options.superClass ?? null,
          interfaces,
          fields,
          methods,
          [],
          loader
        );
    clsRef.status = options.status ?? CLASS_STATUS.PREPARED;

    loader.loadTestClassRef(options.className ?? 'Test/Test', clsRef);
    return clsRef;
  }

  protected _loadArrayClass(
    className: string,
    componentCls: ClassData
  ): ImmediateResult<ClassData> {
    return this.loadArray(className, componentCls);
  }
}

export class TestSystem extends AbstractSystem {
  stdout(message: string): void {
    throw new Error('Method not implemented.');
  }
  stderr(message: string): void {
    throw new Error('Method not implemented.');
  }
  readFile(path: string): ClassFile {
    throw new Error('Method not implemented.');
  }
}
