import { ClassFile } from '#types/ClassFile';
import { InstructionType } from '#types/ClassFile/instructions';
import { JavaType } from '#types/DataTypes';
import { InstructionPointer } from '../ExecutionEngine/NativeThreadGroup/NativeThread/types';

export default class MemoryArea {
  // Technically the stack and pc registers should be here, but are stored in NativeStack.
  heap: any;
  methodArea: {
    [className: string]: {
      methods: {
        [methodName: string]: any;
      };
      [others: string]: any;
    };
  };

  constructor() {
    this.heap = {};
    this.methodArea = {};
  }

  getInstructionAt(pointer: InstructionPointer): InstructionType {
    const method =
      this.methodArea[pointer.className].methods[pointer.methodName];
    return method.code.code[pointer.pc];
  }

  getConstant(className: string, constantIndex: number): [any, JavaType] {
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
}
