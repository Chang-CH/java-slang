import { AttributeCode, AttributeType } from './attributes';

export interface MethodType {
  accessFlags: number;
  name: string;
  descriptor: string;
  attributes: Array<AttributeType>;
  code: AttributeCode | null; // native methods have no code
}

export interface NativeMethodRef {
  className: string;
  methodName: string;
  native: true;
}

export enum METHODFLAGS {
  ACCPUBLIC = 0x0001,
  ACCPRIVATE = 0x0002,
  ACCPROTECTED = 0x0004,
  ACCSTATIC = 0x0008,
  ACCFINAL = 0x0010,
  ACCSYNCHRONIZED = 0x0020,
  ACCBRIDGE = 0x0040,
  ACCVARARGS = 0x0080,
  ACCNATIVE = 0x0100,
  ACCABSTRACT = 0x0400,
  ACCSTRICT = 0x0800,
  ACCSYNTHETIC = 0x1000,
}
