import { PREDEF_ATTRIB } from '#constants/ClassFile/attributes';
import { AttributeCode, ExceptionType } from '#types/ClassFile/attributes';
import { ConstantType, CONSTANT_Utf8_info } from '#types/ClassFile/constants';
import { InstructionType } from '#types/ClassFile/instructions';
import { readInstructions } from './readInstruction';

export function readAttribute(
  constPool: Array<ConstantType>,
  view: DataView,
  offset: number
): { result: { [key: string]: any }; offset: number } {
  const attribute_name_index = view.getUint16(offset);
  offset += 2;

  // TODO: in theory we should check the constant pool:
  // checkConstantPool(constPool, attribute_name_index, CONSTANT_TAG.CONSTANT_Utf8);

  const constant_attribute_name: CONSTANT_Utf8_info = constPool[
    attribute_name_index
  ] as CONSTANT_Utf8_info;

  // @ts-ignore FIXME: check type is predef
  const Attrib: number = PREDEF_ATTRIB[constant_attribute_name.value];
  const attribute_length = view.getUint32(offset);
  offset += 4;

  switch (Attrib) {
    case PREDEF_ATTRIB.ConstantValue:
      return readAttributeConstantValue(
        constPool,
        attribute_name_index,
        attribute_length,
        view,
        offset
      );
    case PREDEF_ATTRIB.Code:
      return readAttributeCode(
        constPool,
        attribute_name_index,
        attribute_length,
        view,
        offset
      );
    case PREDEF_ATTRIB.StackMapTable:
      return readAttributeStackMapTable(
        constPool,
        attribute_name_index,
        attribute_length,
        view,
        offset
      );
    case PREDEF_ATTRIB.Exceptions:
      return readAttributeExceptions(
        constPool,
        attribute_name_index,
        attribute_length,
        view,
        offset
      );
    case PREDEF_ATTRIB.InnerClasses:
      return readAttributeInnerClasses(
        constPool,
        attribute_name_index,
        attribute_length,
        view,
        offset
      );
    case PREDEF_ATTRIB.EnclosingMethod:
      return readAttributeEnclosingMethod(
        constPool,
        attribute_name_index,
        attribute_length,
        view,
        offset
      );
    case PREDEF_ATTRIB.Synthetic:
      return readAttributeSynthetic(
        constPool,
        attribute_name_index,
        attribute_length,
        view,
        offset
      );
    case PREDEF_ATTRIB.Signature:
      return readAttributeSignature(
        constPool,
        attribute_name_index,
        attribute_length,
        view,
        offset
      );
    case PREDEF_ATTRIB.SourceFile:
      return readAttributeSourceFile(
        constPool,
        attribute_name_index,
        attribute_length,
        view,
        offset
      );
    case PREDEF_ATTRIB.SourceDebugExtension:
      return readAttributeSourceDebugExtension(
        constPool,
        attribute_name_index,
        attribute_length,
        view,
        offset
      );
    case PREDEF_ATTRIB.LineNumberTable:
      return readAttributeLineNumberTable(
        constPool,
        attribute_name_index,
        attribute_length,
        view,
        offset
      );
    case PREDEF_ATTRIB.LocalVariableTable:
      return readAttributeLocalVariableTable(
        constPool,
        attribute_name_index,
        attribute_length,
        view,
        offset
      );
    case PREDEF_ATTRIB.LocalVariableTypeTable:
      return readAttributeLocalVariableTypeTable(
        constPool,
        attribute_name_index,
        attribute_length,
        view,
        offset
      );
    case PREDEF_ATTRIB.Deprecated:
      return readAttributeDeprecated(
        constPool,
        attribute_name_index,
        attribute_length,
        view,
        offset
      );
    case PREDEF_ATTRIB.RuntimeVisibleAnnotations:
      return readAttributeRuntimeVisibleAnnotations(
        constPool,
        attribute_name_index,
        attribute_length,
        view,
        offset
      );
    case PREDEF_ATTRIB.RuntimeInvisibleAnnotations:
      return readAttributeRuntimeInvisibleAnnotations(
        constPool,
        attribute_name_index,
        attribute_length,
        view,
        offset
      );
    case PREDEF_ATTRIB.RuntimeVisibleParameterAnnotations:
      return readAttributeRuntimeVisibleParameterAnnotations(
        constPool,
        attribute_name_index,
        attribute_length,
        view,
        offset
      );
    case PREDEF_ATTRIB.RuntimeInvisibleParameterAnnotations:
      return readAttributeRuntimeInvisibleParameterAnnotations(
        constPool,
        attribute_name_index,
        attribute_length,
        view,
        offset
      );
    case PREDEF_ATTRIB.AnnotationDefault:
      return readAttributeAnnotationDefault(
        constPool,
        attribute_name_index,
        attribute_length,
        view,
        offset
      );
    case PREDEF_ATTRIB.BootstrapMethods:
      return readAttributeBootstrapMethods(
        constPool,
        attribute_name_index,
        attribute_length,
        view,
        offset
      );
    default:
      return readAttributeGeneric(
        constPool,
        attribute_name_index,
        attribute_length,
        view,
        offset
      );
  }
}

