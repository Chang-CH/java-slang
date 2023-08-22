import { AttributeType } from './attributes';
import { ConstantType } from './constants';
import { FieldType } from './fields';
import { MethodType } from './methods';

export interface ClassFile {
  magic: number;
  minor_version: number;
  major_version: number;
  constant_pool_count: number;
  constant_pool: Array<ConstantType>;
  access_flags: number;
  this_class: number;
  super_class: number;
  interfaces_count: number;
  interfaces: Array<number>;
  fields_count: number;
  fields: Array<FieldType>;
  methods_count: number;
  methods: {
    [methodName: string]: MethodType;
  };
  attributes_count: number;
  attributes: Array<AttributeType>;
}
