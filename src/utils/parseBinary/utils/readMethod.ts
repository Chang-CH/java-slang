import { AttributeCode } from '#jvm/external/ClassFile/types/attributes';
import {
  ConstantType,
  ConstantUtf8Info,
} from '#jvm/external/ClassFile/types/constants';
import { METHODFLAGS, MethodRef } from '#jvm/external/ClassFile/types/methods';
import { readAttribute } from './readAttributes';

export function readMethod(
  constPool: Array<ConstantType>,
  view: DataView,
  offset: number
): { result: MethodRef; offset: number } {
  const accessFlags = view.getUint16(offset);
  offset += 2;
  const nameIndex = view.getUint16(offset);
  offset += 2;
  const descriptorIndex = view.getUint16(offset);
  offset += 2;
  const attributesCount = view.getUint16(offset);
  offset += 2;

  const attributes = [];
  let code: AttributeCode | null | undefined;

  for (let i = 0; i < attributesCount; i += 1) {
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

  const name = (constPool[nameIndex] as ConstantUtf8Info).value;
  const descriptor = (constPool[descriptorIndex] as ConstantUtf8Info).value;
  return {
    result: {
      accessFlags,
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
  return (method.accessFlags & METHODFLAGS.ACCPUBLIC) !== 0;
}

export function checkPrivate(method: MethodRef): boolean {
  return (method.accessFlags & METHODFLAGS.ACCPRIVATE) !== 0;
}

export function checkProtected(method: MethodRef): boolean {
  return (method.accessFlags & METHODFLAGS.ACCPROTECTED) !== 0;
}

export function checkStatic(method: MethodRef): boolean {
  return (method.accessFlags & METHODFLAGS.ACCSTATIC) !== 0;
}

export function checkFinal(method: MethodRef): boolean {
  return (method.accessFlags & METHODFLAGS.ACCFINAL) !== 0;
}

export function checkSynchronized(method: MethodRef): boolean {
  return (method.accessFlags & METHODFLAGS.ACCSYNCHRONIZED) !== 0;
}

export function checkBridge(method: MethodRef): boolean {
  return (method.accessFlags & METHODFLAGS.ACCBRIDGE) !== 0;
}

export function checkVarargs(method: MethodRef): boolean {
  return (method.accessFlags & METHODFLAGS.ACCVARARGS) !== 0;
}

export function checkNative(method: MethodRef): boolean {
  return (method.accessFlags & METHODFLAGS.ACCNATIVE) !== 0;
}

export function checkAbstract(method: MethodRef): boolean {
  return (method.accessFlags & METHODFLAGS.ACCABSTRACT) !== 0;
}

export function checkStrict(method: MethodRef): boolean {
  return (method.accessFlags & METHODFLAGS.ACCSTRICT) !== 0;
}

export function checkSynthetic(method: MethodRef): boolean {
  return (method.accessFlags & METHODFLAGS.ACCSYNTHETIC) !== 0;
}
