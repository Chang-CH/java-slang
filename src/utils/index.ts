import AbstractClassLoader from '#jvm/components/ClassLoader/AbstractClassLoader';
import { FieldRef } from '#types/FieldRef';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';
import {
  ErrorResult,
  ImmediateResult,
  Result,
  SuccessResult,
} from '#types/result';

export function newCharArr(
  loader: AbstractClassLoader,
  str: string
): ImmediateResult<JvmArray> {
  const cArrRes = loader.getClassRef('[C');
  if (cArrRes.checkError()) {
    const err = cArrRes.getError();
    return new ErrorResult<JvmArray>(err.className, err.msg);
  }

  const cArrCls = cArrRes.getResult();
  const cArr = cArrCls.instantiate() as JvmArray;
  const jsArr = [];
  for (let i = 0; i < str.length; i++) {
    jsArr.push(str.charCodeAt(i));
  }
  cArr.initArray(str.length, jsArr);
  return new SuccessResult<JvmArray>(cArr);
}

export function newString(
  loader: AbstractClassLoader,
  str: string
): ImmediateResult<JvmObject> {
  const charArr = newCharArr(loader, str);

  if (!charArr.checkSuccess()) {
    return charArr;
  }

  const strRes = loader.getClassRef('java/lang/String');

  if (strRes.checkError()) {
    const err = strRes.getError();
    return new ErrorResult<JvmObject>(err.className, err.msg);
  }
  const strCls = strRes.getResult();
  const strObj = strCls.instantiate();
  // TODO: intialize string with <init>()V
  const fieldRef = strCls.getFieldRef('value[C') as FieldRef;
  strObj.putField(fieldRef as FieldRef, charArr.getResult());
  return new SuccessResult<JvmObject>(strObj);
}
