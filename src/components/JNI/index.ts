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
          return (...params: any) => {
            console.log(
              `Dummy method ${className}.${methodName} run with params${params}`
            );
            return null;
          };
        case JavaType.byte:
          return (...params: any) => {
            console.log(
              `Dummy method ${className}.${methodName} run with params${params}`
            );
            return 0;
          };
        case JavaType.char:
          return (...params: any) => {
            console.log(
              `Dummy method ${className}.${methodName} run with params${params}`
            );
            return '';
          };
        case JavaType.double:
          return (...params: any) => {
            console.log(
              `Dummy method ${className}.${methodName} run with params${params}`
            );
            return 0.0;
          };
        case JavaType.float:
          return (...params: any) => {
            console.log(
              `Dummy method ${className}.${methodName} run with params${params}`
            );
            return 0.0;
          };
        case JavaType.int:
          return (...params: any) => {
            console.log(
              `Dummy method ${className}.${methodName} run with params${params}`
            );
            return 0;
          };
        case JavaType.long:
          return (...params: any) => {
            console.log(
              `Dummy method ${className}.${methodName} run with params${params}`
            );
            return 0n;
          };
        case JavaType.short:
          return (...params: any) => {
            console.log(
              `Dummy method ${className}.${methodName} run with params${params}`
            );
            return 0;
          };
        case JavaType.boolean:
          return (...params: any) => {
            console.log(
              `Dummy method ${className}.${methodName} run with params${params}`
            );
            return false;
          };
        case JavaType.reference:
          return (...params: any) => {
            console.log(
              `Dummy method ${className}.${methodName} run with params${params}`
            );
            return null;
          };
        case JavaType.void:
          return (...params: any) => {
            console.log(
              `Dummy method ${className}.${methodName} run with params${params}`
            );
            return {};
          };
        default:
          return (...params: any) => {
            console.log(
              `Dummy method ${className}.${methodName} run with params${params}`
            );
            return {};
          };
      }
    }
    return this.classes[className].methods[methodName];
  }
}
