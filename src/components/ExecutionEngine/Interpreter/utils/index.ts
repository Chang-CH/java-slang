import { CLASS_STATUS, ClassRef } from '#types/ClassRef';
import { JavaType } from '#types/dataTypes';
import NativeThread from '../../NativeThreadGroup/NativeThread';

export function parseFirstDescriptor(descriptor: string) {
  let index = 0;
  switch (descriptor[0]) {
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
      return { type: JavaType.array, index };
    case JavaType.reference:
      const end = descriptor.indexOf(';');
      return { type: JavaType.reference, index: index + end + 1 };
    case JavaType.void:
      return { type: JavaType.void, index: index + 1 };
    default:
      throw new Error(`Unknown type ${descriptor[index]}`);
  }
}

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

export function tryInitialize(
  thread: NativeThread,
  className: string
): { shouldDefer?: boolean } {
  const classRef = thread.getClass().getLoader().getClassRef(className)
    .result as ClassRef;

  if (!classRef) {
    thread.throwNewException('java/lang/ClassNotFoundException', '');
    return { shouldDefer: true };
  }

  if (
    classRef.status === CLASS_STATUS.INITIALIZING ||
    classRef.status === CLASS_STATUS.INITIALIZED
  ) {
    return {};
  }

  // Class not initialized, initialize it.
  // FIXME: need to break out of calling function to run stackframe.
  const staticInit = classRef.getMethod('<clinit>()V');
  if (staticInit != null) {
    classRef.status = CLASS_STATUS.INITIALIZING;
    thread.pushStackFrame(classRef, staticInit, 0, []);
    return { shouldDefer: true };
  }

  classRef.status = CLASS_STATUS.INITIALIZED;
  return {};
}

export function asDouble(value: number): number {
  return value;
}

export function asFloat(value: number): number {
  return Math.fround(value);
}
