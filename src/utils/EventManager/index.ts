import AbstractClassLoader from '#jvm/components/ClassLoader/AbstractClassLoader';
import { MethodRef } from '#types/MethodRef';
import { ClassRef } from '#types/class/ClassRef';

class EventManager {
  private _loadListenerId: number = 0;
  private loadListeners: {
    id: number;
    cb: (loaded: ClassRef, loader: AbstractClassLoader) => void;
  }[] = [];

  private instructionListenerId: number = 0;
  private instructionListeners: {
    id: number;
    cb: (opcode: string, opStack: any[], locals: any[]) => void;
  }[] = [];

  private invokeListenerId: number = 0;
  private invokeListeners: {
    id: number;
    cb: (method: MethodRef, params: any[], sfDepth: number) => void;
  }[] = [];

  private returnListenerId: number = 0;
  private returnListeners: {
    id: number;
    cb: (method: MethodRef, returnValue: any) => void;
  }[] = [];

  onLoad(cb: (loaded: ClassRef, loader: AbstractClassLoader) => void): number {
    const id = this._loadListenerId++;
    this.loadListeners.push({ id, cb });
    return id;
  }

  loadEvent(loaded: ClassRef, loader: AbstractClassLoader) {
    this.loadListeners.forEach(listener => listener.cb(loaded, loader));
  }

  removeLoadListener(id: number) {
    this.loadListeners = this.loadListeners.filter(
      listener => listener.id !== id
    );
  }

  onInstruction(
    cb: (opcode: string, opStack: any[], locals: any[]) => void
  ): number {
    const id = this.instructionListenerId++;
    this.instructionListeners.push({ id, cb });
    return id;
  }

  instructionEvent(opcode: string, opStack: any[], locals: any[]) {
    this.instructionListeners.forEach(listener =>
      listener.cb(opcode, opStack, locals)
    );
  }

  removeInstructionListener(id: number) {
    this.instructionListeners = this.instructionListeners.filter(
      listener => listener.id !== id
    );
  }

  onInvoke(
    cb: (method: MethodRef, params: any[], sfDepth: number) => void
  ): number {
    const id = this.invokeListenerId++;
    this.invokeListeners.push({ id, cb });
    return id;
  }

  invokeEvent(method: MethodRef, params: any[], sfDepth: number) {
    this.invokeListeners.forEach(listener =>
      listener.cb(method, params, sfDepth)
    );
  }

  removeInvokeListener(id: number) {
    this.invokeListeners = this.invokeListeners.filter(
      listener => listener.id !== id
    );
  }

  onReturn(cb: (method: MethodRef, returnValue: any) => void): number {
    const id = this.returnListenerId++;
    this.returnListeners.push({ id, cb });
    return id;
  }

  returnEvent(method: MethodRef, returnValue: any) {
    this.returnListeners.forEach(listener => listener.cb(method, returnValue));
  }

  removeReturnListener(id: number) {
    this.returnListeners = this.returnListeners.filter(
      listener => listener.id !== id
    );
  }
}

const eventManager = new EventManager();
export default eventManager;
