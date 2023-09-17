import { ClassRef } from '#types/ClassRef';
import {
  ArrayType,
  JavaArray,
  JavaReference,
  JavaType,
} from '#types/DataTypes';
import NativeThread from '../../NativeThreadGroup/NativeThread';

export function readFieldDescriptor(descriptor: string, index: number) {
  switch (descriptor[index]) {
    case JavaType.BYTE:
      return { type: JavaType.BYTE, index: index + 1 };
    case JavaType.CHAR:
      return { type: JavaType.CHAR, index: index + 1 };
    case JavaType.DOUBLE:
      return { type: JavaType.DOUBLE, index: index + 1 };
    case JavaType.FLOAT:
      return { type: JavaType.FLOAT, index: index + 1 };
    case JavaType.INT:
      return { type: JavaType.INT, index: index + 1 };
    case JavaType.LONG:
      return { type: JavaType.LONG, index: index + 1 };
    case JavaType.SHORT:
      return { type: JavaType.SHORT, index: index + 1 };
    case JavaType.BOOLEAN:
      return { type: JavaType.BOOLEAN, index: index + 1 };
    case JavaType.ARRAY:
      ({ index } = readFieldDescriptor(descriptor, index + 1));
      return { type: JavaType.ARRAY, index };
    case JavaType.REFERENCE:
      const sub = descriptor.substring(index);
      const end = sub.indexOf(';');
      return { type: JavaType.REFERENCE, index: index + end + 1 };
    case JavaType.VOID:
      return { type: JavaType.VOID, index: index + 1 };
    default:
      throw new Error(`Unknown type ${descriptor[index]}`);
  }
}

export function readMethodDescriptor(desc: string) {
  let [args, ret] = desc.split(')');
  args = args.substring(1);
  const argTypes = [];

  let index = 0;
  while (index < args.length) {
    const { type, index: newIndex } = readFieldDescriptor(args, index);
    argTypes.push(type);
    index = newIndex;
  }

  const { type: retType } = readFieldDescriptor(ret, 0);
  return {
    args: argTypes,
    ret: retType,
  };
}

export function getField(ref: any, fieldName: string, type: JavaType) {
  ref.getField(fieldName, type);
}

export function tryInitialize(thread: NativeThread, className: string) {
  const classRef = thread
    .getClass()
    .getLoader()
    .getClassRef(className, console.error); // TODO: throw class loading exceptions

  if (!classRef) {
    throw new Error('Class load exception');
  }
  // Class not initialized, initialize it.
  if (classRef.isInitialized) {
    if (classRef.methods['<clinit>()V']) {
      thread.pushStackFrame({
        class: classRef,
        method: classRef.methods['<clinit>()V'],
        pc: 0,
        operandStack: [],
        locals: [],
      });
      classRef.isInitialized = true;
      return;
    }
    classRef.isInitialized = true;
  }
}

// export function runFull( instruction: InstructionType) {
//   const className = thread.getClass().getConstant(
//     thread.getClassName(),
//     instruction.operands[0]
//   ) as constantUtf8Info;

//   tryInitialize( thread, className.value);
//   thread.offsetPc(3);
// }
