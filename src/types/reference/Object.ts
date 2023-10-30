import { CLASS_STATUS, ClassRef } from '#types/ClassRef';
import { FieldRef } from '#types/FieldRef';

export class JvmObject {
  public status: CLASS_STATUS = CLASS_STATUS.PREPARED;

  protected cls: ClassRef;
  protected fields: {
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

    const key = `${fieldClass}.${fieldName}${fieldDesc}`;

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
