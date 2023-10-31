import AbstractClassLoader from '#jvm/components/ClassLoader/AbstractClassLoader';
import { FieldRef } from '#types/FieldRef';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';
import { ErrorResult, Result, SuccessResult } from '#types/result';

export function newCharArr(
  loader: AbstractClassLoader,
  str: string
): Result<JvmArray> {
  const cArrRes = loader.getClassRef('[C');
  if (cArrRes.error || !cArrRes.result) {
    return new ErrorResult<JvmArray>(
      cArrRes.error ?? 'java/lang/ClassNotFoundException',
      ''
    );
  }

  const cArrCls = cArrRes.result;
  const cArr = cArrCls.instantiate() as JvmArray;
  const jsArr = [];
  for (let i = 0; i < str.length; i++) {
    jsArr.push(str.charCodeAt(i));
  }
  cArr.initialize(str.length, jsArr);
  return new SuccessResult<JvmArray>(cArr);
}

export function newString(
  loader: AbstractClassLoader,
  str: string
): Result<JvmObject> {
  const charArr = newCharArr(loader, str);

  if (!charArr.checkSuccess()) {
    return charArr;
  }

  const strRes = loader.getClassRef('java/lang/String');

  if (strRes.error || !strRes.result) {
    return new ErrorResult<JvmObject>('java/lang/ClassNotFoundException', '');
  }
  const strCls = strRes.result;
  const strObj = strCls.instantiate();
  // TODO: intialize string with <init>()V
  const fieldRef = strCls.getFieldRef('value[C') as FieldRef;
  strObj.putField(fieldRef as FieldRef, charArr.getResult());
  return new SuccessResult<JvmObject>(strObj);
}
