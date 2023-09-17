import {
  CONSTANT_TAG,
  CONSTANT_TAGMap,
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
  ConstantType,
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
    case CONSTANT_TAG.constantClass:
      return readConstantClass(view, offset, tag);
    case CONSTANT_TAG.constantFieldref:
      return readConstantFieldref(view, offset, tag);
    case CONSTANT_TAG.constantMethodref:
      return readConstantMethodref(view, offset, tag);
    case CONSTANT_TAG.constantInterfaceMethodref:
      return readConstantInterfaceMethodref(view, offset, tag);
    case CONSTANT_TAG.constantString:
      return readConstantString(view, offset, tag);
    case CONSTANT_TAG.constantInteger:
      return readConstantInteger(view, offset, tag);
    case CONSTANT_TAG.constantFloat:
      return readConstantFloat(view, offset, tag);
    case CONSTANT_TAG.constantLong:
      return readConstantLong(view, offset, tag);
    case CONSTANT_TAG.constantDouble:
      return readConstantDouble(view, offset, tag);
    case CONSTANT_TAG.constantNameAndType:
      return readConstantNameAndType(view, offset, tag);
    case CONSTANT_TAG.constantUtf8:
      return readConstantUtf8(view, offset, tag);
    case CONSTANT_TAG.constantMethodHandle:
      return readConstantMethodHandle(view, offset, tag);
    case CONSTANT_TAG.constantMethodType:
      return readConstantMethodType(view, offset, tag);
    case CONSTANT_TAG.constantInvokeDynamic:
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
  const constantPool: ConstantType[] = [
    { tag: CONSTANT_TAG.constantClass, nameIndex: 0 },
  ];

  for (let i = 0; i < constantPoolCount - 1; i += 1) {
    const tag = CONSTANT_TAGMap[view.getUint8(offset)];
    offset += 1;
    const { result, offset: resultOffset } = readConstant(view, offset, tag); // TODO: check index's in readConstant
    constantPool.push(result);

    // Longs and doubles take 2 indexes in the constant pool.
    if (
      result.tag === CONSTANT_TAG.constantLong ||
      result.tag === CONSTANT_TAG.constantDouble
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
