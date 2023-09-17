import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import { tryInitialize } from '#jvm/components/ExecutionEngine/Interpreter/utils';
import runInstruction from '#jvm/components/ExecutionEngine/Interpreter/utils/instructions';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import { JNI } from '#jvm/components/JNI';
import { ClassRef } from '#types/ClassRef';
import { JavaReference } from '#types/DataTypes';
import JsSystem from '#utils/JsSystem';
import { initString } from '#jvm/components/JNI/utils';
import {
  ConstantClass,
  ConstantMethodref,
  ConstantString,
} from '#types/ClassRef/constants';
import {
  ConstantClassInfo,
  ConstantStringInfo,
  ConstantUtf8Info,
} from '#jvm/external/ClassFile/types/constants';

let thread: NativeThread;
let threadClass: ClassRef;

beforeEach(() => {
  const jni = new JNI();
  const os = new JsSystem({});

  const bscl = new BootstrapClassLoader(os, 'natives');
  bscl.load(
    'java/lang/Thread',
    () => {},
    e => {
      throw e;
    }
  );

  threadClass = bscl.getClassRef('java/lang/Thread', console.error) as ClassRef;
  const javaThread = new JavaReference(threadClass, {});
  thread = new NativeThread(threadClass, javaThread, {
    operandStack: [],
    locals: [],
    class: threadClass,
    method: threadClass.methods[''],
    pc: 0,
  });
});

