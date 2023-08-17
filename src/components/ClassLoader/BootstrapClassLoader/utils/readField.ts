import { ConstantType } from '#types/ClassFile/constants';
import { FieldType } from '#types/ClassFile/fields';
import { readAttribute } from './readAttributes';

export function readField(
  constPool: Array<ConstantType>,
  view: DataView,
  offset: number
): { result: FieldType; offset: number } {
  const access_flags = view.getUint16(offset);
  offset += 2;

  const name_index = view.getUint16(offset);
  offset += 2;

  const descriptor_index = view.getUint16(offset);
  offset += 2;

  const attributes_count = view.getUint16(offset);
  offset += 2;

  //@ts-ignore
  const attributes = [];

  for (let i = 0; i < attributes_count; i += 1) {
    const { result, offset: newOffset } = readAttribute(
      constPool,
      view,
      offset
    );

    // TODO: only some attributes are recognised, should ignore non recognised
    attributes.push(result);
    offset = newOffset;
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
