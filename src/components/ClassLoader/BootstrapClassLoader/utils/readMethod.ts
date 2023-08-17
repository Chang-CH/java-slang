import { ConstantType } from '#types/ClassFile/constants';
import { MethodType } from '#types/ClassFile/methods';
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
