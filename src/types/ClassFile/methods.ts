import { AttributeType } from './attributes';

export interface MethodType {
  access_flags: number;
  name_index: number;
  descriptor_index: number;
  attributes_count: number;
  attributes: Array<AttributeType>;
}
