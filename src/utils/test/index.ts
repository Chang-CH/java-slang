import AbstractClassLoader from '#jvm/components/ClassLoader/AbstractClassLoader';
import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { ClassFile } from '#jvm/external/ClassFile/types';
import {
  AttributeInfo,
  CodeAttribute,
} from '#jvm/external/ClassFile/types/attributes';
import {
  ConstantNameAndTypeInfo,
  ConstantUtf8Info,
} from '#jvm/external/ClassFile/types/constants';
import {
  METHOD_FLAGS,
  MethodInfo,
} from '#jvm/external/ClassFile/types/methods';
import { ClassRef, ConstantRef } from '#types/ConstantRef';
import AbstractSystem from '#utils/AbstractSystem';

export const createClass = (options: {
  className?: string;
  loader?: TestClassLoader;
  constants?: ((c: ConstantRef[]) => ConstantRef)[];
  methods?: {
    accessFlags?: METHOD_FLAGS[];
    name?: string;
    descriptor?: string;
    attributes?: AttributeInfo[];
    code: DataView;
  }[];
}): ClassRef => {
  let constantPool: ConstantRef[] = [
    { tag: 7, nameIndex: 0 }, // dummy
    { tag: 7, nameIndex: 2 }, // superclass
    { tag: 1, length: 16, value: 'java/lang/Object' }, // superclass name
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
          accessFlags: method.accessFlags
            ? method.accessFlags.reduce((a, b) => a | b)
            : METHOD_FLAGS.ACC_PUBLIC | METHOD_FLAGS.ACC_STATIC,
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

  const clsRef = new ClassRef(
    {
      magic: 0,
      minorVersion: 0,
      majorVersion: 0,

      constantPool: constantPool,
      constantPoolCount: constantPool.length,

      accessFlags: 33,
      thisClass: 3,
      superClass: 1,

      interfaces: [],
      interfacesCount: 0,

      fields: [],
      fieldsCount: 0,

      methods: methods,
      methodsCount: methods.length,

      attributes: [],
      attributesCount: 0,
    },
    loader
  );

  loader.loadTestClassRef(options.className ?? 'Test/Test', clsRef);
  return clsRef;
};

export class TestClassLoader extends AbstractClassLoader {
  load(className: string): ClassRef {
    throw new Error('Method not implemented.');
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
