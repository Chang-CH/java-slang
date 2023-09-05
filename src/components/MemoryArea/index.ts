import { ClassFile } from '#types/ClassFile';
import { InstructionType } from '#types/ClassFile/instructions';
import { MethodType } from '#types/ClassFile/methods';
import { checkNative } from '../ClassLoader/BootstrapClassLoader/utils/readMethod';
import { InstructionPointer } from '../ExecutionEngine/NativeThreadGroup/NativeThread/types';
import { JNI } from '../JNI';
import { readInstruction, readInstructions } from './utils/readInstruction';

export default class MemoryArea {
  // Technically the stack and pc registers should be here, but are stored in NativeStack.
  heap: any;
  methodArea: {
    [className: string]: {
      methods: {
        [methodName: string]: MethodType;
      };
      [others: string]: any;
    };
  };
  jni: JNI;

  constructor(jni: JNI) {
    this.heap = {};
    this.methodArea = {};

    // TODO: remove hardcoded natives
    const obj: {
      methods: {
        [methodName: string]: MethodType;
      };
      [others: string]: any;
    } = {
      methods: {},
    };
    obj.methods['<init>()V'] = {
      access_flags: 0x0100,
      name_index: 0,
      descriptor_index: 0,
      attributes: [],
      code: {
        attribute_name_index: 0,
        attributes: [],
        max_stack: 0,
        max_locals: 0,
        code: new DataView(new ArrayBuffer(0)),
        exception_table: [],
      },
    };
    this.methodArea['java/lang/Object'] = obj;

    this.jni = jni;
  }

  getInstructionAt(pointer: InstructionPointer): InstructionType | Function {
    const method =
      this.methodArea[pointer.className].methods[pointer.methodName];
    if (checkNative(method)) {
      return this.jni.getNativeMethod(pointer.className, pointer.methodName);
    }

    return readInstruction(method.code.code, pointer.pc);
  }

  getConstant(className: string, constantIndex: number): any {
    return this.methodArea[className].constant_pool[constantIndex];
  }

  getConstantWide(className: string, constantIndex: number): any {
    return this.methodArea[className].constant_pool[constantIndex];
  }

  loadClass(className: string, cls: ClassFile): void {
    this.methodArea[className] = cls;
    return;
  }

  // TODO: type pointer
  getReferenceAt(pointer: any) {
    return this.heap[pointer];
  }

  getReferenceWideAt(pointer: any) {
    return this.heap[pointer];
  }
}
