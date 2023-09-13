import { constantTag, constantTagMap } from '#constants/ClassFile/constants';
import {
  constant_Class_info,
  constant_Double_info,
  constant_Fieldref_info,
  constant_Float_info,
  constant_Integer_info,
  constant_InterfaceMethodref_info,
  constant_InvokeDynamic_info,
  constant_Long_info,
  constant_MethodHandle_info,
  constant_MethodType_info,
  constant_Methodref_info,
  constant_NameAndType_info,
  constant_String_info,
  constant_Utf8_info,
  ConstantType,
} from '#types/ClassFile/constants';

function readConstantClass(
  view: DataView,
  offset: number,
  tag: constantTag
): { result: constant_Class_info; offset: number } {
  console.warn('FIXME: not checking constant pool if index exists/is name');
  const name_index = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      tag,
      name_index,
    },
    offset: offset,
  };
}

function readConstantFieldref(
  view: DataView,
  offset: number,
  tag: constantTag
): { result: constant_Fieldref_info; offset: number } {
  console.warn('FIXME: not checking constant pool if index exists/is name');
  const class_index = view.getUint16(offset);
  offset += 2;

  console.warn('FIXME: not checking constant pool if index exists/is name');
  const name_and_type_index = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      tag,
      class_index,
      name_and_type_index,
    },
    offset,
  };
}

function readConstantMethodref(
  view: DataView,
  offset: number,
  tag: constantTag
): { result: constant_Methodref_info; offset: number } {
  console.warn('FIXME: not checking constant pool if index exists/is name');
  const class_index = view.getUint16(offset);
  offset += 2;

  console.warn('FIXME: not checking constant pool if index exists/is name');
  const name_and_type_index = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      tag,
      class_index,
      name_and_type_index,
    },
    offset,
  };
}

function readConstantInterfaceMethodref(
  view: DataView,
  offset: number,
  tag: constantTag
): { result: constant_InterfaceMethodref_info; offset: number } {
  console.warn('FIXME: not checking constant pool if index exists/is name');
  const class_index = view.getUint16(offset);
  offset += 2;

  console.warn('FIXME: not checking constant pool if index exists/is name');
  const name_and_type_index = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      tag,
      class_index,
      name_and_type_index,
    },
    offset,
  };
}

function readConstantString(
  view: DataView,
  offset: number,
  tag: constantTag
): { result: constant_String_info; offset: number } {
  console.warn('FIXME: not checking constant pool if index exists/is name');
  const string_index = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      tag,
      string_index,
    },
    offset,
  };
}

function readConstantInteger(
  view: DataView,
  offset: number,
  tag: constantTag
): { result: constant_Integer_info; offset: number } {
  const value = view.getUint32(offset);
  offset += 4;

  return {
    result: {
      tag,
      value,
    },
    offset,
  };
}

function readConstantFloat(
  view: DataView,
  offset: number,
  tag: constantTag
): { result: constant_Float_info; offset: number } {
  const value = view.getFloat32(offset);
  offset += 4;

  return {
    result: {
      tag,
      value,
    },
    offset,
  };
}

function readConstantLong(
  view: DataView,
  offset: number,
  tag: constantTag
): { result: constant_Long_info; offset: number } {
  const value = view.getBigUint64(offset);
  offset += 8;

  return {
    result: {
      tag,
      value,
    },
    offset,
  };
}

function readConstantDouble(
  view: DataView,
  offset: number,
  tag: constantTag
): { result: constant_Double_info; offset: number } {
  const value = view.getFloat64(offset);
  offset += 8;

  return {
    result: {
      tag,
      value,
    },
    offset,
  };
}

function readConstantNameAndType(
  view: DataView,
  offset: number,
  tag: constantTag
): { result: constant_NameAndType_info; offset: number } {
  console.warn('FIXME: not checking constant pool if index exists/is name');
  const name_index = view.getUint16(offset);
  offset += 2;
  console.warn('FIXME: not checking constant pool if index exists/is name');
  const descriptor_index = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      tag,
      name_index,
      descriptor_index,
    },
    offset,
  };
}

