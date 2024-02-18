import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import Monitor from '#jvm/components/monitor';
import Thread from '#jvm/components/thread';
import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { ACCESS_FLAGS, ClassFile } from '#jvm/external/ClassFile/types';
import { FIELD_FLAGS } from '#jvm/external/ClassFile/types/fields';
import { SuccessResult, checkError, checkSuccess } from '#types/Result';
import { ReferenceClassData } from '#types/class/ClassData';
import { Method } from '#types/class/Method';
import {
  TestSystem,
  TestClassLoader,
  TestThread,
  TestThreadPool,
} from './__utils__/test-utility';

let monitor: Monitor;
let threadClass: ReferenceClassData;
let testSystem: TestSystem;
let testLoader: TestClassLoader;
let tpool: TestThreadPool;
let thread: Thread;
let bscl: BootstrapClassLoader;

let testClassTemplate: ClassFile;
let testSuperClassTemplate: ClassFile;
let testInterfaceTemplate1: ClassFile;
let testInterfaceTemplate2: ClassFile;

beforeEach(() => {
  monitor = new Monitor();
  testSystem = new TestSystem();
  testLoader = new TestClassLoader(testSystem, '', null);
  testLoader.createClass({
    className: 'java/lang/Object',
    loader: testLoader,
    superClass: null,
  });
  threadClass = testLoader.createClass({
    className: 'java/lang/Thread',
    loader: testLoader,
  }) as ReferenceClassData;
  tpool = new TestThreadPool(() => {});
  thread = new TestThread(threadClass, null as any, tpool);
  testClassTemplate = {
    accessFlags: 0,
    magic: 0,
    minorVersion: 0,
    majorVersion: 0,
    thisClass: 1,
    constantPool: [
      {
        tag: CONSTANT_TAG.Class,
        nameIndex: 0,
      },
      // this class #1
      {
        tag: CONSTANT_TAG.Class,
        nameIndex: 2,
      },
      {
        tag: CONSTANT_TAG.Utf8,
        length: 4,
        value: 'Test',
      },

      // super class #3
      {
        tag: CONSTANT_TAG.Class,
        nameIndex: 4,
      },
      {
        tag: CONSTANT_TAG.Utf8,
        length: 5,
        value: 'Super',
      },

      // interface #5
      {
        tag: CONSTANT_TAG.Class,
        nameIndex: 6,
      },
      {
        tag: CONSTANT_TAG.Utf8,
        length: 10,
        value: 'Interface1',
      },

      // interface #7
      {
        tag: CONSTANT_TAG.Class,
        nameIndex: 8,
      },
      {
        tag: CONSTANT_TAG.Utf8,
        length: 10,
        value: 'Interface2',
      },
    ],
    constantPoolCount: 4,

    fields: [],
    fieldsCount: 0,

    interfaces: [5, 7],
    interfacesCount: 0,

    methods: [],
    methodsCount: 0,

    attributes: [],
    attributesCount: 0,

    superClass: 3,
  };

  testSuperClassTemplate = {
    accessFlags: 0,
    magic: 0,
    minorVersion: 0,
    majorVersion: 0,
    thisClass: 1,
    constantPool: [
      {
        tag: CONSTANT_TAG.Class,
        nameIndex: 0,
      },
      // this class #1
      {
        tag: CONSTANT_TAG.Class,
        nameIndex: 2,
      },
      {
        tag: CONSTANT_TAG.Utf8,
        length: 5,
        value: 'Super',
      },
    ],
    constantPoolCount: 2,

    fields: [],
    fieldsCount: 0,

    interfaces: [],
    interfacesCount: 0,

    methods: [],
    methodsCount: 0,

    attributes: [],
    attributesCount: 0,

    superClass: 0,
  };

  testInterfaceTemplate1 = {
    accessFlags: 0,
    magic: 0,
    minorVersion: 0,
    majorVersion: 0,
    thisClass: 1,
    constantPool: [
      {
        tag: CONSTANT_TAG.Class,
        nameIndex: 0,
      },
      // this class #1
      {
        tag: CONSTANT_TAG.Class,
        nameIndex: 2,
      },
      {
        tag: CONSTANT_TAG.Utf8,
        length: 10,
        value: 'Interface1',
      },
    ],
    constantPoolCount: 2,

    fields: [],
    fieldsCount: 0,

    interfaces: [],
    interfacesCount: 0,

    methods: [],
    methodsCount: 0,

    attributes: [],
    attributesCount: 0,

    superClass: 0,
  };

  testInterfaceTemplate2 = {
    accessFlags: 0,
    magic: 0,
    minorVersion: 0,
    majorVersion: 0,
    thisClass: 1,
    constantPool: [
      {
        tag: CONSTANT_TAG.Class,
        nameIndex: 0,
      },
      // this class #1
      {
        tag: CONSTANT_TAG.Class,
        nameIndex: 2,
      },
      {
        tag: CONSTANT_TAG.Utf8,
        length: 10,
        value: 'Interface2',
      },
    ],
    constantPoolCount: 2,

    fields: [],
    fieldsCount: 0,

    interfaces: [],
    interfacesCount: 0,

    methods: [],
    methodsCount: 0,

    attributes: [],
    attributesCount: 0,

    superClass: 0,
  };

  bscl = new BootstrapClassLoader(testSystem, '');
});

