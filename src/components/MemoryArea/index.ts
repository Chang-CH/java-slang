import { ClassData } from '#types/ClassData';
import { ClassFile } from '#types/ClassFile';
import { InstructionType } from '#types/ClassFile/instructions';
import { MethodType } from '#types/ClassFile/methods';
import { checkNative } from '../../utils/parseBinary/utils/readMethod';
import NativeThread from '../ExecutionEngine/NativeThreadGroup/NativeThread';
import { InstructionPointer } from '../ExecutionEngine/NativeThreadGroup/NativeThread/types';
import { JNI } from '../JNI';
import { readInstruction } from './utils/readInstruction';

export default class MemoryArea {
  // Technically the stack and pc registers should be here, but are stored in NativeStack.
  heap: any;
  methodArea: {
    [className: string]: ClassData;
  };
  jni: JNI;

  constructor(jni: JNI) {
    this.heap = {};
    this.methodArea = {};
    this.jni = jni;
  }

  getInstructionAt(
    thread: NativeThread,
    pointer: InstructionPointer
  ): InstructionType | Function {
    // class not loaded
    if (!this.methodArea[pointer.className]) {
      throw new Error('class not loaded');
    }

    const method =
      this.methodArea[pointer.className].methods[pointer.methodName];

    if (checkNative(method) || !method.code) {
      return this.jni.getNativeMethod(pointer.className, pointer.methodName);
    }

    return readInstruction(method.code.code, pointer.pc);
  }

  getClass(className: string, onError?: (e: Error) => void): ClassData {
    if (!this.methodArea[className]) {
      onError && onError(new Error('class not loaded'));
    }
    return this.methodArea[className];
  }

  getConstant(className: string, constantIndex: number): any {
    return this.methodArea[className].constant_pool[constantIndex];
  }

  getConstantWide(className: string, constantIndex: number): any {
    return this.methodArea[className].constant_pool[constantIndex];
  }

  getStatic(className: string, fieldName: string): any {
    return this.methodArea[className].fields[fieldName].data;
  }

  getStaticWide(className: string, fieldName: string): any {
    return this.methodArea[className].fields[fieldName].data;
  }

  putStatic(className: string, fieldName: string, value: any): void {
    this.methodArea[className].fields[fieldName].data = value;
  }

  putStaticWide(className: string, fieldName: string, value: any): void {
    this.methodArea[className].fields[fieldName].data = value;
  }

  loadClass(className: string, cls: ClassData): void {
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
