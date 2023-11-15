import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';
import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import runInstruction from '#jvm/components/ExecutionEngine/Interpreter/utils/runInstruction';
import Thread from '#jvm/components/Thread/Thread';
import { JNI } from '#jvm/components/JNI';
import { ClassData } from '#types/class/ClassData';
import { Method } from '#types/class/Method';
import NodeSystem from '#utils/NodeSystem';
import { CodeAttribute } from '#jvm/external/ClassFile/types/attributes';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';
import { SuccessResult } from '#types/result';
import JVM from '#jvm/index';

let thread: Thread;
let threadClass: ClassData;
let bscl: BootstrapClassLoader;
let code: DataView;
let jni: JNI;
let javaThread: JvmObject;

beforeEach(() => {
  jni = new JNI();
  const nativeSystem = new NodeSystem({});
  bscl = new BootstrapClassLoader(nativeSystem, 'natives');

  threadClass = (
    bscl.getClassRef('java/lang/Thread') as SuccessResult<ClassData>
  ).getResult();
  thread = new Thread(threadClass, new JVM(nativeSystem));
  const method = threadClass.getMethod('<init>()V') as Method;
  code = (method._getCode() as CodeAttribute).code;
  thread.invokeSf(threadClass, method, 0, []);
});

describe('Istore', () => {
  test('ISTORE: stores int into locals', () => {
    thread.pushStack(2);
    code.setUint8(0, OPCODE.ISTORE);
    code.setUint8(1, 0);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(2);
    expect(thread.getPC()).toBe(2);
  });
});

describe('Istore0', () => {
  test('ISTORE_0: stores int into locals', () => {
    thread.pushStack(2);
    code.setUint8(0, OPCODE.ISTORE_0);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(2);
    expect(thread.getPC()).toBe(1);
  });
});

describe('Istore1', () => {
  test('ISTORE_1: stores int into locals', () => {
    thread.pushStack(2);
    code.setUint8(0, OPCODE.ISTORE_1);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(1)).toBe(2);
    expect(thread.getPC()).toBe(1);
  });
});

describe('Istore2', () => {
  test('ISTORE_2: stores int into locals', () => {
    thread.pushStack(2);
    code.setUint8(0, OPCODE.ISTORE_2);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(2)).toBe(2);
    expect(thread.getPC()).toBe(1);
  });
});

describe('Istore3', () => {
  test('ISTORE_3: stores int into locals', () => {
    thread.pushStack(3);
    code.setUint8(0, OPCODE.ISTORE_3);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(3)).toBe(3);
    expect(thread.getPC()).toBe(1);
  });
});

describe('Lstore', () => {
  test('LSTORE: stores long into locals', () => {
    thread.pushStack64(3n);
    code.setUint8(0, OPCODE.LSTORE);
    code.setUint8(1, 0);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0) === 3n).toBe(true);
    expect(thread.getPC()).toBe(2);
  });
});

describe('Lstore0', () => {
  test('LSTORE_0: stores long into locals', () => {
    thread.pushStack64(5n);
    code.setUint8(0, OPCODE.LSTORE_0);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0) === 5n).toBe(true);
    expect(thread.getPC()).toBe(1);
  });
});

describe('Lstore1', () => {
  test('LSTORE_1: stores long into locals', () => {
    thread.pushStack64(5n);
    code.setUint8(0, OPCODE.LSTORE_1);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(1) === 5n).toBe(true);
    expect(thread.getPC()).toBe(1);
  });
});

describe('Lstore2', () => {
  test('LSTORE_2: stores long into locals', () => {
    thread.pushStack64(5n);
    code.setUint8(0, OPCODE.LSTORE_2);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(2) === 5n).toBe(true);
    expect(thread.getPC()).toBe(1);
  });
});

describe('Lstore3', () => {
  test('LSTORE_3: stores long into locals', () => {
    thread.pushStack64(5n);
    code.setUint8(0, OPCODE.LSTORE_3);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(3) === 5n).toBe(true);
    expect(thread.getPC()).toBe(1);
  });
});

describe('Fstore', () => {
  test('FSTORE: stores double into locals', () => {
    thread.pushStack(0.5);
    code.setUint8(0, OPCODE.FSTORE);
    code.setUint8(1, 0);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(0.5);
    expect(thread.getPC()).toBe(2);
  });

  test('FSTORE: undergoes value set conversion', () => {
    thread.pushStack(0.3);
    code.setUint8(0, OPCODE.FSTORE);
    code.setUint8(1, 0);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(Math.fround(0.3));
    expect(thread.getPC()).toBe(2);
  });
});