const populateFields = () => {
  testSuperClassTemplate.constantPool.push(
    {
      tag: CONSTANT_TAG.Utf8,
      length: 8,
      value: 'superField',
    },
    {
      tag: CONSTANT_TAG.Utf8,
      length: 1,
      value: 'I',
    },
    {
      tag: CONSTANT_TAG.Utf8,
      length: 8,
      value: 'privateSuperField',
    },
    {
      tag: CONSTANT_TAG.Utf8,
      length: 1,
      value: 'I',
    },

    {
      tag: CONSTANT_TAG.Utf8,
      length: 8,
      value: 'staticSuperField',
    },
    {
      tag: CONSTANT_TAG.Utf8,
      length: 1,
      value: 'I',
    }
  );
  testSuperClassTemplate.constantPoolCount += 6;
  testSuperClassTemplate.fields.push(
    {
      accessFlags: FIELD_FLAGS.ACC_PUBLIC,
      nameIndex: 3,
      descriptorIndex: 4,
      attributes: [],
      attributesCount: 0,
    },
    {
      accessFlags: FIELD_FLAGS.ACC_PRIVATE,
      nameIndex: 5,
      descriptorIndex: 6,
      attributes: [],
      attributesCount: 0,
    },
    {
      accessFlags: FIELD_FLAGS.ACC_STATIC,
      nameIndex: 7,
      descriptorIndex: 8,
      attributes: [],
      attributesCount: 0,
    }
  );
  testSuperClassTemplate.fieldsCount = 3;

  testInterfaceTemplate1.constantPool.push(
    // field #3
    {
      tag: CONSTANT_TAG.Utf8,
      length: 8,
      value: 'interfaceField',
    },
    {
      tag: CONSTANT_TAG.Utf8,
      length: 1,
      value: 'I',
    },
    // field #5
    {
      tag: CONSTANT_TAG.Utf8,
      length: 8,
      value: 'privateInterfaceField',
    },
    {
      tag: CONSTANT_TAG.Utf8,
      length: 1,
      value: 'I',
    },
    // field #7
    {
      tag: CONSTANT_TAG.Utf8,
      length: 8,
      value: 'staticInterfaceField',
    },
    {
      tag: CONSTANT_TAG.Utf8,
      length: 1,
      value: 'I',
    }
  );
  testInterfaceTemplate1.constantPoolCount += 6;
  testInterfaceTemplate1.fields.push(
    {
      accessFlags: FIELD_FLAGS.ACC_PUBLIC,
      nameIndex: 3,
      descriptorIndex: 4,
      attributes: [],
      attributesCount: 0,
    },
    {
      accessFlags: FIELD_FLAGS.ACC_PRIVATE,
      nameIndex: 5,
      descriptorIndex: 6,
      attributes: [],
      attributesCount: 0,
    },
    {
      accessFlags: FIELD_FLAGS.ACC_STATIC,
      nameIndex: 7,
      descriptorIndex: 8,
      attributes: [],
      attributesCount: 0,
    }
  );
  testInterfaceTemplate1.fieldsCount = 3;

  testInterfaceTemplate2.constantPool.push(
    // field #3
    {
      tag: CONSTANT_TAG.Utf8,
      length: 8,
      value: 'interfaceField',
    },
    {
      tag: CONSTANT_TAG.Utf8,
      length: 1,
      value: 'I',
    },
    // field #5
    {
      tag: CONSTANT_TAG.Utf8,
      length: 8,
      value: 'privateInterfaceField',
    },
    {
      tag: CONSTANT_TAG.Utf8,
      length: 1,
      value: 'I',
    },
    // field #7
    {
      tag: CONSTANT_TAG.Utf8,
      length: 8,
      value: 'staticInterfaceField',
    },
    {
      tag: CONSTANT_TAG.Utf8,
      length: 1,
      value: 'I',
    }
  );
  testInterfaceTemplate2.constantPoolCount += 6;
  testInterfaceTemplate2.fields.push(
    {
      accessFlags: FIELD_FLAGS.ACC_PUBLIC,
      nameIndex: 3,
      descriptorIndex: 4,
      attributes: [],
      attributesCount: 0,
    },
    {
      accessFlags: FIELD_FLAGS.ACC_PRIVATE,
      nameIndex: 5,
      descriptorIndex: 6,
      attributes: [],
      attributesCount: 0,
    },
    {
      accessFlags: FIELD_FLAGS.ACC_STATIC,
      nameIndex: 7,
      descriptorIndex: 8,
      attributes: [],
      attributesCount: 0,
    }
  );
  testInterfaceTemplate2.fieldsCount = 3;

  testClassTemplate.constantPool.push(
    // field #9
    {
      tag: CONSTANT_TAG.Utf8,
      length: 8,
      value: 'pubField',
    },
    {
      tag: CONSTANT_TAG.Utf8,
      length: 1,
      value: 'I',
    },
    // field #11
    {
      tag: CONSTANT_TAG.Utf8,
      length: 9,
      value: 'privField',
    },
    {
      tag: CONSTANT_TAG.Utf8,
      length: 1,
      value: 'I',
    },
    // field #13
    {
      tag: CONSTANT_TAG.Utf8,
      length: 9,
      value: 'staticField',
    },
    {
      tag: CONSTANT_TAG.Utf8,
      length: 1,
      value: 'I',
    }
  );
  testClassTemplate.constantPoolCount += 6;
  testClassTemplate.fields.push(
    {
      accessFlags: FIELD_FLAGS.ACC_PUBLIC,
      nameIndex: 9,
      descriptorIndex: 10,
      attributes: [],
      attributesCount: 0,
    },
    {
      accessFlags: FIELD_FLAGS.ACC_PRIVATE,
      nameIndex: 11,
      descriptorIndex: 12,
      attributes: [],
      attributesCount: 0,
    },
    {
      accessFlags: FIELD_FLAGS.ACC_STATIC,
      nameIndex: 13,
      descriptorIndex: 14,
      attributes: [],
      attributesCount: 0,
    }
  );
  testClassTemplate.fieldsCount = 2;
};

