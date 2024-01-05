import { Result } from '#types/Result';
import { JavaType } from '#types/reference/Object';
import { parseFieldDescriptor } from '#utils/index';
import { ThreadStatus } from '../thread/constants';
import Thread from '../thread/thread';
import stdlib from './stdlib';

export class JNI {
  private classes: {
    [className: string]: {
      loader: (
        onFinish: (lib: {
          [key: string]: (thread: Thread, locals: any[]) => void;
        }) => void
      ) => void;
      methods?: { [key: string]: (thread: Thread, locals: any[]) => void };
      blocking?: Thread[];
    };
  };

  constructor() {
    this.classes = stdlib;
  }

  registerNativeMethod(
    className: string,
    methodName: string,
    method: (thread: Thread, locals: any[]) => void
  ) {
    if (!this.classes[className]) {
      this.classes[className] = {
        loader: () => {},
        methods: {},
      };
    }
    this.classes[className].methods![methodName] = method;
  }

  getNativeMethod(
    thread: Thread,
    className: string,
    methodName: string
  ): Result<(thread: Thread, locals: any[]) => void> {
    // classname not found
    if (!this.classes?.[className]) {
      this.classes[className] = {
        loader: () => {},
        methods: {},
        blocking: [],
      }; // temporary workaround for unimplemented natives
    }

    // class native methods not yet loaded
    if (!this.classes?.[className]?.methods) {
      if (!this.classes[className].blocking) {
        this.classes[className].blocking = [thread];
        thread.setStatus(ThreadStatus.WAITING);
        this.classes[className].loader(lib => {
          this.classes[className].methods = lib;
          this.classes[className].blocking?.forEach(thread => {
            thread.setStatus(ThreadStatus.RUNNABLE);
          });
          this.classes[className].blocking = [];
        });
      } else {
        this.classes[className].blocking!.push(thread);
        thread.setStatus(ThreadStatus.WAITING);
      }
      return { isDefer: true };
    }

    // native method does not exist
    if (!this.classes?.[className]?.methods?.[methodName]) {
      // FIXME: Returns an empty function for now, but should throw an error
      console.error(`Native method missing: ${className}.${methodName} `);
      const retType = parseFieldDescriptor(methodName.split(')')[1], 0).type;

      switch (retType) {
        case JavaType.array:
          return {
            result: (thread: Thread, ...params: any) => {
              thread.returnStackFrame(null);
            },
          };
        case JavaType.byte:
        case JavaType.int:
        case JavaType.boolean:
        case JavaType.char:
        case JavaType.short:
          return {
            result: (thread: Thread, ...params: any) => {
              thread.returnStackFrame(0);
            },
          };
        case JavaType.double:
          return {
            result: (thread: Thread, ...params: any) => {
              thread.returnStackFrame64(0.0);
            },
          };
        case JavaType.float:
          return {
            result: (thread: Thread, ...params: any) => {
              thread.returnStackFrame(0.0);
            },
          };
        case JavaType.long:
          return {
            result: (thread: Thread, ...params: any) => {
              thread.returnStackFrame64(0n);
            },
          };
        case JavaType.reference:
          return {
            result: (thread: Thread, ...params: any) => {
              thread.returnStackFrame(null);
            },
          };
        case JavaType.void:
          return {
            result: (thread: Thread, ...params: any) => {
              thread.returnStackFrame();
            },
          };
        default:
          return {
            result: (thread: Thread, ...params: any) => {
              thread.returnStackFrame();
            },
          };
      }
    }

    console.log('Native method ', methodName);
    return { result: (this.classes[className].methods as any)[methodName] };
  }
}
