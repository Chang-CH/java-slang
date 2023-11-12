import { ClassRef } from '#types/class/ClassRef';
import { JvmObject } from '#types/reference/Object';

export const j2jsString = (str: JvmObject) => {
  return String.fromCharCode(
    ...str._getField('value', '[C', 'java/lang/String').getJsArray()
  );
};

/**
 * Returns the number of bytes that a primitive or reference takes up in memory.
 * @param cls ClassRef of the primitive or reference
 */
export const typeIndexScale = (cls: ClassRef) => {
  // Reference type
  if (!cls.checkPrimitive()) {
    return 4;
  }

  const componentName = cls.getClassname();
  switch (componentName) {
    case 'long':
    case 'double':
      return 8;

    case 'int':
    case 'float':
      return 4;

    case 'short':
    case 'char':
      return 2;

    case 'byte':
    case 'boolean':
      return 1;

    default:
      return -1;
  }
};
