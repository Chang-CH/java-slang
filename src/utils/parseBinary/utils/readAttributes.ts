import { PREDEF_ATTRIBUTE } from '#jvm/external/ClassFile/constants/attributes';
import {
  AttributeCode,
  ExceptionType,
} from '#jvm/external/ClassFile/types/attributes';
import {
  ConstantType,
  ConstantUtf8Info,
} from '#jvm/external/ClassFile/types/constants';

export function readAttribute(
  constPool: Array<ConstantType>,
  view: DataView,
  offset: number
): { result: { [key: string]: any }; offset: number } {
  const attributeNameIndex = view.getUint16(offset);
  offset += 2;

  // TODO: in theory we should check the constant pool:
  // checkConstantPool(constPool, attributeNameIndex, CONSTANT_TAG.constantUtf8);

  const constantAttributeName: ConstantUtf8Info = constPool[
    attributeNameIndex
  ] as ConstantUtf8Info;

  // @ts-ignore
  const Attrib: number = PREDEF_ATTRIBUTE[constantAttributeName.value];
  const attributeLength = view.getUint32(offset);
  offset += 4;

  switch (Attrib) {
    case PREDEF_ATTRIBUTE.ConstantValue:
      return readAttributeConstantValue(
        constPool,
        attributeNameIndex,
        attributeLength,
        view,
        offset
      );
    case PREDEF_ATTRIBUTE.Code:
      return readAttributeCode(
        constPool,
        attributeNameIndex,
        attributeLength,
        view,
        offset
      );
    case PREDEF_ATTRIBUTE.StackMapTable:
      return readAttributeStackMapTable(
        constPool,
        attributeNameIndex,
        attributeLength,
        view,
        offset
      );
    case PREDEF_ATTRIBUTE.Exceptions:
      return readAttributeExceptions(
        constPool,
        attributeNameIndex,
        attributeLength,
        view,
        offset
      );
    case PREDEF_ATTRIBUTE.InnerClasses:
      return readAttributeInnerClasses(
        constPool,
        attributeNameIndex,
        attributeLength,
        view,
        offset
      );
    case PREDEF_ATTRIBUTE.EnclosingMethod:
      return readAttributeEnclosingMethod(
        constPool,
        attributeNameIndex,
        attributeLength,
        view,
        offset
      );
    case PREDEF_ATTRIBUTE.Synthetic:
      return readAttributeSynthetic(
        constPool,
        attributeNameIndex,
        attributeLength,
        view,
        offset
      );
    case PREDEF_ATTRIBUTE.Signature:
      return readAttributeSignature(
        constPool,
        attributeNameIndex,
        attributeLength,
        view,
        offset
      );
    case PREDEF_ATTRIBUTE.SourceFile:
      return readAttributeSourceFile(
        constPool,
        attributeNameIndex,
        attributeLength,
        view,
        offset
      );
    case PREDEF_ATTRIBUTE.SourceDebugExtension:
      return readAttributeSourceDebugExtension(
        constPool,
        attributeNameIndex,
        attributeLength,
        view,
        offset
      );
    case PREDEF_ATTRIBUTE.LineNumberTable:
      return readAttributeLineNumberTable(
        constPool,
        attributeNameIndex,
        attributeLength,
        view,
        offset
      );
    case PREDEF_ATTRIBUTE.LocalVariableTable:
      return readAttributeLocalVariableTable(
        constPool,
        attributeNameIndex,
        attributeLength,
        view,
        offset
      );
    case PREDEF_ATTRIBUTE.LocalVariableTypeTable:
      return readAttributeLocalVariableTypeTable(
        constPool,
        attributeNameIndex,
        attributeLength,
        view,
        offset
      );
    case PREDEF_ATTRIBUTE.Deprecated:
      return readAttributeDeprecated(
        constPool,
        attributeNameIndex,
        attributeLength,
        view,
        offset
      );
    case PREDEF_ATTRIBUTE.RuntimeVisibleAnnotations:
      return readAttributeRuntimeVisibleAnnotations(
        constPool,
        attributeNameIndex,
        attributeLength,
        view,
        offset
      );
    case PREDEF_ATTRIBUTE.RuntimeInvisibleAnnotations:
      return readAttributeRuntimeInvisibleAnnotations(
        constPool,
        attributeNameIndex,
        attributeLength,
        view,
        offset
      );
    case PREDEF_ATTRIBUTE.RuntimeVisibleParameterAnnotations:
      return readAttributeRuntimeVisibleParameterAnnotations(
        constPool,
        attributeNameIndex,
        attributeLength,
        view,
        offset
      );
    case PREDEF_ATTRIBUTE.RuntimeInvisibleParameterAnnotations:
      return readAttributeRuntimeInvisibleParameterAnnotations(
        constPool,
        attributeNameIndex,
        attributeLength,
        view,
        offset
      );
    case PREDEF_ATTRIBUTE.AnnotationDefault:
      return readAttributeAnnotationDefault(
        constPool,
        attributeNameIndex,
        attributeLength,
        view,
        offset
      );
    case PREDEF_ATTRIBUTE.BootstrapMethods:
      return readAttributeBootstrapMethods(
        constPool,
        attributeNameIndex,
        attributeLength,
        view,
        offset
      );
    default:
      return readAttributeGeneric(
        constPool,
        attributeNameIndex,
        attributeLength,
        view,
        offset
      );
  }
}

