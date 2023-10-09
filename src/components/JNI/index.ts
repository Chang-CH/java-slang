import { parseFieldDescriptor } from '../ExecutionEngine/Interpreter/utils';
import { ArrayPrimitiveType, JavaArray, JavaType } from '#types/dataTypes';
export class JNI {
  private classes: {
    [className: string]: {
      methods: {
        [methodName: string]: Function;
      };
    };
  };

  constructor() {
    this.classes = {};
  }

  registerNativeMethod(
    className: string,
    methodName: string,
    method: Function
  ) {
    if (!this.classes[className]) {
      this.classes[className] = {
        methods: {},
      };
    }
    this.classes[className].methods[methodName] = method;
  }

  getNativeMethod(className: string, methodName: string) {
    if (!this.classes?.[className]?.methods?.[methodName]) {
      // FIXME: Returns an empty function for now, but should throw an error
      console.error(
        `Native method ${className}.${methodName} implementation not found, returning dummy function`
      );
      const retType = parseFieldDescriptor(methodName.split(')')[1], 0).type;

      switch (retType) {
        case JavaType.array:
          return () => new JavaArray(0, ArrayPrimitiveType.int);
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
