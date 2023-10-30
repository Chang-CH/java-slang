import AbstractClassLoader from '#jvm/components/ClassLoader/AbstractClassLoader';
import { FieldRef } from '#types/FieldRef';
import { JavaArray, JavaReference } from '#types/dataTypes';

export function newCharArr(
  loader: AbstractClassLoader,
  str: string
): JavaArray {
  const cArrRes = loader.getClassRef('[C');
  if (cArrRes.error || !cArrRes.result) {
    throw new Error('Could not resolve char array class');
  }

  const cArrCls = cArrRes.result;
  const cArr = cArrCls.instantiate() as JavaArray;
  const jsArr = [];
  for (let i = 0; i < str.length; i++) {
    jsArr.push(str.charCodeAt(i));
  }
  cArr.initialize(str.length, jsArr);
  return cArr;
}

export function initString(
  loader: AbstractClassLoader,
  str: string
): { error?: string; result?: JavaReference } {
  const charArr = newCharArr(loader, str);

  const strRes = loader.getClassRef('java/lang/String');

  if (strRes.error || !strRes.result) {
    return { error: 'java/lang/ClassNotFoundException' };
  }
  const strCls = strRes.result;
  const strObj = strCls.instantiate();
  // TODO: intialize string with <init>()V
  const fieldRef = strCls.getFieldRef('value[C') as FieldRef;
  strObj.putField(fieldRef as FieldRef, charArr);
  return { result: strObj };
}
