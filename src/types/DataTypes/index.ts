export class JavaArray {
  type: string | ArrayType;
  length: number;
  array: any[];

  constructor(length: number, type: string | ArrayType) {
    this.length = length;
    this.array = [];
    this.type = type;

    let def;
    switch (this.type) {
      case ArrayType.T_BOOLEAN:
        def = false;
        break;
      case ArrayType.T_CHAR:
        def = '';
        break;
      case ArrayType.T_FLOAT:
        def = 0.0;
        break;
      case ArrayType.T_DOUBLE:
        def = 0.0;
        break;
      case ArrayType.T_BYTE:
        def = 0;
        break;
      case ArrayType.T_SHORT:
        def = 0;
        break;
      case ArrayType.T_INT:
        def = 0;
        break;
      case ArrayType.T_LONG:
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
  cls: string;
  fields: {
    [key: string]: any;
  };

  constructor(cls: string, fields: { [key: string]: any }) {
    this.cls = cls;
    this.fields = fields;
  }

  getField(name: string) {
    // TODO: check key exists in fields
    return this.fields[name];
  }

  putField(name: string, value: any) {
    // TODO: check key exists in fields
    this.fields[name] = value;
  }
}

export enum ArrayType {
  T_BOOLEAN = 4,
  T_CHAR = 5,
  T_FLOAT = 6,
  T_DOUBLE = 7,
  T_BYTE = 8,
  T_SHORT = 9,
  T_INT = 10,
  T_LONG = 11,
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
