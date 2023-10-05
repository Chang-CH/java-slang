import {
  CONSTANT_TAG,
  constantTagMap,
} from '#jvm/external/ClassFile/constants/constants';
import {
  ConstantClassInfo,
  ConstantFieldrefInfo,
  ConstantMethodrefInfo,
  ConstantInterfaceMethodrefInfo,
  ConstantStringInfo,
  ConstantIntegerInfo,
  ConstantFloatInfo,
  ConstantLongInfo,
  ConstantDoubleInfo,
  ConstantNameAndTypeInfo,
  ConstantUtf8Info,
  ConstantMethodHandleInfo,
  ConstantMethodTypeInfo,
  ConstantInvokeDynamicInfo,
  ConstantInfo,
} from '#jvm/external/ClassFile/types/constants';
function readConstantClass(
  view: DataView,
  offset: number,
  tag: CONSTANT_TAG
): { result: ConstantClassInfo; offset: number } {
  console.warn('FIXME: not checking constant pool if index exists/is name');
  const nameIndex = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      tag,
      nameIndex,
    },
    offset: offset,
  };
}

function readConstantFieldref(
  view: DataView,
  offset: number,
  tag: CONSTANT_TAG
): { result: ConstantFieldrefInfo; offset: number } {
  console.warn('FIXME: not checking constant pool if index exists/is name');
  const classIndex = view.getUint16(offset);
  offset += 2;

  console.warn('FIXME: not checking constant pool if index exists/is name');
  const nameAndTypeIndex = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      tag,
      classIndex,
      nameAndTypeIndex,
    },
    offset,
  };
}

function readConstantMethodref(
  view: DataView,
  offset: number,
  tag: CONSTANT_TAG
): { result: ConstantMethodrefInfo; offset: number } {
  console.warn('FIXME: not checking constant pool if index exists/is name');
  const classIndex = view.getUint16(offset);
  offset += 2;

  console.warn('FIXME: not checking constant pool if index exists/is name');
  const nameAndTypeIndex = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      tag,
      classIndex,
      nameAndTypeIndex,
    },
    offset,
  };
}

function readConstantInterfaceMethodref(
  view: DataView,
  offset: number,
  tag: CONSTANT_TAG
): { result: ConstantInterfaceMethodrefInfo; offset: number } {
  console.warn('FIXME: not checking constant pool if index exists/is name');
  const classIndex = view.getUint16(offset);
  offset += 2;

  console.warn('FIXME: not checking constant pool if index exists/is name');
  const nameAndTypeIndex = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      tag,
      classIndex,
      nameAndTypeIndex,
    },
    offset,
  };
}

function readConstantString(
  view: DataView,
  offset: number,
  tag: CONSTANT_TAG
): { result: ConstantStringInfo; offset: number } {
  console.warn('FIXME: not checking constant pool if index exists/is name');
  const stringIndex = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      tag,
      stringIndex,
    },
    offset,
  };
}

function readConstantInteger(
  view: DataView,
  offset: number,
  tag: CONSTANT_TAG
): { result: ConstantIntegerInfo; offset: number } {
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
  tag: CONSTANT_TAG
): { result: ConstantFloatInfo; offset: number } {
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
  tag: CONSTANT_TAG
): { result: ConstantLongInfo; offset: number } {
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
  tag: CONSTANT_TAG
): { result: ConstantDoubleInfo; offset: number } {
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
  tag: CONSTANT_TAG
): { result: ConstantNameAndTypeInfo; offset: number } {
  console.warn('FIXME: not checking constant pool if index exists/is name');
  const nameIndex = view.getUint16(offset);
  offset += 2;
  console.warn('FIXME: not checking constant pool if index exists/is name');
  const descriptorIndex = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      tag,
      nameIndex,
      descriptorIndex,
    },
    offset,
  };
}

function readConstantUtf8(
  view: DataView,
  offset: number,
  tag: CONSTANT_TAG
): { result: ConstantUtf8Info; offset: number } {
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
  tag: CONSTANT_TAG
): { result: ConstantMethodHandleInfo; offset: number } {
  const referenceKind = view.getUint8(offset);
  offset += 1;

  console.warn('FIXME: not checking constant pool if index exists/is name');
  const referenceIndex = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      tag,
      referenceKind,
      referenceIndex,
    },
    offset,
  };
}

function readConstantMethodType(
  view: DataView,
  offset: number,
  tag: CONSTANT_TAG
): { result: ConstantMethodTypeInfo; offset: number } {
  console.warn('FIXME: not checking constant pool if index exists/is name');
  const descriptorIndex = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      tag,
      descriptorIndex,
    },
    offset,
  };
}

function readConstantInvokeDynamic(
  view: DataView,
  offset: number,
  tag: CONSTANT_TAG
): { result: ConstantInvokeDynamicInfo; offset: number } {
  console.warn('FIXME: not checking constant pool if index exists/is name');
  const bootstrapMethodAttrIndex = view.getUint16(offset);
  offset += 2;

  console.warn('FIXME: not checking constant pool if index exists/is name');
  const nameAndTypeIndex = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      tag,
      bootstrapMethodAttrIndex,
      nameAndTypeIndex,
    },
    offset,
  };
}

function readConstant(
  view: DataView,
  offset: number,
  tag: CONSTANT_TAG
): { result: any; offset: number } {
  switch (tag) {
    case CONSTANT_TAG.Class:
      return readConstantClass(view, offset, tag);
    case CONSTANT_TAG.Fieldref:
      return readConstantFieldref(view, offset, tag);
    case CONSTANT_TAG.Methodref:
      return readConstantMethodref(view, offset, tag);
    case CONSTANT_TAG.InterfaceMethodref:
      return readConstantInterfaceMethodref(view, offset, tag);
    case CONSTANT_TAG.String:
      return readConstantString(view, offset, tag);
    case CONSTANT_TAG.Integer:
      return readConstantInteger(view, offset, tag);
    case CONSTANT_TAG.Float:
      return readConstantFloat(view, offset, tag);
    case CONSTANT_TAG.Long:
      return readConstantLong(view, offset, tag);
    case CONSTANT_TAG.Double:
      return readConstantDouble(view, offset, tag);
    case CONSTANT_TAG.NameAndType:
      return readConstantNameAndType(view, offset, tag);
    case CONSTANT_TAG.Utf8:
      return readConstantUtf8(view, offset, tag);
    case CONSTANT_TAG.MethodHandle:
      return readConstantMethodHandle(view, offset, tag);
    case CONSTANT_TAG.MethodType:
      return readConstantMethodType(view, offset, tag);
    case CONSTANT_TAG.InvokeDynamic:
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
  constantPoolCount: number
) {
  // constant pool 1 indexed, dummy value at index 0
  const constantPool: ConstantInfo[] = [
    { tag: CONSTANT_TAG.Class, nameIndex: 0 },
  ];

  for (let i = 0; i < constantPoolCount - 1; i += 1) {
    const tag = constantTagMap[view.getUint8(offset)];
    offset += 1;
    const { result, offset: resultOffset } = readConstant(view, offset, tag); // TODO: check index's in readConstant
    constantPool.push(result);

    // Longs and doubles take 2 indexes in the constant pool.
    if (
      result.tag === CONSTANT_TAG.Long ||
      result.tag === CONSTANT_TAG.Double
    ) {
      constantPool.push(result);
      i += 1;
    }

    offset = resultOffset;
  }

  return {
    result: constantPool,
    offset,
  };
}
