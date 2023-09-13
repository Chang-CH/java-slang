import { constantTag } from '#constants/ClassFile/constants';

export interface constant_Class_info {
  tag: constantTag;
  name_index: number;
}

export interface constant_Fieldref_info {
  tag: constantTag;
  class_index: number;
  name_and_type_index: number;
}

export interface constant_Methodref_info {
  tag: constantTag;
  class_index: number;
  name_and_type_index: number;
}

export interface constant_InterfaceMethodref_info {
  tag: constantTag;
  class_index: number;
  name_and_type_index: number;
}

export interface constant_String_info {
  tag: constantTag;
  string_index: number;
}

export interface constant_Integer_info {
  tag: constantTag;
  value: number;
}

export interface constant_Float_info {
  tag: constantTag;
  value: number;
}

export interface constant_Long_info {
  tag: constantTag;
  value: bigint;
}

export interface constant_Double_info {
  tag: constantTag;
  value: number;
}

export interface constant_NameAndType_info {
  tag: constantTag;
  name_index: number;
  descriptor_index: number;
}

export interface constant_Utf8_info {
  tag: constantTag;
  length: number;
  value: string;
}

export enum REFERENCE_KIND {
  REF_getField,
  REF_getStatic,
  REF_putField,
  REF_putStatic,
  REF_invokeVirtual,
  REF_invokeStatic,
  REF_invokeSpecial,
  REF_newInvokeSpecial,
  REF_invokeInterface,
}

export interface constant_MethodHandle_info {
  tag: constantTag;
  reference_kind: REFERENCE_KIND;
  reference_index: number;
}

export interface constant_MethodType_info {
  tag: constantTag;
  descriptor_index: number;
}

export interface constant_InvokeDynamic_info {
  tag: constantTag;
  bootstrap_method_attr_index: number;
  name_and_type_index: number;
}

export type ConstantType =
  | constant_Class_info
  | constant_Fieldref_info
  | constant_Methodref_info
  | constant_InterfaceMethodref_info
  | constant_String_info
  | constant_Integer_info
  | constant_Float_info
  | constant_Long_info
  | constant_Double_info
  | constant_NameAndType_info
  | constant_Utf8_info
  | constant_MethodHandle_info
  | constant_MethodType_info
  | constant_InvokeDynamic_info;
