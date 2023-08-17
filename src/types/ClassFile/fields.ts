import { AttributeType } from './attributes';

export interface FieldType {
  access_flags: number;
  name_index: number;
  descriptor_index: number;
  attributes_count: number;
  attributes: Array<AttributeType>;
}
