import {
  AttributeInfo,
  CodeAttribute,
} from '#jvm/external/ClassFile/types/attributes';
import {
  ConstantInfo,
  ConstantUtf8Info,
} from '#jvm/external/ClassFile/types/constants';
import {
  METHOD_FLAGS,
  MethodInfo,
} from '#jvm/external/ClassFile/types/methods';
import { MethodRef } from '#types/ConstantRef';
import { readAttribute } from './readAttributes';

export function readMethod(
  constPool: Array<ConstantInfo>,
  view: DataView,
  offset: number
): { result: MethodInfo; offset: number } {
  const accessFlags = view.getUint16(offset);
  offset += 2;
  const nameIndex = view.getUint16(offset);
  offset += 2;
  const descriptorIndex = view.getUint16(offset);
  offset += 2;
  const attributesCount = view.getUint16(offset);
  offset += 2;

  const attributes = [];
  let code: CodeAttribute | null | undefined;

  for (let i = 0; i < attributesCount; i += 1) {
    const { result, offset: resultOffset } = readAttribute(
      constPool,
      view,
      offset
    );

    attributes.push(result as unknown as AttributeInfo);
    offset = resultOffset;
  }

  const name = (constPool[nameIndex] as ConstantUtf8Info).value;
  const descriptor = (constPool[descriptorIndex] as ConstantUtf8Info).value;
  return {
    result: {
      accessFlags,
      name,
      descriptor,
      attributes,
      nameIndex: nameIndex,
      descriptorIndex: descriptorIndex,
      attributesCount: attributesCount,
    },
    offset,
  };
}

export function getMethodName(
  method: MethodInfo,
  constPool: Array<ConstantInfo>
): string {
  return method.name + method.descriptor;
}

export function checkPublic(method: MethodRef): boolean {
  return (method.accessFlags & METHOD_FLAGS.ACC_PUBLIC) !== 0;
}

export function checkPrivate(method: MethodRef): boolean {
  return (method.accessFlags & METHOD_FLAGS.ACC_PRIVATE) !== 0;
}

export function checkProtected(method: MethodRef): boolean {
  return (method.accessFlags & METHOD_FLAGS.ACC_PROTECTED) !== 0;
}

export function checkStatic(method: MethodRef): boolean {
  return (method.accessFlags & METHOD_FLAGS.ACC_STATIC) !== 0;
}

export function checkFinal(method: MethodRef): boolean {
  return (method.accessFlags & METHOD_FLAGS.ACC_FINAL) !== 0;
}

export function checkSynchronized(method: MethodRef): boolean {
  return (method.accessFlags & METHOD_FLAGS.ACC_SYNCHRONIZED) !== 0;
}

export function checkBridge(method: MethodRef): boolean {
  return (method.accessFlags & METHOD_FLAGS.ACC_BRIDGE) !== 0;
}

export function checkVarargs(method: MethodRef): boolean {
  return (method.accessFlags & METHOD_FLAGS.ACC_VARARGS) !== 0;
}

export function checkNative(method: MethodRef): boolean {
  return (method.accessFlags & METHOD_FLAGS.ACC_NATIVE) !== 0;
}

export function checkAbstract(method: MethodRef): boolean {
  return (method.accessFlags & METHOD_FLAGS.ACC_ABSTRACT) !== 0;
}

export function checkStrict(method: MethodRef): boolean {
  return (method.accessFlags & METHOD_FLAGS.ACC_STRICT) !== 0;
}

export function checkSynthetic(method: MethodRef): boolean {
  return (method.accessFlags & METHOD_FLAGS.ACC_SYNTHETIC) !== 0;
}
