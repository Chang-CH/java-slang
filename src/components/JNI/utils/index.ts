import { ClassRef } from '#types/ClassRef';
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
  // FIXME:  set field {'java/lang/String/value': charArr}
  // TODO: string <init>()V
  const strObj = strClass.instantiate();
  // TODO: intialize string with <init>()V
  strObj.putField('Ljava/lang/String;value', str);
  return strObj;
}