describe('Fstore0', () => {
  test('FSTORE_0: stores float into locals', () => {
    thread.pushStack(0.5);
    code.setUint8(0, OPCODE.FSTORE_0);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(0.5);
    expect(thread.getPC()).toBe(1);
  });

  test('FSTORE_0: undergoes value set conversion', () => {
    thread.pushStack(0.3);
    code.setUint8(0, OPCODE.FSTORE_0);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(Math.fround(0.3));
    expect(thread.getPC()).toBe(1);
  });
});

describe('Fstore1', () => {
  test('FSTORE_1: stores float into locals', () => {
    thread.pushStack(0.5);
    code.setUint8(0, OPCODE.FSTORE_1);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(1)).toBe(0.5);
    expect(thread.getPC()).toBe(1);
  });

  test('FSTORE_1: undergoes value set conversion', () => {
    thread.pushStack(0.3);
    code.setUint8(0, OPCODE.FSTORE_1);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(1)).toBe(Math.fround(0.3));
    expect(thread.getPC()).toBe(1);
  });
});

describe('Fstore2', () => {
  test('FSTORE_2: stores float into locals', () => {
    thread.pushStack(0.5);
    code.setUint8(0, OPCODE.FSTORE_2);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(2)).toBe(0.5);
    expect(thread.getPC()).toBe(1);
  });

  test('FSTORE_2: undergoes value set conversion', () => {
    thread.pushStack(0.3);
    code.setUint8(0, OPCODE.FSTORE_2);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(2)).toBe(Math.fround(0.3));
    expect(thread.getPC()).toBe(1);
  });
});

describe('Fstore3', () => {
  test('FSTORE_3: stores float into locals', () => {
    thread.pushStack(0.5);
    code.setUint8(0, OPCODE.FSTORE_3);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(3)).toBe(0.5);
    expect(thread.getPC()).toBe(1);
  });

  test('FSTORE_3: undergoes value set conversion', () => {
    thread.pushStack(0.3);
    code.setUint8(0, OPCODE.FSTORE_3);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(3)).toBe(Math.fround(0.3));
    expect(thread.getPC()).toBe(1);
  });
});

describe('Dstore', () => {
  test('DSTORE: stores double into locals', () => {
    thread.pushStack64(0.5);
    code.setUint8(0, OPCODE.DSTORE);
    code.setUint8(1, 0);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(0.5);
    expect(thread.getPC()).toBe(2);
  });

  test('DSTORE: undergoes value set conversion', () => {
    thread.pushStack64(0.29999995231628423);
    code.setUint8(0, OPCODE.DSTORE);
    code.setUint8(1, 0);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(0.29999995231628424);
    expect(thread.getPC()).toBe(2);
  });
});

describe('Dstore0', () => {
  test('DSTORE_0: stores double into locals', () => {
    thread.pushStack64(0.5);
    code.setUint8(0, OPCODE.DSTORE_0);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(0.5);
    expect(thread.getPC()).toBe(1);
  });

  test('DSTORE_0: undergoes value set conversion', () => {
    thread.pushStack64(0.29999995231628423);
    code.setUint8(0, OPCODE.DSTORE_0);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(0.29999995231628424);
    expect(thread.getPC()).toBe(1);
  });
});

describe('Dstore1', () => {
  test('DSTORE_1: stores double into locals', () => {
    thread.pushStack64(0.5);
    code.setUint8(0, OPCODE.DSTORE_1);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(1)).toBe(0.5);
    expect(thread.getPC()).toBe(1);
  });

  test('DSTORE_1: undergoes value set conversion', () => {
    thread.pushStack64(0.29999995231628423);
    code.setUint8(0, OPCODE.DSTORE_1);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(1)).toBe(0.29999995231628424);
    expect(thread.getPC()).toBe(1);
  });
});

describe('Dstore2', () => {
  test('DSTORE_2: stores double into locals', () => {
    thread.pushStack64(0.5);
    code.setUint8(0, OPCODE.DSTORE_2);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(2)).toBe(0.5);
    expect(thread.getPC()).toBe(1);
  });

  test('DSTORE_2: undergoes value set conversion', () => {
    thread.pushStack64(0.29999995231628423);
    code.setUint8(0, OPCODE.DSTORE_2);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(2)).toBe(0.29999995231628424);
    expect(thread.getPC()).toBe(1);
  });
});

