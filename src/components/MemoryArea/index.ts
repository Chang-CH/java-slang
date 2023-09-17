import { ClassRef } from '#types/ClassRef';
import NativeThread from '../ExecutionEngine/NativeThreadGroup/NativeThread';
import { JNI } from '../JNI';

export default class MemoryArea {
  // Technically the stack and pc registers should be here, but are stored in NativeStack.
  heap: any;
  methodArea: {
    [className: string]: ClassRef;
  };
  jni: JNI;

  constructor(jni: JNI) {
    this.heap = {};
    this.methodArea = {};
    this.jni = jni;
  }

  _getClass(className: string): ClassRef {
    return this.methodArea[className];
  }

  getClass(
    thread: NativeThread,
    className: string,
    onError?: (e: Error) => void
  ): ClassRef {
    // Load class if not loaded
    if (!this.methodArea[className]) {
      thread
        .getClass()
        .getLoader()
        .load(
          className,
          () => {},
          e => {
            onError && onError(new Error('class could not be loaded'));
          }
        );
    }
    return this.methodArea[className];
  }

  loadClass(className: string, cls: ClassRef): void {
    this.methodArea[className] = cls;
    return;
  }
}
