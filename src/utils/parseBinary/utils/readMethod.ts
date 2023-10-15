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