function readAttributeConstantValue(
  constantPool: Array<ConstantType>,
  attribute_name_index: number,
  attribute_length: number,
  view: DataView,
  offset: number
) {
  const constantvalue_index = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      attribute_name_index,
      constantvalue_index,
    },
    offset,
  };
}

function readAttributeCode(
  constantPool: Array<ConstantType>,
  attribute_name_index: number,
  attribute_length: number,
  view: DataView,
  offset: number
): {
  result: AttributeCode;
  offset: number;
} {
  const max_stack = view.getUint16(offset);
  offset += 2;
  const max_locals = view.getUint16(offset);
  offset += 2;
  const code_length = view.getUint32(offset); // size in bytes
  offset += 4;

  if (code_length <= 0 || code_length >= 65536) {
    throw new Error('Class format error: Code attribute invalid length');
  }

  const code = new DataView(view.buffer, offset, code_length);
  offset += code_length;

  const exception_table_length = view.getUint16(offset);
  offset += 2;

  const exception_table: ExceptionType[] = [];
  for (let i = 0; i < exception_table_length; i++) {
    const start_pc = view.getUint16(offset);
    offset += 2;
    const end_pc = view.getUint16(offset);
    offset += 2;
    const handler_pc = view.getUint16(offset);
    offset += 2;
    const catch_type = view.getUint16(offset);
    offset += 2;
    exception_table.push({ start_pc, end_pc, handler_pc, catch_type });
  }

  const attributes_count = view.getUint16(offset);
  offset += 2;

  const attributes = [];
  for (let i = 0; i < attributes_count; i++) {
    const { result, offset: resultOffset } = readAttribute(
      constantPool,
      view,
      offset
    );
    attributes.push(result);
    offset = resultOffset;
  }

  return {
    result: {
      attribute_name_index,
      max_stack,
      max_locals,
      code,
      exception_table,
      attributes,
    },
    offset,
  };
}

