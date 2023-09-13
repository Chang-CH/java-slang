import AbstractClassLoader from '#jvm/components/ClassLoader';
import {
  AttributeBootstrapMethods,
  AttributeType,
} from '#types/ClassFile/attributes';
import { ConstantType } from '#types/ClassFile/constants';
import { FieldType } from '#types/ClassFile/fields';
import { MethodRef } from '#types/ClassFile/methods';

// TODO: after resolving one method, e.g. methodref, can change it to the actual method object.
export interface ClassRef {
  magic: number;
  minor_version: number;
  major_version: number;

  loader: AbstractClassLoader;
  isInitialized: boolean;

  constant_pool: Array<ConstantType>; // TODO: change to actual values?
  access_flags: number;

  this_class: string;
  super_class: string | ClassRef;

  interfaces: Array<string | ClassRef>;

  fields: {
    [fieldName: string]: FieldType;
  };

  methods: {
    [methodName: string]: MethodRef;
  };

  BootstrapMethods?: AttributeBootstrapMethods;
  attributes: Array<AttributeType>;
}