describe('runNop', () => {
  test('does not modify stack', () => {
    runInstruction(thread, {
      opcode: OPCODE.NOP,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runAconstNull', () => {
  test('pushes null to stack', () => {
    runInstruction(thread, {
      opcode: OPCODE.ACONSTNULL,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(null);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIconstM1', () => {
  test('pushes -1 to stack', () => {
    runInstruction(thread, {
      opcode: OPCODE.ICONSTM1,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIconst0', () => {
  test('pushes 0 to stack', () => {
    runInstruction(thread, {
      opcode: OPCODE.ICONST0,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIconst1', () => {
  test('pushes 1 to stack', () => {
    runInstruction(thread, {
      opcode: OPCODE.ICONST1,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(1);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIconst2', () => {
  test('pushes 2 to stack', () => {
    runInstruction(thread, {
      opcode: OPCODE.ICONST2,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(2);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIconst3', () => {
  test('pushes 3 to stack', () => {
    runInstruction(thread, {
      opcode: OPCODE.ICONST3,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(3);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIconst4', () => {
  test('pushes 4 to stack', () => {
    runInstruction(thread, {
      opcode: OPCODE.ICONST4,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(4);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runIconst5', () => {
  test('pushes 5 to stack', () => {
    runInstruction(thread, {
      opcode: OPCODE.ICONST5,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(5);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runLconst0', () => {
  test('pushes long 0 to stack', () => {
    runInstruction(thread, {
      opcode: OPCODE.LCONST0,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(0n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runLconst1', () => {
  test('pushes long 1 to stack', () => {
    runInstruction(thread, {
      opcode: OPCODE.LCONST1,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runFconst0', () => {
  test('pushes float 0 to stack', () => {
    runInstruction(thread, {
      opcode: OPCODE.FCONST0,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(0.0));
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runFconst1', () => {
  test('pushes float 1 to stack', () => {
    runInstruction(thread, {
      opcode: OPCODE.FCONST1,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(1.0));
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runFconst2', () => {
  test('pushes float 2 to stack', () => {
    runInstruction(thread, {
      opcode: OPCODE.FCONST2,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(2.0));
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDconst0', () => {
  test('pushes double 0 to stack', () => {
    runInstruction(thread, {
      opcode: OPCODE.DCONST0,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(0.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runDconst1', () => {
  test('pushes double 1 to stack', () => {
    runInstruction(thread, {
      opcode: OPCODE.DCONST1,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(1.0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(1);
  });
});

describe('runBipush', () => {
  test('pushes byte to stack', () => {
    runInstruction(thread, {
      opcode: OPCODE.BIPUSH,
      operands: [0xff],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0xff);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(2);
  });
});

describe('runSipush', () => {
  test('pushes short to stack', () => {
    runInstruction(thread, {
      opcode: OPCODE.SIPUSH,
      operands: [0xffff],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(0xffff);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(3);
  });
});

describe('runLdc', () => {
  test('reads int from constant pool and pushes to stack', () => {
    const intConstant = {
      tag: CONSTANT_TAG.constantInteger,
      value: -99,
    };
    threadClass.constantPool[0] = intConstant;
    runInstruction(thread, {
      opcode: OPCODE.LDC,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-99);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(2);
  });

  test('reads float from constant pool and pushes to stack', () => {
    const intConstant = {
      tag: CONSTANT_TAG.constantFloat,
      value: Math.fround(-0.3),
    };
    threadClass.constantPool[0] = intConstant;
    runInstruction(thread, {
      opcode: OPCODE.LDC,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(-0.3));
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(2);
  });

  test('reads string from constant pool and pushes to stack', () => {
    tryInitialize(thread, 'java/lang/String');
    const strClass = thread
      .getClass()
      .getLoader()
      .getClassRef('java/lang/String', () => {
        throw new Error('java/lang/String not found');
      });
    const strRef = initString(strClass, 'hello world');
    const strConstant = {
      tag: CONSTANT_TAG.constantString,
      ref: strRef,
      stringIndex: 0,
    } as ConstantString;
    threadClass.constantPool[0] = strConstant;

    runInstruction(thread, {
      opcode: OPCODE.LDC,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(strRef); // string literals should be same object
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(2);
  });

  test('initializes uninitialized string from constant pool', () => {
    tryInitialize(thread, 'java/lang/String');
    const strConstant = {
      tag: CONSTANT_TAG.constantString,
      stringIndex: 1,
    } as ConstantStringInfo;
    const strContent = {
      tag: CONSTANT_TAG.constantUtf8,
      value: 'hello world',
    } as ConstantUtf8Info;
    threadClass.constantPool[0] = strConstant;
    threadClass.constantPool[1] = strContent;

    runInstruction(thread, {
      opcode: OPCODE.LDC,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe((strConstant as ConstantString).ref); // string literals should be same object
    expect(lastFrame.operandStack[0]).toBeDefined();
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(2);
  });

  test('reads classref from constant pool and pushes to stack', () => {
    const clsRef = thread.getClass();
    const classRef = {
      tag: CONSTANT_TAG.constantClass,
      nameIndex: 1,
      ref: clsRef,
    } as ConstantClass;
    threadClass.constantPool[0] = classRef;

    runInstruction(thread, {
      opcode: OPCODE.LDC,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(clsRef);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(2);
  });

  test('initializes uninitialized class from constant pool', () => {
    const classRef = {
      tag: CONSTANT_TAG.constantClass,
      nameIndex: 1,
    } as ConstantClassInfo;
    const className = {
      tag: CONSTANT_TAG.constantUtf8,
      value: 'java/lang/Thread',
    } as ConstantUtf8Info;
    threadClass.constantPool[0] = classRef;
    threadClass.constantPool[1] = className;

    runInstruction(thread, {
      opcode: OPCODE.LDC,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe((classRef as ConstantClass).ref);
    expect(lastFrame.operandStack[0]).toBeDefined();
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(2);
  });

  test('reads methodRef from constant pool and pushes to stack', () => {
    const methodRef = thread.getClass().getMethod(thread, '<init>()V');
    const constMethod = {
      tag: CONSTANT_TAG.constantMethodref,
      classIndex: 1,
      nameAndTypeIndex: 1,
      ref: methodRef,
    } as ConstantMethodref;
    threadClass.constantPool[0] = constMethod;

    runInstruction(thread, {
      opcode: OPCODE.LDC,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(methodRef);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(2);
  });

  test('initializes uninitialized method from constant pool', () => {
    threadClass.constantPool[0] = {
      tag: CONSTANT_TAG.constantMethodref,
      classIndex: 1,
      nameAndTypeIndex: 3,
    };
    threadClass.constantPool[1] = {
      tag: CONSTANT_TAG.constantClass,
      nameIndex: 2,
    };
    threadClass.constantPool[2] = {
      tag: CONSTANT_TAG.constantUtf8,
      value: 'java/lang/Thread',
      length: 30,
    };
    threadClass.constantPool[3] = {
      tag: CONSTANT_TAG.constantNameAndType,
      nameIndex: 4,
      descriptorIndex: 5,
    };
    threadClass.constantPool[4] = {
      tag: CONSTANT_TAG.constantUtf8,
      value: '<init>',
      length: 30,
    };
    threadClass.constantPool[5] = {
      tag: CONSTANT_TAG.constantUtf8,
      value: '()V',
      length: 30,
    };

    runInstruction(thread, {
      opcode: OPCODE.LDC,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(
      (threadClass.constantPool[0] as ConstantMethodref).ref
    );
    expect(lastFrame.operandStack[0]).toBeDefined();
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(2);
  });
});

describe('runLdcW', () => {
  test('reads int from constant pool and pushes to stack', () => {
    const intConstant = {
      tag: CONSTANT_TAG.constantInteger,
      value: -99,
    };
    threadClass.constantPool[0] = intConstant;
    runInstruction(thread, {
      opcode: OPCODE.LDCW,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(-99);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(3);
  });

  test('reads float from constant pool and pushes to stack', () => {
    const intConstant = {
      tag: CONSTANT_TAG.constantFloat,
      value: Math.fround(-0.3),
    };
    threadClass.constantPool[0] = intConstant;
    runInstruction(thread, {
      opcode: OPCODE.LDCW,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(Math.fround(-0.3));
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(3);
  });

  test('reads string from constant pool and pushes to stack', () => {
    // TODO: create new helper function, initialize String there.
    // TODO: Constant string should be a string reference object.
    tryInitialize(thread, 'java/lang/String');
    const strClass = thread
      .getClass()
      .getLoader()
      .getClassRef('java/lang/String', () => {
        throw new Error('java/lang/String not found');
      });
    const strRef = initString(strClass, 'hello world');
    const strConstant = {
      tag: CONSTANT_TAG.constantString,
      ref: strRef,
      stringIndex: 0,
    } as ConstantString;
    threadClass.constantPool[0] = strConstant;

    runInstruction(thread, {
      opcode: OPCODE.LDCW,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(strRef); // string literals should be same object
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(3);
  });

  test('initializes uninitialized string from constant pool', () => {
    tryInitialize(thread, 'java/lang/String');
    const strConstant = {
      tag: CONSTANT_TAG.constantString,
      stringIndex: 1,
    } as ConstantStringInfo;
    const strContent = {
      tag: CONSTANT_TAG.constantUtf8,
      value: 'hello world',
    } as ConstantUtf8Info;
    threadClass.constantPool[0] = strConstant;
    threadClass.constantPool[1] = strContent;

    runInstruction(thread, {
      opcode: OPCODE.LDCW,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe((strConstant as ConstantString).ref); // string literals should be same object
    expect(lastFrame.operandStack[0]).toBeDefined();
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(3);
  });

  test('reads classref from constant pool and pushes to stack', () => {
    const clsRef = thread.getClass();
    const classRef = {
      tag: CONSTANT_TAG.constantClass,
      nameIndex: 1,
      ref: clsRef,
    } as ConstantClass;
    threadClass.constantPool[0] = classRef;

    runInstruction(thread, {
      opcode: OPCODE.LDCW,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(clsRef);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(3);
  });

  test('initializes uninitialized class from constant pool', () => {
    const classRef = {
      tag: CONSTANT_TAG.constantClass,
      nameIndex: 1,
    } as ConstantClassInfo;
    const className = {
      tag: CONSTANT_TAG.constantUtf8,
      value: 'java/lang/Thread',
    } as ConstantUtf8Info;
    threadClass.constantPool[0] = classRef;
    threadClass.constantPool[1] = className;

    runInstruction(thread, {
      opcode: OPCODE.LDCW,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe((classRef as ConstantClass).ref);
    expect(lastFrame.operandStack[0]).toBeDefined();
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(3);
  });

  test('reads methodRef from constant pool and pushes to stack', () => {
    const methodRef = thread.getClass().getMethod(thread, '<init>()V');
    const constMethod = {
      tag: CONSTANT_TAG.constantMethodref,
      classIndex: 99,
      nameAndTypeIndex: 99,
      ref: methodRef,
    } as ConstantMethodref;
    threadClass.constantPool[0] = constMethod;
    runInstruction(thread, {
      opcode: OPCODE.LDCW,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(methodRef);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(3);
  });

  test('initializes uninitialized method from constant pool', () => {
    threadClass.constantPool[0] = {
      tag: CONSTANT_TAG.constantMethodref,
      classIndex: 1,
      nameAndTypeIndex: 3,
    };
    threadClass.constantPool[1] = {
      tag: CONSTANT_TAG.constantClass,
      nameIndex: 2,
    };
    threadClass.constantPool[2] = {
      tag: CONSTANT_TAG.constantUtf8,
      value: 'java/lang/Thread',
      length: 30,
    };
    threadClass.constantPool[3] = {
      tag: CONSTANT_TAG.constantNameAndType,
      nameIndex: 4,
      descriptorIndex: 5,
    };
    threadClass.constantPool[4] = {
      tag: CONSTANT_TAG.constantUtf8,
      value: '<init>',
      length: 30,
    };
    threadClass.constantPool[5] = {
      tag: CONSTANT_TAG.constantUtf8,
      value: '()V',
      length: 30,
    };

    runInstruction(thread, {
      opcode: OPCODE.LDCW,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(1);
    expect(lastFrame.operandStack[0]).toBe(
      (threadClass.constantPool[0] as ConstantMethodref).ref
    );
    expect(lastFrame.operandStack[0]).toBeDefined();
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(3);
  });
});

describe('runLdc2W', () => {
  test('reads long from constant pool and pushes to stack', () => {
    const longConstant = {
      tag: CONSTANT_TAG.constantLong,
      value: 99n,
    };
    threadClass.constantPool[0] = longConstant;
    runInstruction(thread, {
      opcode: OPCODE.LDC2W,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(99n);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(3);
  });

  test('reads double from constant pool and pushes to stack', () => {
    const intConstant = {
      tag: CONSTANT_TAG.constantDouble,
      value: -0.3,
    };
    threadClass.constantPool[0] = intConstant;
    runInstruction(thread, {
      opcode: OPCODE.LDC2W,
      operands: [0],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(2);
    expect(lastFrame.operandStack[0]).toBe(-0.3);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(3);
  });
});