function readAttributeStackMapTable(
  constantPool: Array<ConstantType>,
  attribute_name_index: number,
  attribute_length: number,
  view: DataView,
  offset: number
) {
  console.warn('TODO: AttributeStackMapTable is not implemented!');
  const info = [];

  for (let i = 0; i < attribute_length; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attribute_name_index,
      info,
    },
    offset,
  };
}
function readAttributeExceptions(
  constantPool: Array<ConstantType>,
  attribute_name_index: number,
  attribute_length: number,
  view: DataView,
  offset: number
) {
  console.warn('TODO: readAttributeExceptions is not implemented!');
  const info = [];

  for (let i = 0; i < attribute_length; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attribute_name_index,
      info,
    },
    offset,
  };
}
function readAttributeInnerClasses(
  constantPool: Array<ConstantType>,
  attribute_name_index: number,
  attribute_length: number,
  view: DataView,
  offset: number
) {
  console.warn('reaTODO: dAttributeInnerClasses is not implemented!');
  const info = [];

  for (let i = 0; i < attribute_length; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attribute_name_index,
      info,
    },
    offset,
  };
}
function readAttributeEnclosingMethod(
  constantPool: Array<ConstantType>,
  attribute_name_index: number,
  attribute_length: number,
  view: DataView,
  offset: number
) {
  console.warn('readAtTODO: tributeEnclosingMethod is not implemented!');
  const info = [];

  for (let i = 0; i < attribute_length; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attribute_name_index,
      info,
    },
    offset,
  };
}
function readAttributeSynthetic(
  constantPool: Array<ConstantType>,
  attribute_name_index: number,
  attribute_length: number,
  view: DataView,
  offset: number
) {
  console.warn('TODO: readAttributeSynthetic is not implemented!');
  const info = [];

  for (let i = 0; i < attribute_length; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attribute_name_index,
      info,
    },
    offset,
  };
}
function readAttributeSignature(
  constantPool: Array<ConstantType>,
  attribute_name_index: number,
  attribute_length: number,
  view: DataView,
  offset: number
) {
  console.warn('TODO: readAttributeSignature is not implemented!');
  const info = [];

  for (let i = 0; i < attribute_length; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attribute_name_index,
      info,
    },
    offset,
  };
}
function readAttributeSourceFile(
  constantPool: Array<ConstantType>,
  attribute_name_index: number,
  attribute_length: number,
  view: DataView,
  offset: number
) {
  console.warn('TODO: readAttributeSourceFile is not implemented!');
  const info = [];

  for (let i = 0; i < attribute_length; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attribute_name_index,
      info,
    },
    offset,
  };
}
function readAttributeSourceDebugExtension(
  constantPool: Array<ConstantType>,
  attribute_name_index: number,
  attribute_length: number,
  view: DataView,
  offset: number
) {
  console.warn('readAttribuTODO: teSourceDebugExtension is not implemented!');
  const info = [];

  for (let i = 0; i < attribute_length; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attribute_name_index,
      info,
    },
    offset,
  };
}
function readAttributeLineNumberTable(
  constantPool: Array<ConstantType>,
  attribute_name_index: number,
  attribute_length: number,
  view: DataView,
  offset: number
) {
  const line_number_table_length = view.getUint16(offset);
  offset += 2;

  const line_number_table = [];
  for (let i = 0; i < line_number_table_length; i++) {
    const start_pc = view.getUint16(offset);
    offset += 2;
    const line_number = view.getUint16(offset);
    offset += 2;
    line_number_table.push({
      start_pc,
      line_number,
    });
  }

  return {
    result: {
      attribute_name_index,
      line_number_table_length,
      line_number_table,
    },
    offset,
  };
}
function readAttributeLocalVariableTable(
  constantPool: Array<ConstantType>,
  attribute_name_index: number,
  attribute_length: number,
  view: DataView,
  offset: number
) {
  console.warn('readAttriTODO: buteLocalVariableTable is not implemented!');
  const info = [];

  for (let i = 0; i < attribute_length; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attribute_name_index,
      info,
    },
    offset,
  };
}
function readAttributeLocalVariableTypeTable(
  constantPool: Array<ConstantType>,
  attribute_name_index: number,
  attribute_length: number,
  view: DataView,
  offset: number
) {
  console.warn('readAttributeTODO: LocalVariableTypeTable is not implemented!');
  const info = [];

  for (let i = 0; i < attribute_length; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attribute_name_index,
      info,
    },
    offset,
  };
}
function readAttributeDeprecated(
  constantPool: Array<ConstantType>,
  attribute_name_index: number,
  attribute_length: number,
  view: DataView,
  offset: number
) {
  console.warn('TODO: readAttributeDeprecated is not implemented!');
  const info = [];

  for (let i = 0; i < attribute_length; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attribute_name_index,
      info,
    },
    offset,
  };
}
function readAttributeRuntimeVisibleAnnotations(
  constantPool: Array<ConstantType>,
  attribute_name_index: number,
  attribute_length: number,
  view: DataView,
  offset: number
) {
  console.warn(
    'readAttributeRunTODO: timeVisibleAnnotations is not implemented!'
  );
  const info = [];

  for (let i = 0; i < attribute_length; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attribute_name_index,
      info,
    },
    offset,
  };
}
function readAttributeRuntimeInvisibleAnnotations(
  constantPool: Array<ConstantType>,
  attribute_name_index: number,
  attribute_length: number,
  view: DataView,
  offset: number
) {
  console.warn(
    'readAttributeRuntiTODO: meInvisibleAnnotations is not implemented!'
  );
  const info = [];

  for (let i = 0; i < attribute_length; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attribute_name_index,
      info,
    },
    offset,
  };
}
function readAttributeRuntimeVisibleParameterAnnotations(
  constantPool: Array<ConstantType>,
  attribute_name_index: number,
  attribute_length: number,
  view: DataView,
  offset: number
) {
  console.warn(
    'readAttributeRuntimeVisibTODO: leParameterAnnotations is not implemented!'
  );
  const info = [];

  for (let i = 0; i < attribute_length; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attribute_name_index,
      info,
    },
    offset,
  };
}
function readAttributeRuntimeInvisibleParameterAnnotations(
  constantPool: Array<ConstantType>,
  attribute_name_index: number,
  attribute_length: number,
  view: DataView,
  offset: number
) {
  console.warn(
    'readAttributeRuntimeInvisibTODO: leParameterAnnotations is not implemented!'
  );
  const info = [];

  for (let i = 0; i < attribute_length; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attribute_name_index,
      info,
    },
    offset,
  };
}
function readAttributeAnnotationDefault(
  constantPool: Array<ConstantType>,
  attribute_name_index: number,
  attribute_length: number,
  view: DataView,
  offset: number
) {
  console.warn('TODO: readAttributeAnnotationDefault is not implemented!');
  const info = [];

  for (let i = 0; i < attribute_length; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attribute_name_index,
      info,
    },
    offset,
  };
}
function readAttributeBootstrapMethods(
  constantPool: Array<ConstantType>,
  attribute_name_index: number,
  attribute_length: number,
  view: DataView,
  offset: number
) {
  console.warn('readAttTODO: ributeBootstrapMethods is not implemented!');
  const info = [];

  for (let i = 0; i < attribute_length; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attribute_name_index,
      info,
    },
    offset,
  };
}

// Non predefined attribute, ignored.
function readAttributeGeneric(
  constantPool: Array<ConstantType>,
  attribute_name_index: number,
  attribute_length: number,
  view: DataView,
  offset: number
) {
  const info = [];

  for (let i = 0; i < attribute_length; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attribute_name_index,
      info,
    },
    offset,
  };
}
