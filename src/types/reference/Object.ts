import Thread from '#jvm/components/Thread/Thread';
import { ClassRef } from '#types/class/ClassRef';
import { FieldRef } from '#types/FieldRef';
import { DeferResult, Result, SuccessResult } from '#types/result';

export class JvmObject {
  public initStatus = false;

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

  initialize(thread: Thread, ...rest: any[]): Result<JvmObject> {
    if (this.initStatus) {
      return new SuccessResult(this);
    }

    const initMethod = this.cls.getMethod('<init>()V');
    if (!initMethod) {
      this.initStatus = true;
      return new SuccessResult(this);
    }

    thread.invokeSf(this.cls, initMethod, 0, [this]);
    return new DeferResult();
  }

  getClass() {
    return this.cls;
  }

  getField(fieldRef: FieldRef): any {
    const fieldName = fieldRef.getName();
    const fieldDesc = fieldRef.getFieldDesc();
    const fieldClass = fieldRef.getClass().getClassname();
    return this._getField(fieldName, fieldDesc, fieldClass);
  }

  _getField(fieldName: string, fieldDesc: string, fieldClass: string): any {
    const key = `${fieldClass}.${fieldName}${fieldDesc}`;

    if (key in this.fields) {
      return this.fields[key].getValue();
    }

    throw new Error(`Invalid field`);
  }

  putField(fieldRef: FieldRef, value: any) {
    const fieldName = fieldRef.getName();
    const fieldDesc = fieldRef.getFieldDesc();
    const fieldClass = fieldRef.getClass().getClassname();
    this._putField(fieldName, fieldDesc, fieldClass, value);
  }

  _putField(
    fieldName: string,
    fieldDesc: string,
    fieldClass: string,
    value: any
  ) {
    const key = `${fieldClass}.${fieldName}${fieldDesc}`;

    if (key in this.fields) {
      this.fields[key].putValue(value);
      return;
    }

    throw new Error(`Invalid field`);
  }

  getNativeField(name: string) {
    return this.nativeFields[name];
  }

  putNativeField(name: string, value: any) {
    this.nativeFields[name] = value;
  }
}
