import { ConstantType } from '#types/ClassFile/constants';
import { METHOD_FLAGS, MethodType } from '#types/ClassFile/methods';
import { readAttribute } from './readAttributes';

export function readMethod(
  constPool: Array<ConstantType>,
  view: DataView,
  offset: number
): { result: MethodType; offset: number } {
  const access_flags = view.getUint16(offset);
  offset += 2;
  const name_index = view.getUint16(offset);
  offset += 2;
  const descriptor_index = view.getUint16(offset);
  offset += 2;
  const attributes_count = view.getUint16(offset);
  offset += 2;

  const attributes = [];
  for (let i = 0; i < attributes_count; i += 1) {
    const { result, offset: resultOffset } = readAttribute(
      constPool,
      view,
      offset
    );
    attributes.push(result);
    offset = resultOffset;
  }

  return {
    result: {
      access_flags,
      name_index,
      descriptor_index,
      attributes_count,
      attributes,
    },
    offset,
  };
}

export function checkPublic(method: MethodType): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_PUBLIC) !== 0;
}

export function checkPrivate(method: MethodType): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_PRIVATE) !== 0;
}

export function checkProtected(method: MethodType): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_PROTECTED) !== 0;
}

export function checkStatic(method: MethodType): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_STATIC) !== 0;
}

export function checkFinal(method: MethodType): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_FINAL) !== 0;
}

export function checkSynchronized(method: MethodType): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_SYNCHRONIZED) !== 0;
}

export function checkBridge(method: MethodType): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_BRIDGE) !== 0;
}

export function checkVarargs(method: MethodType): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_VARARGS) !== 0;
}

export function checkNative(method: MethodType): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_NATIVE) !== 0;
}

export function checkAbstract(method: MethodType): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_ABSTRACT) !== 0;
}

export function checkStrict(method: MethodType): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_STRICT) !== 0;
}

export function checkSynthetic(method: MethodType): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_SYNTHETIC) !== 0;
}
