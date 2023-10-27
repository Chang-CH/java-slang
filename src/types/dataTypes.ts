import { CLASS_STATUS, ClassRef } from './ClassRef';
import { FieldRef } from './FieldRef';

export class JavaArray {
  type: string | ArrayPrimitiveType | ClassRef;
  length: number;
  array: any[];

  constructor(
    length: number,
    type: string | ArrayPrimitiveType | ClassRef,
    arr?: any[]
  ) {
    this.length = length;
    this.type = type;

    if (arr) {
      this.array = arr;
      return;
    }

    let def;
    switch (this.type) {
      case ArrayPrimitiveType.boolean:
        def = false;
        break;
      case ArrayPrimitiveType.char:
        def = '';
        break;
      case ArrayPrimitiveType.float:
        def = 0.0;
        break;
      case ArrayPrimitiveType.double:
        def = 0.0;
        break;
      case ArrayPrimitiveType.byte:
        def = 0;
        break;
      case ArrayPrimitiveType.short:
        def = 0;
        break;
      case ArrayPrimitiveType.int:
        def = 0;
        break;
      case ArrayPrimitiveType.long:
        def = 0n;
        break;
      default:
        def = null;
    }

    this.array = new Array(length).fill(def);
  }

  get(index: number) {
    if (index >= 0 && index < this.length) {
      return this.array[index];
    }
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
  public status: CLASS_STATUS = CLASS_STATUS.PREPARED;

  private cls: ClassRef;
  private fields: {
    [key: string]: FieldRef;
  };

  constructor(cls: ClassRef) {
    this.cls = cls;
    this.fields = {};
    for (const [fieldName, fieldRef] of Object.entries(
      cls.getInstanceFields()
    )) {
      this.fields[fieldName] = fieldRef.cloneField();
    }
  }

  getClass() {
    return this.cls;
  }

  getField(fieldRef: FieldRef): any {
    const fieldName = fieldRef.getFieldName();
    const fieldDesc = fieldRef.getFieldDesc();
    const fieldClass = fieldRef.getClass().getClassname();

    const key = `${fieldClass}.${fieldName}:${fieldDesc}`;

    if (key in this.fields) {
      return this.fields[key].getValue();
    }

    throw new Error(`Invalid field`);
  }

  putField(fieldRef: FieldRef, value: any) {
    const fieldName = fieldRef.getFieldName();
    const fieldDesc = fieldRef.getFieldDesc();
    const fieldClass = fieldRef.getClass().getClassname();

    const key = `${fieldClass}.${fieldName}${fieldDesc}`;

    if (key in this.fields) {
      this.fields[key].putValue(value);
      return;
    }

    throw new Error(`Invalid field`);
  }
}

export enum ArrayPrimitiveType {
  boolean = 4,
  char = 5,
  float = 6,
  double = 7,
  byte = 8,
  short = 9,
  int = 10,
  long = 11,
}

export enum JavaType {
  byte = 'B',
  char = 'C',
  double = 'D',
  float = 'F',
  int = 'I',
  long = 'J',
  short = 'S',
  boolean = 'Z',
  reference = 'L',
  array = '[',
  void = 'V',
}
