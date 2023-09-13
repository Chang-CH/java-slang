import { AttributeType } from './attributes';
import { ConstantType } from './constants';
import { FieldType } from './fields';
import { MethodRef } from './methods';

export interface ClassFile {
  magic: number;
  minor_version: number;
  major_version: number;
  constant_pool: Array<ConstantType>;
  access_flags: number;
  this_class: string;
  super_class: string;
  interfaces: Array<string>;
  fields: {
    [fieldName: string]: FieldType;
  };
  methods: {
    [methodName: string]: MethodRef;
  };
  attributes: Array<AttributeType>;
}
