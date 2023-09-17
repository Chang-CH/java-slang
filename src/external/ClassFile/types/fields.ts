import { AttributeType } from './attributes';

export interface FieldType {
  accessFlags: number;
  nameIndex: number;
  descriptorIndex: number;
  attributes: Array<AttributeType>;
  data?: any;
}

export enum FIELDFLAGS {
  ACCPUBLIC = 0x0001,
  ACCPRIVATE = 0x0002,
  ACCPROTECTED = 0x0004,
  ACCSTATIC = 0x0008,
  ACCFINAL = 0x0010,
  ACCVOLATILE = 0x0040,
  ACCTRANSIENT = 0x0080,
  ACCSYNTHETIC = 0x1000,
  ACCENUM = 0x4000,
}
