import { ClassRef } from '#types/ClassRef';

export class JavaArray {
  type: string | ArrayType;
  length: number;
  array: any[];

  constructor(length: number, type: string | ArrayType, arr?: any[]) {
    this.length = length;
    this.array = [];
    this.type = type;

    if (arr) {
      this.array = arr;
      return;
    }

    let def;
    switch (this.type) {
      case ArrayType.TBOOLEAN:
        def = false;
        break;
      case ArrayType.TCHAR:
        def = '';
        break;
      case ArrayType.TFLOAT:
        def = 0.0;
        break;
      case ArrayType.TDOUBLE:
        def = 0.0;
        break;
      case ArrayType.TBYTE:
        def = 0;
        break;
      case ArrayType.TSHORT:
        def = 0;
        break;
      case ArrayType.TINT:
        def = 0;
        break;
      case ArrayType.TLONG:
        def = 0n;
        break;
      default:
        def = null;
    }

    for (let i = 0; i < length; i++) {
      this.array.push(def);
    }
  }

  get(index: number) {
    if (index >= 0 && index < this.length) {
      return this.array[index];
    }
    // TODO: throw error
  }

  set(index: number, value: any) {
    if (index >= 0 && index < this.length) {
      this.array[index] = value;
    }
  }

  len() {
    return this.length;
  }
}

export class JavaReference {
  cls: ClassRef;
  fields: {
    [key: string]: any;
  };

  constructor(cls: ClassRef, fields: { [key: string]: any }) {
    this.cls = cls;
    this.fields = fields;
  }

  getField(name: string) {
    // TODO: check key exists in fields
    return this.fields[name];
  }

  getFieldWide(name: string) {
    // TODO: check key exists in fields
    return this.fields[name];
  }

  putField(name: string, value: any) {
    // TODO: check key exists in fields
    this.fields[name] = value;
  }

  putFieldWide(name: string, value: any) {
    // TODO: check key exists in fields
    this.fields[name] = value;
  }
}

export interface FieldRef {
  class: ClassRef;
  fieldName: string;
}

export enum ArrayType {
  TBOOLEAN = 4,
  TCHAR = 5,
  TFLOAT = 6,
  TDOUBLE = 7,
  TBYTE = 8,
  TSHORT = 9,
  TINT = 10,
  TLONG = 11,
}

export enum JavaType {
  BYTE = 'B',
  CHAR = 'C',
  DOUBLE = 'D',
  FLOAT = 'F',
  INT = 'I',
  LONG = 'J',
  SHORT = 'S',
  BOOLEAN = 'Z',
  REFERENCE = 'L',
  ARRAY = '[',
  VOID = 'V',
}