function readAttributeConstantValue(
  constantPool: Array<ConstantType>,
  attributeNameIndex: number,
  attributeLength: number,
  view: DataView,
  offset: number
) {
  const constantvalueIndex = view.getUint16(offset);
  offset += 2;

  return {
    result: {
      attributeNameIndex,
      constantvalueIndex,
    },
    offset,
  };
}

function readAttributeCode(
  constantPool: Array<ConstantType>,
  attributeNameIndex: number,
  attributeLength: number,
  view: DataView,
  offset: number
): {
  result: AttributeCode;
  offset: number;
} {
  const maxStack = view.getUint16(offset);
  offset += 2;
  const maxLocals = view.getUint16(offset);
  offset += 2;
  const codeLength = view.getUint32(offset); // size in bytes
  offset += 4;

  if (codeLength <= 0 || codeLength >= 65536) {
    throw new Error('Class format error: Code attribute invalid length');
  }

  const code = new DataView(view.buffer, offset, codeLength);
  offset += codeLength;

  const exceptionTableLength = view.getUint16(offset);
  offset += 2;

  const exceptionTable: ExceptionType[] = [];
  for (let i = 0; i < exceptionTableLength; i++) {
    const startPc = view.getUint16(offset);
    offset += 2;
    const endPc = view.getUint16(offset);
    offset += 2;
    const handlerPc = view.getUint16(offset);
    offset += 2;
    const catchType = view.getUint16(offset);
    offset += 2;
    exceptionTable.push({ startPc, endPc, handlerPc, catchType });
  }

  const attributesCount = view.getUint16(offset);
  offset += 2;

  const attributes = [];
  for (let i = 0; i < attributesCount; i++) {
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
      attributeNameIndex,
      maxStack,
      maxLocals,
      code,
      exceptionTable,
      attributes,
    },
    offset,
  };
}

