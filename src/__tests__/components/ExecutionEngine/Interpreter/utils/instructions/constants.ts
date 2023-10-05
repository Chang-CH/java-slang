import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import { tryInitialize } from '#jvm/components/ExecutionEngine/Interpreter/utils';
import runInstruction from '#jvm/components/ExecutionEngine/Interpreter/utils/runInstruction';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import { JNI } from '#jvm/components/JNI';
import {
  ClassRef,
  ConstantClass,
  ConstantMethodref,
  ConstantString,
} from '#types/ConstantRef';
import { JavaReference } from '#types/dataTypes';
import JsSystem from '#utils/JsSystem';
import { initString } from '#jvm/components/JNI/utils';
import {
  ConstantClassInfo,
  ConstantStringInfo,
  ConstantUtf8Info,
} from '#jvm/external/ClassFile/types/constants';
import { CodeAttribute } from '#jvm/external/ClassFile/types/attributes';

let thread: NativeThread;
let threadClass: ClassRef;
let code: DataView;
let jni: JNI;

beforeEach(() => {
  jni = new JNI();
  const nativeSystem = new JsSystem({});

  const bscl = new BootstrapClassLoader(nativeSystem, 'natives');
  bscl.load('java/lang/Thread');

  threadClass = bscl.resolveClass(thread, 'java/lang/Thread') as ClassRef;
  const javaThread = new JavaReference(threadClass, {});
  thread = new NativeThread(threadClass, javaThread);
  const method = threadClass.getMethod(thread, '<init>()V');
  code = (method.code as CodeAttribute).code;
  thread.pushStackFrame({
    operandStack: [],
    locals: [],
    class: threadClass,
    method,
    pc: 0,
  });
});

