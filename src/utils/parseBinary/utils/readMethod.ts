import { AttributeCode } from '#types/ClassFile/attributes';
import { constant_Utf8_info, ConstantType } from '#types/ClassFile/constants';
import { METHOD_FLAGS, MethodRef } from '#types/ClassFile/methods';
import { readAttribute } from './readAttributes';

export function readMethod(
  constPool: Array<ConstantType>,
  view: DataView,
  offset: number
): { result: MethodRef; offset: number } {
  const access_flags = view.getUint16(offset);
  offset += 2;
  const name_index = view.getUint16(offset);
  offset += 2;
  const descriptor_index = view.getUint16(offset);
  offset += 2;
  const attributes_count = view.getUint16(offset);
  offset += 2;

  const attributes = [];
  let code: AttributeCode | null | undefined;

  for (let i = 0; i < attributes_count; i += 1) {
    const { result, offset: resultOffset } = readAttribute(
      constPool,
      view,
      offset
    );

    attributes.push(result);
    if (result.code) {
      code = result as AttributeCode;
    }
    offset = resultOffset;
  }

  if (!code) {
    // native code
    code = null;
  }

  const name = (constPool[name_index] as constant_Utf8_info).value;
  const descriptor = (constPool[descriptor_index] as constant_Utf8_info).value;
  return {
    result: {
      access_flags,
      name,
      descriptor,
      attributes,
      code,
    },
    offset,
  };
}

export function getMethodName(
  method: MethodRef,
  constPool: Array<ConstantType>
): string {
  return method.name + method.descriptor;
}

export function checkPublic(method: MethodRef): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_PUBLIC) !== 0;
}

export function checkPrivate(method: MethodRef): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_PRIVATE) !== 0;
}

export function checkProtected(method: MethodRef): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_PROTECTED) !== 0;
}

export function checkStatic(method: MethodRef): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_STATIC) !== 0;
}

export function checkFinal(method: MethodRef): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_FINAL) !== 0;
}

export function checkSynchronized(method: MethodRef): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_SYNCHRONIZED) !== 0;
}

export function checkBridge(method: MethodRef): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_BRIDGE) !== 0;
}

export function checkVarargs(method: MethodRef): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_VARARGS) !== 0;
}

export function checkNative(method: MethodRef): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_NATIVE) !== 0;
}

export function checkAbstract(method: MethodRef): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_ABSTRACT) !== 0;
}

export function checkStrict(method: MethodRef): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_STRICT) !== 0;
}

export function checkSynthetic(method: MethodRef): boolean {
  return (method.access_flags & METHOD_FLAGS.ACC_SYNTHETIC) !== 0;
}
