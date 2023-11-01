import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { ConstantInfo } from '#jvm/external/ClassFile/types/constants';
import { JvmObject } from '#types/reference/Object';
import { ClassRef } from './class/ClassRef';
import { MethodRef } from './MethodRef';

export interface LegacyConstantClass {
  tag: CONSTANT_TAG;
  nameIndex: number;
  classRef: ClassRef;
  error?: string;
}

export interface LegacyConstantMethodref {
  tag: CONSTANT_TAG;
  classIndex: number;
  nameAndTypeIndex: number;
  methodRef: MethodRef;
  error?: string;
}

export interface LegacyConstantInterfaceMethodref {
  tag: CONSTANT_TAG;
  classIndex: number;
  nameAndTypeIndex: number;
  methodRef: MethodRef;
  error?: string;
}

export interface LegacyConstantString {
  tag: CONSTANT_TAG;
  stringIndex: number;
  ref: JvmObject;
}

export type ConstantRef =
  | ConstantInfo
  | LegacyConstantClass
  | LegacyConstantMethodref
  | LegacyConstantInterfaceMethodref
  | LegacyConstantString;
