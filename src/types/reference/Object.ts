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
  private fieldArr: { name: string; ref: FieldRef }[];

  constructor(cls: ClassRef) {
    this.cls = cls;
    this.fields = {};
    this.fieldArr = [];

    Object.entries(cls.getInstanceFields()).forEach(
      ([fieldName, fieldRef], index) => {
        this.fields[fieldName] = fieldRef.cloneField();
        this.fieldArr[index] = { name: fieldName, ref: this.fields[fieldName] };
      }
    );
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

  getFieldFromVMIndex(index: number): FieldRef {
    // TODO: check if VM index includes static fields
    // console.log(
    //   'getFieldFromVMIndex ',
    //   this.fieldArr.map(f => [f.name, f.ref.getSlot()])
    // );
    const res = this.fieldArr.filter(f => {
      const slot = f.ref.getSlot();
      return slot === index;
    });

    if (res.length > 1) {
      // will this happen?
      throw new Error('Multiple matching slots. Need to check classname');
    }

    if (res.length === 0) {
      throw new Error('Invalid slot');
    }

    return res[0].ref;
  }
}
