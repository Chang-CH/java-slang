// @ts-nocheck
import { readAttribute } from '#utils/parseBinary/utils/readAttributes';
import { readConstants } from '#utils/parseBinary/utils/readConstants';
import { readField } from '#utils/parseBinary/utils/readField';
import { readMethod, getMethodName } from '#utils/parseBinary/utils/readMethod';
import { ClassFile } from '#types/ClassFile';
import {
  constant_Class_info,
  constant_Utf8_info,
} from '#types/ClassFile/constants';

export default function parseBin(view: DataView) {
  let offset = 0;

  const cls: ClassFile = {
    magic: 0,
    minor_version: 0,
    major_version: 0,
    constant_pool: [],
    access_flags: 0,
    this_class: '',
    super_class: '',
    interfaces: [],
    fields: {},
    methods: {},
    attributes: [],
  };

  cls.magic = view.getUint32(offset);
  offset += 4;

  cls.minor_version = view.getUint16(offset);
  offset += 2;

  cls.major_version = view.getUint16(offset);
  offset += 2;

  const constant_pool_count = view.getUint16(offset);
  offset += 2;

  ({ result: cls.constant_pool, offset } = readConstants(
    view,
    offset,
    constant_pool_count
  ));

  cls.access_flags = view.getUint16(offset);
  offset += 2;

  const classIndex = cls.constant_pool[
    view.getUint16(offset)
  ] as constant_Class_info;
  const className = cls.constant_pool[
    classIndex.name_index
  ] as constant_Utf8_info;
  cls.this_class = className.value;
  offset += 2;

  const superClassIndex = cls.constant_pool[
    view.getUint16(offset)
  ] as constant_Class_info;
  const superClassName = cls.constant_pool[
    superClassIndex.name_index
  ] as constant_Utf8_info;
  cls.super_class = superClassName.value;
  offset += 2;

  const interfaces_count = view.getUint16(offset);
  offset += 2;
  cls.interfaces = [];
  for (let i = 0; i < interfaces_count; i += 1) {
    const interface_idx = cls.constant_pool[
      view.getUint16(offset)
    ] as constant_Class_info;
    const className = cls.constant_pool[
      interface_idx.name_index
    ] as constant_Utf8_info;
    cls.interfaces.push(className.value);
    // TODO: check index ok
    offset += 2;
  }

  const fields_count = view.getUint16(offset);
  offset += 2;

  cls.fields = {};
  for (let i = 0; i < fields_count; i += 1) {
    const { result, offset: resultOffset } = readField(
      cls.constant_pool,
      view,
      offset
    );
    const fieldName = cls.constant_pool[
      result.name_index
    ] as constant_Utf8_info;
    const fieldDesc = cls.constant_pool[
      result.descriptor_index
    ] as constant_Utf8_info;
    cls.fields[fieldName.value + fieldDesc.value] = result;
    offset = resultOffset;
  }

  const methods_count = view.getUint16(offset);
  offset += 2;

  cls.methods = {};
  for (let i = 0; i < methods_count; i += 1) {
    const { result, offset: resultOffset } = readMethod(
      cls.constant_pool,
      view,
      offset
    );

    cls.methods[getMethodName(result, cls.constant_pool)] = result;
    offset = resultOffset;
  }

  const attributes_count = view.getUint16(offset);
  offset += 2;

  cls.attributes = [];
  // TODO: get attributes
  for (let i = 0; i < attributes_count; i += 1) {
    const { result, offset: resultOffset } = readAttribute(
      cls.constant_pool,
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
