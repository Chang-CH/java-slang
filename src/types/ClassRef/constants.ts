import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import { ConstantType } from '#jvm/external/ClassFile/types/constants';
import { MethodType } from '#jvm/external/ClassFile/types/methods';
import { JavaReference } from '#types/DataTypes';
import { ClassRef } from '.';

export interface ConstantClass {
  tag: CONSTANT_TAG;
  nameIndex: number;
  ref: ClassRef;
}

export interface ConstantMethodref {
  tag: CONSTANT_TAG;
  classIndex: number;
  nameAndTypeIndex: number;
  ref: MethodType;
}

export interface ConstantInterfaceMethodref {
  tag: CONSTANT_TAG;
  classIndex: number;
  nameAndTypeIndex: number;
  ref: MethodType;
}

export interface ConstantString {
  tag: CONSTANT_TAG;
  stringIndex: number;
  ref: JavaReference;
}

export interface ConstantInvokeDynamic {
  tag: CONSTANT_TAG;
  bootstrapMethodAttrIndex: number;
  nameAndTypeIndex: number;
}

export type ConstantRef =
  | ConstantType
  | ConstantClass
  | ConstantMethodref
  | ConstantInterfaceMethodref
  | ConstantString
  | ConstantInvokeDynamic;
