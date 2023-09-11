import AbstractClassLoader from '#jvm/components/ClassLoader';
import {
  AttributeBootstrapMethods,
  AttributeType,
} from '#types/ClassFile/attributes';
import { ConstantType } from '#types/ClassFile/constants';
import { FieldType } from '#types/ClassFile/fields';
import { MethodType } from '#types/ClassFile/methods';

// TODO: after resolving one method, e.g. methodref, can change it to the actual method object.
export interface ClassData {
  magic: number;
  minor_version: number;
  major_version: number;

  loader: AbstractClassLoader;
  isInitialized: boolean;

  constant_pool: Array<ConstantType>;
  access_flags: number;
  this_class: string;
  super_class: string;
  interfaces: Array<string>;
  fields: {
    [fieldName: string]: FieldType;
  };
  methods: {
    [methodName: string]: MethodType;
  };

  BootstrapMethods?: AttributeBootstrapMethods;
  attributes: Array<AttributeType>;
}
