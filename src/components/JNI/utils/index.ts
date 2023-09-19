import { ClassRef } from '#types/ClassRef';
import { JavaArray, ArrayType, JavaReference } from '#types/DataTypes';

export function newCharArr(str: string): JavaArray {
  const arrayref = new JavaArray(str.length, ArrayType.char, str.split(''));
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
