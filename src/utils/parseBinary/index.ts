// @ts-nocheck
import { readAttribute } from '#utils/parseBinary/utils/readAttributes';
import { readConstants } from '#utils/parseBinary/utils/readConstants';
import { readField } from '#utils/parseBinary/utils/readField';
import { readMethod, getMethodName } from '#utils/parseBinary/utils/readMethod';
import { ClassFile } from '#jvm/external/ClassFile';
import {
  constantClassInfo,
  constantUtf8Info,
} from '#jvm/external/ClassFile/constants';

export default function parseBin(view: DataView) {
  let offset = 0;

  const cls: ClassFile = {
    magic: 0,
    minorVersion: 0,
    majorVersion: 0,
    constantPool: [],
    accessFlags: 0,
    thisClass: '',
    superClass: '',
    interfaces: [],
    fields: {},
    methods: {},
    attributes: [],
  };

  cls.magic = view.getUint32(offset);
  offset += 4;

  cls.minorVersion = view.getUint16(offset);
  offset += 2;

  cls.majorVersion = view.getUint16(offset);
  offset += 2;

  const constantPoolCount = view.getUint16(offset);
  offset += 2;

  ({ result: cls.constantPool, offset } = readConstants(
    view,
    offset,
    constantPoolCount
  ));

  cls.accessFlags = view.getUint16(offset);
  offset += 2;

  cls.thisClass = view.getUint16(offset);
  offset += 2;

  cls.superClass = view.getUint16(offset);
  offset += 2;

  const interfacesCount = view.getUint16(offset);
  offset += 2;
  cls.interfaces = [];
  for (let i = 0; i < interfacesCount; i += 1) {
    const interfaceIdx = cls.constantPool[
      view.getUint16(offset)
    ] as constantClassInfo;
    const className = cls.constantPool[
      interfaceIdx.nameIndex
    ] as constantUtf8Info;
    cls.interfaces.push(className.value);
    // TODO: check index ok
    offset += 2;
  }

  const fieldsCount = view.getUint16(offset);
  offset += 2;

  cls.fields = {};
  for (let i = 0; i < fieldsCount; i += 1) {
    const { result, offset: resultOffset } = readField(
      cls.constantPool,
      view,
      offset
    );
    const fieldName = cls.constantPool[result.nameIndex] as constantUtf8Info;
    const fieldDesc = cls.constantPool[
      result.descriptorIndex
    ] as constantUtf8Info;
    cls.fields[fieldName.value + fieldDesc.value] = result;
    offset = resultOffset;
  }

  const methodsCount = view.getUint16(offset);
  offset += 2;

  cls.methods = {};
  for (let i = 0; i < methodsCount; i += 1) {
    const { result, offset: resultOffset } = readMethod(
      cls.constantPool,
      view,
      offset
    );

    cls.methods[getMethodName(result, cls.constantPool)] = result;
    offset = resultOffset;
  }

  const attributesCount = view.getUint16(offset);
  offset += 2;

  cls.attributes = [];
  // TODO: get attributes
  for (let i = 0; i < attributesCount; i += 1) {
    const { result, offset: resultOffset } = readAttribute(
      cls.constantPool,
      view,
      offset
    );
    cls.attributes.push(result);
    offset = resultOffset;
  }

  return cls;
}

/**
 * Converts a NodeJS Buffer to an ArrayBuffer
 *
 * @param buffer nodejs buffer
 * @returns ArrayBuffer equivalent
 */
export function a2ab(buffer: Buffer) {
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
}
