import { CLASS_STATUS, ClassRef } from '#types/class/ClassRef';
import { FieldRef } from '#types/FieldRef';

export class JvmObject {
  public status: CLASS_STATUS = CLASS_STATUS.PREPARED;

  protected cls: ClassRef;
  protected fields: {
    [key: string]: FieldRef;
  };
  protected nativeFields: {
    [key: string]: any;
  } = {};

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
    const fieldName = fieldRef.getName();
    const fieldDesc = fieldRef.getFieldDesc();
    const fieldClass = fieldRef.getClass().getClassname();

    const key = `${fieldClass}.${fieldName}${fieldDesc}`;
    console.log('GETFIELD: ', key, this.fields[key].getValue());

    if (key in this.fields) {
      return this.fields[key].getValue();
    }

    throw new Error(`Invalid field`);
  }

  putField(fieldRef: FieldRef, value: any) {
    const fieldName = fieldRef.getName();
    const fieldDesc = fieldRef.getFieldDesc();
    const fieldClass = fieldRef.getClass().getClassname();

    const key = `${fieldClass}.${fieldName}${fieldDesc}`;

    if (key in this.fields) {
      this.fields[key].putValue(value);
      return;
    }

    throw new Error(`Invalid field`);
  }

  $getNativeField(name: string) {
    return this.nativeFields[name];
  }

  $putNativeField(name: string, value: any) {
    this.nativeFields[name] = value;
  }
}
