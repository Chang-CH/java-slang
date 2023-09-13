import { INSTRUCTION_SET } from '#constants/ClassFile/instructions';
import BootstrapClassLoader from '#jvm/components/ClassLoader/BootstrapClassLoader';
import runInstruction from '#jvm/components/ExecutionEngine/Interpreter/utils/instructions';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import { JNI } from '#jvm/components/JNI';
import MemoryArea from '#jvm/components/MemoryArea';
import { JavaReference } from '#types/DataTypes';
import OsInterface from '#utils/OsInterface';

let thread: NativeThread;
let memoryArea: MemoryArea;

beforeEach(() => {
  const jni = new JNI();
  memoryArea = new MemoryArea(jni);
  const os = new OsInterface({});

  const bscl = new BootstrapClassLoader(memoryArea, os, 'natives');
  memoryArea.getClass('java/lang/Thread', e => {
    bscl.load(
      'java/lang/Thread',
      () => {},
      e => {
        throw e;
      }
    );
  });

  const threadClass = memoryArea.getClass('java/lang/Thread');
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
    runInstruction(thread, memoryArea, {
      opcode: INSTRUCTION_SET.nop,
      operands: [],
    });
    expect(thread.stack.length).toBe(1);
    const lastFrame = thread.peekStackFrame();
    expect(lastFrame.operandStack.length).toBe(0);
    expect(lastFrame.locals.length).toBe(0);
    expect(lastFrame.pc).toBe(0);
  });
});
