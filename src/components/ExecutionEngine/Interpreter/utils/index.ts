import { JavaType } from '#types/DataTypes';
import NativeThread from '../../NativeThreadGroup/NativeThread';

export function parseFieldDescriptor(descriptor: string, index: number) {
  switch (descriptor[index]) {
    case JavaType.byte:
      return { type: JavaType.byte, index: index + 1 };
    case JavaType.char:
      return { type: JavaType.char, index: index + 1 };
    case JavaType.double:
      return { type: JavaType.double, index: index + 1 };
    case JavaType.float:
      return { type: JavaType.float, index: index + 1 };
    case JavaType.int:
      return { type: JavaType.int, index: index + 1 };
    case JavaType.long:
      return { type: JavaType.long, index: index + 1 };
    case JavaType.short:
      return { type: JavaType.short, index: index + 1 };
    case JavaType.boolean:
      return { type: JavaType.boolean, index: index + 1 };
    case JavaType.array:
      ({ index } = parseFieldDescriptor(descriptor, index + 1));
      return { type: JavaType.array, index };
    case JavaType.reference:
      const sub = descriptor.substring(index);
      const end = sub.indexOf(';');
      return { type: JavaType.reference, index: index + end + 1 };
    case JavaType.void:
      return { type: JavaType.void, index: index + 1 };
    default:
      throw new Error(`Unknown type ${descriptor[index]}`);
  }
}

export function parseMethodDescriptor(desc: string) {
  let [args, ret] = desc.split(')');
  args = args.substring(1);
  const argTypes = [];

  let index = 0;
  while (index < args.length) {
    const { type, index: newIndex } = parseFieldDescriptor(args, index);
    argTypes.push(type);
    index = newIndex;
  }

  const { type: retType } = parseFieldDescriptor(ret, 0);
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
    if (classRef.getMethod(thread, '<clinit>()V')) {
      thread.pushStackFrame({
        class: classRef,
        method: classRef.getMethod(thread, '<clinit>()V'),
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