describe('runNop', () => {
  test('does not modify stack', () => {
    code.setUint8(0, OPCODE.NOP);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runAconstNull', () => {
  test('pushes null to stack', () => {
    code.setUint8(0, OPCODE.ACONST_NULL);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(null);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runIconstM1', () => {
  test('pushes -1 to stack', () => {
    code.setUint8(0, OPCODE.ICONST_M1);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runIconst0', () => {
  test('pushes 0 to stack', () => {
    code.setUint8(0, OPCODE.ICONST_0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runIconst1', () => {
  test('pushes 1 to stack', () => {
    code.setUint8(0, OPCODE.ICONST_1);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runIconst2', () => {
  test('pushes 2 to stack', () => {
    code.setUint8(0, OPCODE.ICONST_2);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(2);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runIconst3', () => {
  test('pushes 3 to stack', () => {
    code.setUint8(0, OPCODE.ICONST_3);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(3);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runIconst4', () => {
  test('pushes 4 to stack', () => {
    code.setUint8(0, OPCODE.ICONST_4);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(4);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runIconst5', () => {
  test('pushes 5 to stack', () => {
    code.setUint8(0, OPCODE.ICONST_5);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(5);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runLconst0', () => {
  test('pushes long 0 to stack', () => {
    code.setUint8(0, OPCODE.LCONST_0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(0n);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runLconst1', () => {
  test('pushes long 1 to stack', () => {
    code.setUint8(0, OPCODE.LCONST_1);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1n);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runFconst0', () => {
  test('pushes float 0 to stack', () => {
    code.setUint8(0, OPCODE.FCONST_0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(0.0));
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runFconst1', () => {
  test('pushes float 1 to stack', () => {
    code.setUint8(0, OPCODE.FCONST_1);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(1.0));
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runFconst2', () => {
  test('pushes float 2 to stack', () => {
    code.setUint8(0, OPCODE.FCONST_2);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(2.0));
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runDconst0', () => {
  test('pushes double 0 to stack', () => {
    code.setUint8(0, OPCODE.DCONST_0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(0.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runDconst1', () => {
  test('pushes double 1 to stack', () => {
    code.setUint8(0, OPCODE.DCONST_1);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(1);
  });
});

describe('runBipush', () => {
  test('pushes byte to stack', () => {
    code.setUint8(0, OPCODE.BIPUSH);
    code.setInt8(1, 128);
    runInstruction(thread, jni, () => {});
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-128);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(2);
  });
});

describe('runSipush', () => {
  test('pushes short to stack', () => {
    code.setUint8(0, OPCODE.SIPUSH);
    code.setInt16(1, 32768);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-32768);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });
});

describe('runLdc', () => {
  test('reads int from constant pool and pushes to stack', () => {
    const intConstant = {
      tag: CONSTANT_TAG.Integer,
      value: -99,
    };
    (threadClass as any).constantPool[0] = intConstant;
    code.setUint8(0, OPCODE.LDC);
    code.setUint8(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-99);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(2);
  });

  test('reads float from constant pool and pushes to stack', () => {
    const intConstant = {
      tag: CONSTANT_TAG.Float,
      value: Math.fround(-0.3),
    };
    (threadClass as any).constantPool[0] = intConstant;
    code.setUint8(0, OPCODE.LDC);
    code.setUint8(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(-0.3));
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(2);
  });

  test('reads string from constant pool and pushes to stack', () => {
    tryInitialize(thread, 'java/lang/String');
    const strClass = thread
      .getClass()
      .getLoader()
      .resolveClass(thread, 'java/lang/String') as ClassRef;
    const strRef = initString(strClass, 'hello world');
    const strConstant = {
      tag: CONSTANT_TAG.String,
      ref: strRef,
      stringIndex: 0,
    } as ConstantString;
    (threadClass as any).constantPool[0] = strConstant;

    code.setUint8(0, OPCODE.LDC);
    code.setUint8(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(strRef); // string literals should be same object
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(2);
  });

  test('initializes uninitialized string from constant pool', () => {
    tryInitialize(thread, 'java/lang/String');
    const strConstant = {
      tag: CONSTANT_TAG.String,
      stringIndex: 1,
    } as ConstantStringInfo;
    const strContent = {
      tag: CONSTANT_TAG.Utf8,
      value: 'hello world',
    } as ConstantUtf8Info;
    (threadClass as any).constantPool[0] = strConstant;
    (threadClass as any).constantPool[1] = strContent;

    code.setUint8(0, OPCODE.LDC);
    code.setUint8(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe((strConstant as ConstantString).ref); // string literals should be same object
    expect(lastFrame.operandStack[0]).toBeDefined();
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(2);
  });

  test('reads classref from constant pool and pushes to stack', () => {
    const clsRef = thread.getClass();
    const classRef = {
      tag: CONSTANT_TAG.Class,
      nameIndex: 1,
      ref: clsRef,
    } as ConstantClass;
    (threadClass as any).constantPool[0] = classRef;

    code.setUint8(0, OPCODE.LDC);
    code.setUint8(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(clsRef);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(2);
  });

  test('initializes uninitialized class from constant pool', () => {
    const classRef = {
      tag: CONSTANT_TAG.Class,
      nameIndex: 1,
    } as ConstantClassInfo;
    const className = {
      tag: CONSTANT_TAG.Utf8,
      value: 'java/lang/Thread',
    } as ConstantUtf8Info;
    (threadClass as any).constantPool[0] = classRef;
    (threadClass as any).constantPool[1] = className;

    code.setUint8(0, OPCODE.LDC);
    code.setUint8(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe((classRef as ConstantClass).ref);
    expect(lastFrame.operandStack[0]).toBeDefined();
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(2);
  });

  test('reads methodRef from constant pool and pushes to stack', () => {
    const methodRef = thread.getClass().getMethod(thread, '<init>()V');
    const constMethod = {
      tag: CONSTANT_TAG.Methodref,
      classIndex: 1,
      nameAndTypeIndex: 1,
      ref: methodRef,
    } as ConstantMethodref;
    (threadClass as any).constantPool[0] = constMethod;

    code.setUint8(0, OPCODE.LDC);
    code.setUint8(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(methodRef);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(2);
  });

  test('initializes uninitialized method from constant pool', () => {
    (threadClass as any).constantPool[0] = {
      tag: CONSTANT_TAG.Methodref,
      classIndex: 1,
      nameAndTypeIndex: 3,
    };
    (threadClass as any).constantPool[1] = {
      tag: CONSTANT_TAG.Class,
      nameIndex: 2,
    };
    (threadClass as any).constantPool[2] = {
      tag: CONSTANT_TAG.Utf8,
      value: 'java/lang/Thread',
      length: 30,
    };
    (threadClass as any).constantPool[3] = {
      tag: CONSTANT_TAG.NameAndType,
      nameIndex: 4,
      descriptorIndex: 5,
    };
    (threadClass as any).constantPool[4] = {
      tag: CONSTANT_TAG.Utf8,
      value: '<init>',
      length: 30,
    };
    (threadClass as any).constantPool[5] = {
      tag: CONSTANT_TAG.Utf8,
      value: '()V',
      length: 30,
    };

    code.setUint8(0, OPCODE.LDC);
    code.setUint8(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(
      ((threadClass as any).constantPool[0] as ConstantMethodref).ref
    );
    expect(lastFrame.operandStack[0]).toBeDefined();
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(2);
  });
});

describe('runLdcW', () => {
  test('reads int from constant pool and pushes to stack', () => {
    const intConstant = {
      tag: CONSTANT_TAG.Integer,
      value: -99,
    };
    (threadClass as any).constantPool[0] = intConstant;
    code.setUint8(0, OPCODE.LDC);
    code.setUint16(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-99);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('reads float from constant pool and pushes to stack', () => {
    const intConstant = {
      tag: CONSTANT_TAG.Float,
      value: Math.fround(-0.3),
    };
    (threadClass as any).constantPool[0] = intConstant;
    code.setUint8(0, OPCODE.LDC);
    code.setUint16(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(-0.3));
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('reads string from constant pool and pushes to stack', () => {
    tryInitialize(thread, 'java/lang/String');
    const strClass = thread
      .getClass()
      .getLoader()
      .resolveClass(thread, 'java/lang/String');
    const strRef = initString(strClass, 'hello world');
    const strConstant = {
      tag: CONSTANT_TAG.String,
      ref: strRef,
      stringIndex: 0,
    } as ConstantString;
    (threadClass as any).constantPool[0] = strConstant;

    code.setUint8(0, OPCODE.LDC);
    code.setUint16(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(strRef); // string literals should be same object
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('initializes uninitialized string from constant pool', () => {
    tryInitialize(thread, 'java/lang/String');
    const strConstant = {
      tag: CONSTANT_TAG.String,
      stringIndex: 1,
    } as ConstantStringInfo;
    const strContent = {
      tag: CONSTANT_TAG.Utf8,
      value: 'hello world',
    } as ConstantUtf8Info;
    (threadClass as any).constantPool[0] = strConstant;
    (threadClass as any).constantPool[1] = strContent;

    code.setUint8(0, OPCODE.LDC);
    code.setUint16(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe((strConstant as ConstantString).ref); // string literals should be same object
    expect(lastFrame.operandStack[0]).toBeDefined();
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('reads classref from constant pool and pushes to stack', () => {
    const clsRef = thread.getClass();
    const classRef = {
      tag: CONSTANT_TAG.Class,
      nameIndex: 1,
      ref: clsRef,
    } as ConstantClass;
    (threadClass as any).constantPool[0] = classRef;

    code.setUint8(0, OPCODE.LDC);
    code.setUint16(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(clsRef);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('initializes uninitialized class from constant pool', () => {
    const classRef = {
      tag: CONSTANT_TAG.Class,
      nameIndex: 1,
    } as ConstantClassInfo;
    const className = {
      tag: CONSTANT_TAG.Utf8,
      value: 'java/lang/Thread',
    } as ConstantUtf8Info;
    (threadClass as any).constantPool[0] = classRef;
    (threadClass as any).constantPool[1] = className;

    code.setUint8(0, OPCODE.LDC);
    code.setUint16(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe((classRef as ConstantClass).ref);
    expect(lastFrame.operandStack[0]).toBeDefined();
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('reads methodRef from constant pool and pushes to stack', () => {
    const methodRef = thread.getClass().getMethod(thread, '<init>()V');
    const constMethod = {
      tag: CONSTANT_TAG.Methodref,
      classIndex: 99,
      nameAndTypeIndex: 99,
      ref: methodRef,
    } as ConstantMethodref;
    (threadClass as any).constantPool[0] = constMethod;
    code.setUint8(0, OPCODE.LDC);
    code.setUint16(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(methodRef);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('initializes uninitialized method from constant pool', () => {
    (threadClass as any).constantPool[0] = {
      tag: CONSTANT_TAG.Methodref,
      classIndex: 1,
      nameAndTypeIndex: 3,
    };
    (threadClass as any).constantPool[1] = {
      tag: CONSTANT_TAG.Class,
      nameIndex: 2,
    };
    (threadClass as any).constantPool[2] = {
      tag: CONSTANT_TAG.Utf8,
      value: 'java/lang/Thread',
      length: 30,
    };
    (threadClass as any).constantPool[3] = {
      tag: CONSTANT_TAG.NameAndType,
      nameIndex: 4,
      descriptorIndex: 5,
    };
    (threadClass as any).constantPool[4] = {
      tag: CONSTANT_TAG.Utf8,
      value: '<init>',
      length: 30,
    };
    (threadClass as any).constantPool[5] = {
      tag: CONSTANT_TAG.Utf8,
      value: '()V',
      length: 30,
    };

    code.setUint8(0, OPCODE.LDC);
    code.setUint16(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(
      ((threadClass as any).constantPool[0] as ConstantMethodref).ref
    );
    expect(lastFrame.operandStack[0]).toBeDefined();
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });
});

describe('runLdc2W', () => {
  test('reads long from constant pool and pushes to stack', () => {
    const longConstant = {
      tag: CONSTANT_TAG.Long,
      value: 99n,
    };
    (threadClass as any).constantPool[0] = longConstant;
    code.setUint8(0, OPCODE.LDC2_W);
    code.setUint16(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(99n);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });

  test('reads double from constant pool and pushes to stack', () => {
    const intConstant = {
      tag: CONSTANT_TAG.Double,
      value: -0.3,
    };
    (threadClass as any).constantPool[0] = intConstant;
    code.setUint8(0, OPCODE.LDC2_W);
    code.setUint16(1, 0);
    runInstruction(thread, jni, () => {});

    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-0.3);
    expect(lastFrame.locals.length).toBe(0);
    expect(thread.getPC()).toBe(3);
  });
});