const populateMethods = () => {
  testClassTemplate.constantPool.push(
    {
      tag: CONSTANT_TAG.Utf8,
      length: 8,
      value: 'test',
    },
    {
      tag: CONSTANT_TAG.Utf8,
      length: 3,
      value: '()Ljava/lang/String;',
    }
  );
  testClassTemplate.constantPoolCount += 2;
  testClassTemplate.methods.push({
    accessFlags: 0,
    nameIndex: 9,
    descriptorIndex: 10,
    attributes: [],
    attributesCount: 0,
  });
  testClassTemplate.methodsCount = 1;

  testSuperClassTemplate.constantPool.push(
    {
      tag: CONSTANT_TAG.Utf8,
      length: 8,
      value: 'test',
    },
    {
      tag: CONSTANT_TAG.Utf8,
      length: 3,
      value: '()Ljava/lang/String;',
    }
  );
  testSuperClassTemplate.constantPoolCount += 2;
  testSuperClassTemplate.methods.push({
    accessFlags: 0,
    nameIndex: 3,
    descriptorIndex: 4,
    attributes: [],
    attributesCount: 0,
  });
  testSuperClassTemplate.methodsCount = 1;

  testInterfaceTemplate1.constantPool.push(
    {
      tag: CONSTANT_TAG.Utf8,
      length: 8,
      value: 'test',
    },
    {
      tag: CONSTANT_TAG.Utf8,
      length: 3,
      value: '()Ljava/lang/String;',
    }
  );
  testInterfaceTemplate1.constantPoolCount += 2;
  testInterfaceTemplate1.methods.push({
    accessFlags: 0,
    nameIndex: 3,
    descriptorIndex: 4,
    attributes: [],
    attributesCount: 0,
  });
  testInterfaceTemplate1.methodsCount = 1;

  testInterfaceTemplate2.constantPool.push(
    {
      tag: CONSTANT_TAG.Utf8,
      length: 8,
      value: 'test',
    },
    {
      tag: CONSTANT_TAG.Utf8,
      length: 3,
      value: '()Ljava/lang/String;',
    }
  );
  testInterfaceTemplate2.constantPoolCount += 2;
  testInterfaceTemplate2.methods.push({
    accessFlags: 0,
    nameIndex: 3,
    descriptorIndex: 4,
    attributes: [],
    attributesCount: 0,
  });
};

