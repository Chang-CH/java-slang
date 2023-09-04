import { ConstantType } from '#types/ClassFile/constants';
import { FIELD_FLAGS, FieldType } from '#types/ClassFile/fields';
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
      attributes,
    },
    offset,
  };
}

export function checkPublic(field: FieldType): boolean {
  return (field.access_flags & FIELD_FLAGS.ACC_PUBLIC) !== 0;
}

export function checkPrivate(field: FieldType): boolean {
  return (field.access_flags & FIELD_FLAGS.ACC_PRIVATE) !== 0;
}

export function checkProtected(field: FieldType): boolean {
  return (field.access_flags & FIELD_FLAGS.ACC_PROTECTED) !== 0;
}

export function checkStatic(field: FieldType): boolean {
  return (field.access_flags & FIELD_FLAGS.ACC_STATIC) !== 0;
}

export function checkFinal(field: FieldType): boolean {
  return (field.access_flags & FIELD_FLAGS.ACC_FINAL) !== 0;
}

export function checkVolatile(field: FieldType): boolean {
  return (field.access_flags & FIELD_FLAGS.ACC_VOLATILE) !== 0;
}

export function checkTransient(field: FieldType): boolean {
  return (field.access_flags & FIELD_FLAGS.ACC_TRANSIENT) !== 0;
}

export function checkSynthetic(field: FieldType): boolean {
  return (field.access_flags & FIELD_FLAGS.ACC_SYNTHETIC) !== 0;
}
