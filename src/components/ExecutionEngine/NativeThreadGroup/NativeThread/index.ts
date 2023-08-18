import { InstructionPointer } from './types';

export default class NativeThread {
  getCurrentInstruction(): InstructionPointer {
    console.error('NativeThread.getInstruction: not implemented.');
    return { className: '', methodName: '', pc: 0 };
  }
}
