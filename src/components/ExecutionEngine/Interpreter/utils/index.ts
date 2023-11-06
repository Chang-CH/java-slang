import { JavaType } from '#types/dataTypes';

export function parseFirstDescriptor(descriptor: string) {
  switch (descriptor[0]) {
    case JavaType.byte:
      return { type: JavaType.byte, index: 1 };
    case JavaType.char:
      return { type: JavaType.char, index: 1 };
    case JavaType.double:
      return { type: JavaType.double, index: 1 };
    case JavaType.float:
      return { type: JavaType.float, index: 1 };
    case JavaType.int:
      return { type: JavaType.int, index: 1 };
    case JavaType.long:
      return { type: JavaType.long, index: 1 };
    case JavaType.short:
      return { type: JavaType.short, index: 1 };
    case JavaType.boolean:
      return { type: JavaType.boolean, index: 1 };
    case JavaType.array:
      return { type: JavaType.array, index: 0 };
    case JavaType.reference:
      const end = descriptor.indexOf(';');
      return { type: JavaType.reference, index: end + 1 };
    case JavaType.void:
      return { type: JavaType.void, index: 1 };
    default:
      throw new Error(`Unknown type ${descriptor[0]}`);
  }
}

export function parseFieldDescriptor(
  descriptor: string,
  index: number
): { type: string; referenceCls?: string; index: number } {
  switch (descriptor[index]) {
    case JavaType.byte:
    case JavaType.char:
    case JavaType.double:
    case JavaType.float:
    case JavaType.int:
    case JavaType.long:
    case JavaType.short:
    case JavaType.boolean:
      // skip semicolon
      return { type: descriptor[index], index: index + 1 };
    case JavaType.array:
      const res = parseFieldDescriptor(descriptor, index + 1);
      const clsName = '[' + (res.referenceCls ?? res.type);
      return { type: JavaType.array, referenceCls: clsName, index: res.index };
    case JavaType.reference:
      const sub = descriptor.substring(index);
      const end = sub.indexOf(';');
      return {
        type: JavaType.reference,
        referenceCls: descriptor.substring(1, end),
        index: index + end + 1,
      };
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
    const {
      type,
      referenceCls,
      index: newIndex,
    } = parseFieldDescriptor(args, index);
    argTypes.push({ type, referenceCls });
    index = newIndex;
  }

  const retType = parseFieldDescriptor(ret, 0);
  return {
    args: argTypes,
    ret: { type: retType.type, referenceCls: retType.referenceCls },
  };
}

export function getField(ref: any, fieldName: string, type: JavaType) {
  ref.getField(fieldName, type);
}
export function asDouble(value: number): number {
  return value;
}

export function asFloat(value: number): number {
  return Math.fround(value);
}
