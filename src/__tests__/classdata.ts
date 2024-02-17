import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import Monitor from '#jvm/components/monitor';
import Thread from '#jvm/components/thread';
import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { ACCESS_FLAGS, ClassFile } from '#jvm/external/ClassFile/types';
import { SuccessResult, checkError, checkSuccess } from '#types/Result';
import { ReferenceClassData } from '#types/class/ClassData';
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
  // threadClass = testLoader.createClass({
  //   className: 'java/lang/Thread',
  //   loader: testLoader,
  // }) as ReferenceClassData;
  // tpool = new TestThreadPool(() => {});
  // thread = new TestThread(threadClass, null as any, tpool);
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

  test('Classdata: resolve OK', () => {
    bscl.defineClass(testSuperClassTemplate);
    bscl.defineClass(testInterfaceTemplate1);
    bscl.defineClass(testInterfaceTemplate2);

    const cd = (
      bscl.defineClass(testClassTemplate) as SuccessResult<ReferenceClassData>
    ).result;

    const resolveResult = cd.resolveClass('Super');
    expect(checkSuccess(resolveResult)).toBe(true);
  });

  test('Classdata: resolve non public', () => {
    bscl.defineClass(testSuperClassTemplate);
    bscl.defineClass(testInterfaceTemplate1);
    bscl.defineClass(testInterfaceTemplate2);
    const cd = (
      bscl.defineClass(testClassTemplate) as SuccessResult<ReferenceClassData>
    ).result;

    (testInterfaceTemplate1.constantPool[2] as any).value =
      'Package/Interface1';
    bscl.defineClass(testInterfaceTemplate1);

    const resolveResult = cd.resolveClass('Package/Interface1');
    expect(checkError(resolveResult)).toBe(true);
    expect((resolveResult as any).exceptionCls).toBe(
      'java/lang/IllegalAccessError'
    );
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
    expect(cd.getInterfaces().indexOf(i1)).toBeGreaterThan(-1);
    expect(cd.getInterfaces().indexOf(i2)).toBeGreaterThan(-1);
  });
});
