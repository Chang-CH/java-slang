import { readFieldDescriptor } from '../ExecutionEngine/Interpreter/utils';
import { ArrayType, JavaArray, JavaType } from '#types/DataTypes';
export class JNI {
  classes: {
    [className: string]: {
      methods: {
        [methodName: string]: Function;
      };
    };
  };

  constructor() {
    this.classes = {
      'java/lang/Thread$UncaughtExceptionHandler': {
        methods: {
          'uncaughtException(Ljava/lang/Thread;Ljava/lang/Throwable;)V':
            () => {},
        },
      },
    };
  }

  getNativeMethod(className: string, methodName: string) {
    // FIXME: hacky way to generate empty functions
    if (!this.classes?.[className]?.methods?.[methodName]) {
      console.error(
        `Native method ${className}.${methodName} implementation not found, returning dummy function`
      );
      const retType = readFieldDescriptor(methodName.split(')')[1], 0).type;

      switch (retType) {
        case JavaType.array:
          return () => new JavaArray(0, ArrayType.int);
        case JavaType.byte:
          return () => 0;
        case JavaType.char:
          return () => '';
        case JavaType.double:
          return () => 0.0;
        case JavaType.float:
          return () => 0.0;
        case JavaType.int:
          return () => 0;
        case JavaType.long:
          return () => 0n;
        case JavaType.short:
          return () => 0;
        case JavaType.boolean:
          return () => false;
        case JavaType.reference:
          return () => null;
        case JavaType.void:
          return () => {};
        default:
          return () => {};
      }
    }
    return this.classes[className].methods[methodName];
  }
}
