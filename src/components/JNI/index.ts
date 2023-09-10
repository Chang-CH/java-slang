import obj from './java_lang_Object';
import cls from './java_lang_Class';
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
    this.classes = {};
  }

  getNativeMethod(className: string, methodName: string) {
    // FIXME: hacky way to generate empty functions
    if (!this.classes?.[className]?.methods?.[methodName]) {
      console.error(
        `Native method ${className}.${methodName} implementation not found, returning dummy function`
      );
      const retType = readFieldDescriptor(methodName.split(')')[1], 0).type;

      switch (retType) {
        case JavaType.ARRAY:
          return () => new JavaArray(0, ArrayType.T_INT);
        case JavaType.BYTE:
          return () => 0;
        case JavaType.CHAR:
          return () => '';
        case JavaType.DOUBLE:
          return () => 0.0;
        case JavaType.FLOAT:
          return () => 0.0;
        case JavaType.INT:
          return () => 0;
        case JavaType.LONG:
          return () => 0n;
        case JavaType.SHORT:
          return () => 0;
        case JavaType.BOOLEAN:
          return () => false;
        case JavaType.REFERENCE:
          return () => null;
        case JavaType.VOID:
          return () => {};
        default:
          return () => {};
      }
    }
    return this.classes[className].methods[methodName];
  }
}