describe('Dstore3', () => {
  test('DSTORE_3: stores double into locals', () => {
    thread.pushStack64(0.5);
    code.setUint8(0, OPCODE.DSTORE_3);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(3)).toBe(0.5);
    expect(thread.getPC()).toBe(1);
  });

  test('DSTORE_3: undergoes value set conversion', () => {
    thread.pushStack64(0.29999995231628423);
    code.setUint8(0, OPCODE.DSTORE_3);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(3)).toBe(0.29999995231628424);
    expect(thread.getPC()).toBe(1);
  });
});

describe('Astore', () => {
  test('ASTORE: stores int into locals', () => {
    const v1 = new JvmObject(threadClass);
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.ASTORE);
    code.setUint8(1, 0);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(v1);
    expect(thread.getPC()).toBe(2);
  });
});

describe('Astore0', () => {
  test('ASTORE_0: stores int into locals', () => {
    const v1 = new JvmObject(threadClass);
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.ASTORE_0);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(0)).toBe(v1);
    expect(thread.getPC()).toBe(1);
  });
});

describe('Astore1', () => {
  test('ASTORE_1: stores int into locals', () => {
    const v1 = new JvmObject(threadClass);
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.ASTORE_1);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(1)).toBe(v1);
    expect(thread.getPC()).toBe(1);
  });
});

describe('Astore2', () => {
  test('ASTORE_2: stores int into locals', () => {
    const v1 = new JvmObject(threadClass);
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.ASTORE_2);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(2)).toBe(v1);
    expect(thread.getPC()).toBe(1);
  });
});

describe('Astore3', () => {
  test('ASTORE_3: stores int into locals', () => {
    const v1 = new JvmObject(threadClass);
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.ASTORE_3);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(thread.loadLocal(3)).toBe(v1);
    expect(thread.getPC()).toBe(1);
  });
});

