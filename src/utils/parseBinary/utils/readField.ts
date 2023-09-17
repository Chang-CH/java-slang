import { ConstantType } from '#jvm/external/ClassFile/types/constants';
import { FieldType, FIELDFLAGS } from '#jvm/external/ClassFile/types/fields';
import { readAttribute } from './readAttributes';

export function readField(
  constPool: Array<ConstantType>,
  view: DataView,
  offset: number
): { result: FieldType; offset: number } {
  const accessFlags = view.getUint16(offset);
  offset += 2;

  const nameIndex = view.getUint16(offset);
  offset += 2;

  const descriptorIndex = view.getUint16(offset);
  offset += 2;

  const attributesCount = view.getUint16(offset);
  offset += 2;

  //@ts-ignore
  const attributes = [];

  for (let i = 0; i < attributesCount; i += 1) {
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
      accessFlags,
      nameIndex,
      descriptorIndex,
      attributes,
    },
    offset,
  };
}

export function checkPublic(field: FieldType): boolean {
  return (field.accessFlags & FIELDFLAGS.ACCPUBLIC) !== 0;
}

export function checkPrivate(field: FieldType): boolean {
  return (field.accessFlags & FIELDFLAGS.ACCPRIVATE) !== 0;
}

export function checkProtected(field: FieldType): boolean {
  return (field.accessFlags & FIELDFLAGS.ACCPROTECTED) !== 0;
}

export function checkStatic(field: FieldType): boolean {
  return (field.accessFlags & FIELDFLAGS.ACCSTATIC) !== 0;
}

export function checkFinal(field: FieldType): boolean {
  return (field.accessFlags & FIELDFLAGS.ACCFINAL) !== 0;
}

export function checkVolatile(field: FieldType): boolean {
  return (field.accessFlags & FIELDFLAGS.ACCVOLATILE) !== 0;
}

export function checkTransient(field: FieldType): boolean {
  return (field.accessFlags & FIELDFLAGS.ACCTRANSIENT) !== 0;
}

export function checkSynthetic(field: FieldType): boolean {
  return (field.accessFlags & FIELDFLAGS.ACCSYNTHETIC) !== 0;
}
