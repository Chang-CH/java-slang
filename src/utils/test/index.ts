import AbstractClassLoader from '#jvm/components/ClassLoader/AbstractClassLoader';
import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { ClassFile } from '#jvm/external/ClassFile/types';
import {
  AttributeInfo,
  CodeAttribute,
} from '#jvm/external/ClassFile/types/attributes';
import { FIELD_FLAGS, FieldInfo } from '#jvm/external/ClassFile/types/fields';
import {
  METHOD_FLAGS,
  MethodInfo,
} from '#jvm/external/ClassFile/types/methods';
import { CLASS_STATUS, ClassRef } from '#types/ClassRef';
import { ConstantRef } from '#types/ConstantRef';
import AbstractSystem from '#utils/AbstractSystem';

export const createClass = (options: {
  className?: string;
  loader?: TestClassLoader;
  superClass?: ClassRef;
  constants?: ((c: ConstantRef[]) => ConstantRef)[];
  interfaces?: ClassRef[];
  methods?: {
    accessFlags?: METHOD_FLAGS[];
    name?: string;
    descriptor?: string;
    attributes?: AttributeInfo[];
    code: DataView;
  }[];
  fields?: {
    accessFlags?: FIELD_FLAGS[];
    name?: string;
    descriptor?: string;
    attributes?: Array<AttributeInfo>;
    data?: any;
  }[];
  status?: CLASS_STATUS;
}): ClassRef => {
  let constantPool: ConstantRef[] = [
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

  const methods: MethodInfo[] = options.methods
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

        const res: MethodInfo = {
          accessFlags: (method.accessFlags ?? []).reduce((a, b) => a | b, 0),
          nameIndex: constantPool.length - 5,
          name: method.name ?? `test${index}`,
          descriptor: method.descriptor ?? `()V`,
          descriptorIndex: constantPool.length - 6,
          attributes: method.attributes ?? [],
          attributesCount: method.attributes?.length ?? 0,
        };
        res.attributes.push({
          attributeNameIndex: 5,
          attributeLength: 0,
          maxStack: 100,
          maxLocals: 0,
          codeLength: 0,
          code: method.code,
          exceptionTableLength: 0,
          exceptionTable: [],
          attributesCount: 0,
          attributes: [],
        } as CodeAttribute);
        return res;
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

  const clsRef = new ClassRef(
    constantPool,
    33,
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
};

export class TestClassLoader extends AbstractClassLoader {
  load(className: string): { result?: ClassRef; error?: string } {
    const stubRef = createClass({
      className: className,
      loader: this,
    });
    return { result: stubRef };
  }

  loadTestClassRef(className: string, ref: ClassRef) {
    this.loadedClasses[className] = ref;
  }
}

export class TestSystem extends AbstractSystem {
  readFile(path: string): ClassFile {
    throw new Error('Method not implemented.');
  }
}