import { ClassRef } from '#types/ConstantRef';
import { JavaArray, ArrayPrimitiveType, JavaReference } from '#types/dataTypes';

export function newCharArr(str: string): JavaArray {
  const arrayref = new JavaArray(
    str.length,
    ArrayPrimitiveType.char,
    str.split('')
  );
  return arrayref;
}

export function initString(strClass: ClassRef, str: string) {
  const charArr = newCharArr(str);
  var strObj = new JavaReference(strClass, {
    'java/lang/String/value': charArr,
  });
  // TODO: string <init>()V
  return strObj;
}