describe('Classdata', () => {
  test('Classdata: flags OK', () => {
    const scd = (
      bscl.defineClass(
        testSuperClassTemplate
      ) as SuccessResult<ReferenceClassData>
    ).result;
    expect(scd.checkPublic()).toBe(false);
    expect(scd.checkFinal()).toBe(false);
    expect(scd.checkSuper()).toBe(false);
    expect(scd.checkInterface()).toBe(false);
    expect(scd.checkAbstract()).toBe(false);
    expect(scd.checkSynthetic()).toBe(false);
    expect(scd.checkAnnotation()).toBe(false);
    expect(scd.checkEnum()).toBe(false);
    expect(scd.checkModule()).toBe(false);

    bscl.defineClass(testInterfaceTemplate1);
    bscl.defineClass(testInterfaceTemplate2);

    testClassTemplate.accessFlags =
      ACCESS_FLAGS.ACC_PUBLIC |
      ACCESS_FLAGS.ACC_FINAL |
      ACCESS_FLAGS.ACC_SUPER |
      ACCESS_FLAGS.ACC_INTERFACE |
      ACCESS_FLAGS.ACC_ABSTRACT |
      ACCESS_FLAGS.ACC_SYNTHETIC |
      ACCESS_FLAGS.ACC_ANNOTATION |
      ACCESS_FLAGS.ACC_ABSTRACT |
      ACCESS_FLAGS.ACC_ENUM |
      ACCESS_FLAGS.ACC_MODULE;
    const cd = (
      bscl.defineClass(testClassTemplate) as SuccessResult<ReferenceClassData>
    ).result;

    expect(cd.checkPublic()).toBe(true);
    expect(cd.checkFinal()).toBe(true);
    expect(cd.checkSuper()).toBe(true);
    expect(cd.checkInterface()).toBe(true);
    expect(cd.checkAbstract()).toBe(true);
    expect(cd.checkSynthetic()).toBe(true);
    expect(cd.checkAnnotation()).toBe(true);
    expect(cd.checkEnum()).toBe(true);
    expect(cd.checkModule()).toBe(true);
    expect(cd.getAccessFlags()).toBe(testClassTemplate.accessFlags);
  });

  test('Classdata: get names OK', () => {
    (testSuperClassTemplate.constantPool[2] as any).value = 'package/sub/Super';
    const scd = (
      bscl.defineClass(
        testSuperClassTemplate
      ) as SuccessResult<ReferenceClassData>
    ).result;
    const i1 = (
      bscl.defineClass(
        testInterfaceTemplate1
      ) as SuccessResult<ReferenceClassData>
    ).result;
    expect(scd.getPackageName()).toBe('package/sub');
    expect(scd.getName()).toBe('package/sub/Super');
    expect(i1.getPackageName()).toBe('');
    expect(i1.getName()).toBe('Interface1');
  });

  test('Classdata: get superclass and interfaces OK', () => {
    const scd = (
      bscl.defineClass(
        testSuperClassTemplate
      ) as SuccessResult<ReferenceClassData>
    ).result;
    const i1 = (
      bscl.defineClass(
        testInterfaceTemplate1
      ) as SuccessResult<ReferenceClassData>
    ).result;
    const i2 = (
      bscl.defineClass(
        testInterfaceTemplate2
      ) as SuccessResult<ReferenceClassData>
    ).result;
    const cd = (
      bscl.defineClass(testClassTemplate) as SuccessResult<ReferenceClassData>
    ).result;

    expect(cd.getSuperClass()).toBe(scd);
    expect(scd.getSuperClass()).toBe(null);
    expect(scd.getInterfaces().length).toBe(0);
    expect(cd.getInterfaces().indexOf(i1)).toBeGreaterThan(-1);
    expect(cd.getInterfaces().indexOf(i2)).toBeGreaterThan(-1);
  });

  test('Classdata: get declared fields OK', () => {
    populateFields();
    bscl.defineClass(testSuperClassTemplate);
    bscl.defineClass(testInterfaceTemplate1);
    bscl.defineClass(testInterfaceTemplate2);
    const cd = (
      bscl.defineClass(testClassTemplate) as SuccessResult<ReferenceClassData>
    ).result;
    const declaredFields = cd.getDeclaredFields();
    expect(declaredFields.length).toBe(3);
    expect(
      declaredFields.map(x => x.getName()).indexOf('pubField')
    ).toBeGreaterThan(-1);
    expect(
      declaredFields.map(x => x.getName()).indexOf('privField')
    ).toBeGreaterThan(-1);
    expect(
      declaredFields.map(x => x.getName()).indexOf('staticField')
    ).toBeGreaterThan(-1);
  });

  test('Classdata: get instance fields OK', () => {
    populateFields();
    bscl.defineClass(testSuperClassTemplate);
    bscl.defineClass(testInterfaceTemplate1);
    bscl.defineClass(testInterfaceTemplate2);
    const cd = (
      bscl.defineClass(testClassTemplate) as SuccessResult<ReferenceClassData>
    ).result;
    const instanceFields = cd.getInstanceFields();
    expect(instanceFields['Test.pubFieldI']).toBeDefined();
    expect(instanceFields['Test.privFieldI']).toBeDefined();
    expect(instanceFields['Test.staticFieldI']).toBeUndefined();
    expect(instanceFields['Super.superFieldI']).toBeDefined();
    expect(instanceFields['Super.privateSuperFieldI']).toBeDefined();
    expect(instanceFields['Super.staticSuperFieldI']).toBeUndefined();
    expect(instanceFields['Interface1.interfaceFieldI']).toBeDefined();
    expect(instanceFields['Interface1.privateInterfaceFieldI']).toBeDefined();
    expect(instanceFields['Interface1.staticInterfaceFieldI']).toBeUndefined();
    expect(instanceFields['Interface2.interfaceFieldI']).toBeDefined();
    expect(instanceFields['Interface2.privateInterfaceFieldI']).toBeDefined();
    expect(instanceFields['Interface2.staticInterfaceFieldI']).toBeUndefined();
  });

  test('Classdata: resolve method OK', () => {
    populateMethods();
    bscl.defineClass(testSuperClassTemplate);
    bscl.defineClass(testInterfaceTemplate1);
    bscl.defineClass(testInterfaceTemplate2);
    const cd = (
      bscl.defineClass(testClassTemplate) as SuccessResult<ReferenceClassData>
    ).result;
    const resolutionResult = cd.resolveMethod(
      'test',
      '()Ljava/lang/String;',
      cd
    );
    expect(checkSuccess(resolutionResult)).toBe(true);
    const resolvedMethod = (resolutionResult as SuccessResult<Method>).result;
    expect(resolvedMethod.getName()).toBe('test');
    expect(resolvedMethod.getDescriptor()).toBe('()Ljava/lang/String;');
    expect(resolvedMethod.getClass()).toBe(cd);
  });

  test('Classdata: resolve superclass method OK', () => {
    populateMethods();
    (testClassTemplate.constantPool[9] as any).value = '_';
    const scd = (
      bscl.defineClass(
        testSuperClassTemplate
      ) as SuccessResult<ReferenceClassData>
    ).result;
    bscl.defineClass(testInterfaceTemplate1);
    bscl.defineClass(testInterfaceTemplate2);
    const cd = (
      bscl.defineClass(testClassTemplate) as SuccessResult<ReferenceClassData>
    ).result;
    const resolutionResult = cd.resolveMethod(
      'test',
      '()Ljava/lang/String;',
      cd
    );
    expect(checkSuccess(resolutionResult)).toBe(true);
    const resolvedMethod = (resolutionResult as SuccessResult<Method>).result;
    expect(resolvedMethod.getName()).toBe('test');
    expect(resolvedMethod.getDescriptor()).toBe('()Ljava/lang/String;');
    expect(resolvedMethod.getClass()).toBe(scd);
  });

  test('Classdata: resolve interface method OK', () => {
    populateMethods();
    (testClassTemplate.constantPool[9] as any).value = '_';
    (testSuperClassTemplate.constantPool[3] as any).value = '_';
    testInterfaceTemplate1.methods[0].accessFlags = ACCESS_FLAGS.ACC_ABSTRACT;
    bscl.defineClass(testSuperClassTemplate);
    const icd = (
      bscl.defineClass(
        testInterfaceTemplate2
      ) as SuccessResult<ReferenceClassData>
    ).result;
    bscl.defineClass(testInterfaceTemplate1);
    const cd = (
      bscl.defineClass(testClassTemplate) as SuccessResult<ReferenceClassData>
    ).result;
    const resolutionResult = cd.resolveMethod(
      'test',
      '()Ljava/lang/String;',
      cd
    );
    expect(checkSuccess(resolutionResult)).toBe(true);
    const resolvedMethod = (resolutionResult as SuccessResult<Method>).result;
    expect(resolvedMethod.getName()).toBe('test');
    expect(resolvedMethod.getDescriptor()).toBe('()Ljava/lang/String;');
    expect(resolvedMethod.getClass()).toBe(icd);
  });

  test('Classdata: resolve method not found', () => {
    bscl.defineClass(testSuperClassTemplate);
    bscl.defineClass(testInterfaceTemplate1);
    bscl.defineClass(testInterfaceTemplate2);
    const cd = (
      bscl.defineClass(testClassTemplate) as SuccessResult<ReferenceClassData>
    ).result;
    const resolutionResult = cd.resolveMethod('_', '()Ljava/lang/String;', cd);
    expect(checkError(resolutionResult)).toBe(true);
    expect((resolutionResult as any).exceptionCls).toBe(
      'java/lang/NoSuchMethodError'
    );
  });

  test('Classdata: resolve interface method abstract OK', () => {
    populateMethods();
    (testClassTemplate.constantPool[9] as any).value = '_';
    (testSuperClassTemplate.constantPool[3] as any).value = '_';
    testInterfaceTemplate1.methods[0].accessFlags = ACCESS_FLAGS.ACC_ABSTRACT;
    testInterfaceTemplate2.methods[0].accessFlags = ACCESS_FLAGS.ACC_ABSTRACT;
    bscl.defineClass(testSuperClassTemplate);
    bscl.defineClass(testInterfaceTemplate1);
    bscl.defineClass(testInterfaceTemplate2);
    const cd = (
      bscl.defineClass(testClassTemplate) as SuccessResult<ReferenceClassData>
    ).result;
    const resolutionResult = cd.resolveMethod(
      'test',
      '()Ljava/lang/String;',
      cd
    );
    expect(checkSuccess(resolutionResult)).toBe(true);
    const resolvedMethod = (resolutionResult as SuccessResult<Method>).result;
    expect(resolvedMethod.getName()).toBe('test');
    expect(resolvedMethod.getDescriptor()).toBe('()Ljava/lang/String;');
    expect(resolvedMethod.checkAbstract()).toBe(true);
  });
});
