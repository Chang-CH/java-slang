import { JNI } from '#jvm/components/jni';
import { ThreadStatus } from '#jvm/constants';
import { SuccessResult, checkSuccess } from '#types/Result';
import { ReferenceClassData } from '#types/class/ClassData';
import {
  TestSystem,
  TestClassLoader,
  TestThread,
  TestJVM,
  TestThreadPool,
} from '../__utils__/test-utility';

const callback = jest.fn();
let threadClass: ReferenceClassData;
let testSystem: TestSystem;
let testLoader: TestClassLoader;

beforeEach(() => {
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
});

describe('JNI', () => {
  test('JNI: get stdlib implementation', () => {
    const jni = new JNI({
      'test/Test': {
        loader: () => {},
        methods: {
          'stdrun()V': callback,
        },
        blocking: [],
      },
    });
    const tPool = new TestThreadPool(() => {});
    const jvm = new TestJVM(testSystem, testLoader, jni);
    const thread = new TestThread(
      threadClass as ReferenceClassData,
      jvm,
      tPool
    );

    const getResult = jni.getNativeMethod(thread, 'test/Test', 'stdrun()V');
    expect(checkSuccess(getResult)).toBe(true);
    (getResult as SuccessResult<any>).result(thread, []);
    expect(callback).toHaveBeenCalled();
  });

  test('JNI: async loading sets thread to waiting', () => {
    const jni = new JNI({
      'test/Test': {
        loader: (cb: (lib: any) => void) => {},
      },
    });
    const tPool = new TestThreadPool(() => {});
    const jvm = new TestJVM(testSystem, testLoader, jni);
    const thread = new TestThread(
      threadClass as ReferenceClassData,
      jvm,
      tPool
    );

    jni.getNativeMethod(thread, 'test/Test', 'stdrun()V');
    expect(thread.getStatus()).toBe(ThreadStatus.WAITING);
  });

  test('JNI: async loading sets thread to runnable on load end', () => {
    let presolve: (lib: any) => void;
    let asyncMock = new Promise(resolve => {
      presolve = resolve;
    });
    const jni = new JNI({
      'test/Test': {
        loader: (cb: (lib: any) => void) => {
          asyncMock.then(cb);
        },
      },
    });
    const tPool = new TestThreadPool(() => {});
    const jvm = new TestJVM(testSystem, testLoader, jni);
    const thread = new TestThread(
      threadClass as ReferenceClassData,
      jvm,
      tPool
    );
    const thread2 = new TestThread(
      threadClass as ReferenceClassData,
      jvm,
      tPool
    );

    jni.getNativeMethod(thread, 'test/Test', 'stdrun()V');
    expect(thread.getStatus()).toBe(ThreadStatus.WAITING);
    jni.getNativeMethod(thread2, 'test/Test', 'stdrun()V');
    expect(thread2.getStatus()).toBe(ThreadStatus.WAITING);
    asyncMock.then(() => {
      expect(thread.getStatus()).toBe(ThreadStatus.RUNNABLE);
      expect(thread2.getStatus()).toBe(ThreadStatus.RUNNABLE);
    });
    // @ts-ignore
    presolve &&
      presolve({
        'stdrun()V': callback,
      });
  });
});