function readAttributeStackMapTable(
  constantPool: Array<ConstantType>,
  attributeNameIndex: number,
  attributeLength: number,
  view: DataView,
  offset: number
) {
  console.warn('TODO: AttributeStackMapTable is not implemented!');
  const info = [];

  for (let i = 0; i < attributeLength; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attributeNameIndex,
      info,
    },
    offset,
  };
}
function readAttributeExceptions(
  constantPool: Array<ConstantType>,
  attributeNameIndex: number,
  attributeLength: number,
  view: DataView,
  offset: number
) {
  console.warn('TODO: readAttributeExceptions is not implemented!');
  const info = [];

  for (let i = 0; i < attributeLength; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attributeNameIndex,
      info,
    },
    offset,
  };
}
function readAttributeInnerClasses(
  constantPool: Array<ConstantType>,
  attributeNameIndex: number,
  attributeLength: number,
  view: DataView,
  offset: number
) {
  console.warn('reaTODO: dAttributeInnerClasses is not implemented!');
  const info = [];

  for (let i = 0; i < attributeLength; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attributeNameIndex,
      info,
    },
    offset,
  };
}
function readAttributeEnclosingMethod(
  constantPool: Array<ConstantType>,
  attributeNameIndex: number,
  attributeLength: number,
  view: DataView,
  offset: number
) {
  console.warn('readAtTODO: tributeEnclosingMethod is not implemented!');
  const info = [];

  for (let i = 0; i < attributeLength; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attributeNameIndex,
      info,
    },
    offset,
  };
}
function readAttributeSynthetic(
  constantPool: Array<ConstantType>,
  attributeNameIndex: number,
  attributeLength: number,
  view: DataView,
  offset: number
) {
  console.warn('TODO: readAttributeSynthetic is not implemented!');
  const info = [];

  for (let i = 0; i < attributeLength; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attributeNameIndex,
      info,
    },
    offset,
  };
}
function readAttributeSignature(
  constantPool: Array<ConstantType>,
  attributeNameIndex: number,
  attributeLength: number,
  view: DataView,
  offset: number
) {
  console.warn('TODO: readAttributeSignature is not implemented!');
  const info = [];

  for (let i = 0; i < attributeLength; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attributeNameIndex,
      info,
    },
    offset,
  };
}
function readAttributeSourceFile(
  constantPool: Array<ConstantType>,
  attributeNameIndex: number,
  attributeLength: number,
  view: DataView,
  offset: number
) {
  console.warn('TODO: readAttributeSourceFile is not implemented!');
  const info = [];

  for (let i = 0; i < attributeLength; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attributeNameIndex,
      info,
    },
    offset,
  };
}
function readAttributeSourceDebugExtension(
  constantPool: Array<ConstantType>,
  attributeNameIndex: number,
  attributeLength: number,
  view: DataView,
  offset: number
) {
  console.warn('readAttribuTODO: teSourceDebugExtension is not implemented!');
  const info = [];

  for (let i = 0; i < attributeLength; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attributeNameIndex,
      info,
    },
    offset,
  };
}
function readAttributeLineNumberTable(
  constantPool: Array<ConstantType>,
  attributeNameIndex: number,
  attributeLength: number,
  view: DataView,
  offset: number
) {
  const lineNumberTableLength = view.getUint16(offset);
  offset += 2;

  const lineNumberTable = [];
  for (let i = 0; i < lineNumberTableLength; i++) {
    const startPc = view.getUint16(offset);
    offset += 2;
    const lineNumber = view.getUint16(offset);
    offset += 2;
    lineNumberTable.push({
      startPc,
      lineNumber,
    });
  }

  return {
    result: {
      attributeNameIndex,
      lineNumberTableLength,
      lineNumberTable,
    },
    offset,
  };
}
function readAttributeLocalVariableTable(
  constantPool: Array<ConstantType>,
  attributeNameIndex: number,
  attributeLength: number,
  view: DataView,
  offset: number
) {
  console.warn('readAttriTODO: buteLocalVariableTable is not implemented!');
  const info = [];

  for (let i = 0; i < attributeLength; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attributeNameIndex,
      info,
    },
    offset,
  };
}
function readAttributeLocalVariableTypeTable(
  constantPool: Array<ConstantType>,
  attributeNameIndex: number,
  attributeLength: number,
  view: DataView,
  offset: number
) {
  console.warn('readAttributeTODO: LocalVariableTypeTable is not implemented!');
  const info = [];

  for (let i = 0; i < attributeLength; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attributeNameIndex,
      info,
    },
    offset,
  };
}
function readAttributeDeprecated(
  constantPool: Array<ConstantType>,
  attributeNameIndex: number,
  attributeLength: number,
  view: DataView,
  offset: number
) {
  console.warn('TODO: readAttributeDeprecated is not implemented!');
  const info = [];

  for (let i = 0; i < attributeLength; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attributeNameIndex,
      info,
    },
    offset,
  };
}
function readAttributeRuntimeVisibleAnnotations(
  constantPool: Array<ConstantType>,
  attributeNameIndex: number,
  attributeLength: number,
  view: DataView,
  offset: number
) {
  console.warn(
    'readAttributeRunTODO: timeVisibleAnnotations is not implemented!'
  );
  const info = [];

  for (let i = 0; i < attributeLength; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attributeNameIndex,
      info,
    },
    offset,
  };
}
function readAttributeRuntimeInvisibleAnnotations(
  constantPool: Array<ConstantType>,
  attributeNameIndex: number,
  attributeLength: number,
  view: DataView,
  offset: number
) {
  console.warn(
    'readAttributeRuntiTODO: meInvisibleAnnotations is not implemented!'
  );
  const info = [];

  for (let i = 0; i < attributeLength; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attributeNameIndex,
      info,
    },
    offset,
  };
}
function readAttributeRuntimeVisibleParameterAnnotations(
  constantPool: Array<ConstantType>,
  attributeNameIndex: number,
  attributeLength: number,
  view: DataView,
  offset: number
) {
  console.warn(
    'readAttributeRuntimeVisibTODO: leParameterAnnotations is not implemented!'
  );
  const info = [];

  for (let i = 0; i < attributeLength; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attributeNameIndex,
      info,
    },
    offset,
  };
}
function readAttributeRuntimeInvisibleParameterAnnotations(
  constantPool: Array<ConstantType>,
  attributeNameIndex: number,
  attributeLength: number,
  view: DataView,
  offset: number
) {
  console.warn(
    'readAttributeRuntimeInvisibTODO: leParameterAnnotations is not implemented!'
  );
  const info = [];

  for (let i = 0; i < attributeLength; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attributeNameIndex,
      info,
    },
    offset,
  };
}
function readAttributeAnnotationDefault(
  constantPool: Array<ConstantType>,
  attributeNameIndex: number,
  attributeLength: number,
  view: DataView,
  offset: number
) {
  console.warn('TODO: readAttributeAnnotationDefault is not implemented!');
  const info = [];

  for (let i = 0; i < attributeLength; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attributeNameIndex,
      info,
    },
    offset,
  };
}
function readAttributeBootstrapMethods(
  constantPool: Array<ConstantType>,
  attributeNameIndex: number,
  attributeLength: number,
  view: DataView,
  offset: number
) {
  console.warn('TODO: readAttributeBootstrapMethods is not implemented!');
  const numBootstrapMethods = view.getUint16(offset);
  offset += 2;

  const bootstrapMethods = [];

  for (let i = 0; i < numBootstrapMethods; i += 1) {
    const bootstrapMethodRef = view.getUint16(offset);
    offset += 2;
    const numBootstrapArguments = view.getUint16(offset);
    offset += 2;
    const bsArgs = [];

    for (let j = 0; j < numBootstrapArguments; j += 1) {
      bsArgs.push(view.getUint16(offset));
      offset += 2;
    }
    bootstrapMethods.push({
      bootstrapMethodRef,
      bsArgs,
    });
  }

  return {
    result: {
      attributeNameIndex,
      bootstrapMethods,
    },
    offset,
  };
}

// Non predefined attribute, ignored.
function readAttributeGeneric(
  constantPool: Array<ConstantType>,
  attributeNameIndex: number,
  attributeLength: number,
  view: DataView,
  offset: number
) {
  const info = [];

  for (let i = 0; i < attributeLength; i += 1) {
    info.push(view.getUint8(offset));
    offset += 1;
  }

  return {
    result: {
      attributeNameIndex,
      info,
    },
    offset,
  };
}