describe('Iastore', () => {
  test('IASTORE: stores int into array', () => {
    const arrCls = (
      bscl.getClassRef('[I') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);

    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.IASTORE);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0)).toBe(5);
    expect(thread.getPC()).toBe(1);
  });

  test('IASTORE: throws NullPointerException', () => {
    thread.pushStack(null);
    thread.pushStack(0);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.IASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('IASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[I') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(1);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.IASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('IASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[I') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(-1);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.IASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('Lastore', () => {
  test('LASTORE: stores long into array', () => {
    const arrCls = (
      bscl.getClassRef('[J') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack64(5n);
    code.setUint8(0, OPCODE.LASTORE);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0) === 5n).toBe(true);
    expect(thread.getPC()).toBe(1);
  });

  test('LASTORE: throws NullPointerException', () => {
    thread.pushStack(null);
    thread.pushStack(0);
    thread.pushStack64(5n);
    code.setUint8(0, OPCODE.LASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('LASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[J') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(1);
    thread.pushStack64(5n);
    code.setUint8(0, OPCODE.LASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('LASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[J') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(-1);
    thread.pushStack64(5n);
    code.setUint8(0, OPCODE.LASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('Fastore', () => {
  test('FASTORE: stores float into array', () => {
    const arrCls = (
      bscl.getClassRef('[F') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack(0.5);
    code.setUint8(0, OPCODE.FASTORE);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0)).toBe(0.5);
    expect(thread.getPC()).toBe(1);
  });

  test('FASTORE: throws NullPointerException', () => {
    thread.pushStack(null);
    thread.pushStack(0);
    thread.pushStack(0.5);
    code.setUint8(0, OPCODE.FASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('FASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[F') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(1);
    thread.pushStack(0.5);
    code.setUint8(0, OPCODE.FASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('FASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[F') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(-1);
    thread.pushStack(0.5);
    code.setUint8(0, OPCODE.FASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('Dastore', () => {
  test('DASTORE: stores double into array', () => {
    const arrCls = (
      bscl.getClassRef('[D') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack64(0.5);
    code.setUint8(0, OPCODE.DASTORE);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0)).toBe(0.5);
    expect(thread.getPC()).toBe(1);
  });

  test('DASTORE: throws NullPointerException', () => {
    thread.pushStack(null);
    thread.pushStack(0);
    thread.pushStack64(0.5);
    code.setUint8(0, OPCODE.DASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('DASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[D') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(1);
    thread.pushStack64(0.5);
    code.setUint8(0, OPCODE.DASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('DASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[D') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(-1);
    thread.pushStack64(0.5);
    code.setUint8(0, OPCODE.DASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('Aastore', () => {
  test('AASTORE: stores reference into array', () => {
    const arrCls = (
      bscl.getClassRef('[Ljava/lang/Thread;') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    const v1 = new JvmObject(threadClass);
    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.AASTORE);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0)).toBe(v1);
    expect(thread.getPC()).toBe(1);
  });

  test('AASTORE: throws NullPointerException', () => {
    thread.pushStack(null);
    thread.pushStack(0);
    thread.pushStack(null);
    code.setUint8(0, OPCODE.AASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('AASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[Ljava/lang/Thread;') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    const v1 = new JvmObject(threadClass);
    thread.pushStack(arrayref);
    thread.pushStack(1);
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.AASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('AASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[Ljava/lang/Thread;') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    const v1 = new JvmObject(threadClass);
    thread.pushStack(arrayref);
    thread.pushStack(-1);
    thread.pushStack(v1);
    code.setUint8(0, OPCODE.AASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('Bastore', () => {
  test('BASTORE: stores byte into array', () => {
    const arrCls = (
      bscl.getClassRef('[B') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.BASTORE);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0)).toBe(5);
    expect(thread.getPC()).toBe(1);
  });

  test('BASTORE: truncates int to byte', () => {
    const arrCls = (
      bscl.getClassRef('[B') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack(128);
    code.setUint8(0, OPCODE.BASTORE);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0)).toBe(-128);
    expect(thread.getPC()).toBe(1);
  });

  test('BASTORE: throws NullPointerException', () => {
    thread.pushStack(null);
    thread.pushStack(0);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.BASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('BASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[B') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(1);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.BASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('BASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[B') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(-1);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.BASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('Castore', () => {
  test('CASTORE: stores char into array', () => {
    const arrCls = (
      bscl.getClassRef('[C') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.CASTORE);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0)).toBe(5);
    expect(thread.getPC()).toBe(1);
  });

  test('CASTORE: truncates int to char', () => {
    const arrCls = (
      bscl.getClassRef('[C') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack(0x11111);
    code.setUint8(0, OPCODE.CASTORE);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0)).toBe(0x1111);
    expect(thread.getPC()).toBe(1);
  });

  test('CASTORE: throws NullPointerException', () => {
    thread.pushStack(null);
    thread.pushStack(0);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.CASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('CASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[C') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(1);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.CASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('CASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[C') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(-1);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.CASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});

describe('Sastore', () => {
  test('SASTORE: stores short into array', () => {
    const arrCls = (
      bscl.getClassRef('[S') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.SASTORE);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0)).toBe(5);
    expect(thread.getPC()).toBe(1);
  });

  test('SASTORE: truncates int to short', () => {
    const arrCls = (
      bscl.getClassRef('[S') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(0);
    thread.pushStack(32768);
    code.setUint8(0, OPCODE.SASTORE);

    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(arrayref.get(0)).toBe(-32768);
    expect(thread.getPC()).toBe(1);
  });

  test('SASTORE: throws NullPointerException', () => {
    thread.pushStack(null);
    thread.pushStack(0);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.SASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/NullPointerException'
    );
  });

  test('SASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[S') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(1);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.SASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });

  test('SASTORE: throws ArrayIndexOutOfBoundsException', () => {
    const arrCls = (
      bscl.getClassRef('[S') as SuccessResult<ClassData>
    ).getResult();
    const arrayref = arrCls.instantiate() as JvmArray;
    arrayref.initialize(thread, 1);
    thread.pushStack(arrayref);
    thread.pushStack(-1);
    thread.pushStack(5);
    code.setUint8(0, OPCODE.SASTORE);
    try {
      try {
        runInstruction(thread, jni, () => {});
      } catch (e) {}
    } catch (e) {}
    const exceptionObj = thread.loadLocal(1) as JvmObject;
    expect(exceptionObj.getClass().getClassname()).toBe(
      'java/lang/ArrayIndexOutOfBoundsException'
    );
  });
});