function readConstantUtf8(
  view: DataView,
  offset: number,
  tag: constantTag
): { result: constant_Utf8_info; offset: number } {
  const length = view.getUint16(offset);
  offset += 2;

  const bytes = [];
  for (let i = 0; i < length; i += 1) {
    bytes.push(view.getUint8(offset));
    offset += 1;
  }

  const value = bytes.map(char => String.fromCharCode(char)).join('');

  return {
    result: {
      tag,
      length,
      value,
    },
    offset,
  };
}

function readConstantMethodHandle(
  view: DataView,
  offset: number,
  tag: constantTag
): { result: constant_MethodHandle_info; offset: number } {
  const reference_kind = view.getUint8(offset);
  offset += 1;

  console.warn('FIXME: not checking constant pool if index exists/is name');
  const reference_index = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      tag,
      reference_kind,
      reference_index,
    },
    offset,
  };
}

function readConstantMethodType(
  view: DataView,
  offset: number,
  tag: constantTag
): { result: constant_MethodType_info; offset: number } {
  console.warn('FIXME: not checking constant pool if index exists/is name');
  const descriptor_index = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      tag,
      descriptor_index,
    },
    offset,
  };
}

function readConstantInvokeDynamic(
  view: DataView,
  offset: number,
  tag: constantTag
): { result: constant_InvokeDynamic_info; offset: number } {
  console.warn('FIXME: not checking constant pool if index exists/is name');
  const bootstrap_method_attr_index = view.getUint16(offset);
  offset += 2;

  console.warn('FIXME: not checking constant pool if index exists/is name');
  const name_and_type_index = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      tag,
      bootstrap_method_attr_index,
      name_and_type_index,
    },
    offset,
  };
}

function readConstant(
  view: DataView,
  offset: number,
  tag: constantTag
): { result: any; offset: number } {
  switch (tag) {
    case constantTag.constant_Class:
      return readConstantClass(view, offset, tag);
    case constantTag.constant_Fieldref:
      return readConstantFieldref(view, offset, tag);
    case constantTag.constant_Methodref:
      return readConstantMethodref(view, offset, tag);
    case constantTag.constant_InterfaceMethodref:
      return readConstantInterfaceMethodref(view, offset, tag);
    case constantTag.constant_String:
      return readConstantString(view, offset, tag);
    case constantTag.constant_Integer:
      return readConstantInteger(view, offset, tag);
    case constantTag.constant_Float:
      return readConstantFloat(view, offset, tag);
    case constantTag.constant_Long:
      return readConstantLong(view, offset, tag);
    case constantTag.constant_Double:
      return readConstantDouble(view, offset, tag);
    case constantTag.constant_NameAndType:
      return readConstantNameAndType(view, offset, tag);
    case constantTag.constant_Utf8:
      return readConstantUtf8(view, offset, tag);
    case constantTag.constant_MethodHandle:
      return readConstantMethodHandle(view, offset, tag);
    case constantTag.constant_MethodType:
      return readConstantMethodType(view, offset, tag);
    case constantTag.constant_InvokeDynamic:
      return readConstantInvokeDynamic(view, offset, tag);
    default:
      return {
        result: {},
        offset: offset,
      };
  }
}

export function readConstants(
  view: DataView,
  offset: number,
  constant_pool_count: number
) {
  // constant pool 1 indexed, dummy value at index 0
  const constant_pool: ConstantType[] = [
    { tag: constantTag.constant_Class, name_index: 0 },
  ];

  for (let i = 0; i < constant_pool_count - 1; i += 1) {
    const tag = constantTagMap[view.getUint8(offset)];
    offset += 1;
    const { result, offset: resultOffset } = readConstant(view, offset, tag); // TODO: check index's in readConstant
    constant_pool.push(result);

    // Longs and doubles take 2 indexes in the constant pool.
    if (
      result.tag === constantTag.constant_Long ||
      result.tag === constantTag.constant_Double
    ) {
      constant_pool.push(result);
      i += 1;
    }

    offset = resultOffset;
  }

  return {
    result: constant_pool,
    offset,
  };
}
