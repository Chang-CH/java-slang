import { ClassRef } from '#types/ClassRef';
import { FieldRef } from '#types/FieldRef';
import { JavaArray, ArrayPrimitiveType } from '#types/dataTypes';

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

  const fieldRef = strClass.getFieldRef('value[B') as FieldRef;
  strObj.putField(fieldRef as FieldRef, str);
  return strObj;
}
