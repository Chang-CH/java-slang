import { AttributeInfo } from '#jvm/external/ClassFile/types/attributes';
import { ConstantUtf8Info } from '#jvm/external/ClassFile/types/constants';
import { FIELD_FLAGS, FieldInfo } from '#jvm/external/ClassFile/types/fields';
import { ClassRef } from './class/ClassRef';
import { ConstantUtf8 } from './constants';
import { JavaType } from './dataTypes';

export class FieldRef {
  private cls: ClassRef;
  private fieldName: string;
  private fieldDesc: string;
  private value: any;
  private accessFlags: number;
  private attributes: AttributeInfo[];

  constructor(
    cls: ClassRef,
    fieldName: string,
    fieldDesc: string,
    accessFlags: number,
    attributes: AttributeInfo[]
  ) {
    this.cls = cls;
    this.fieldName = fieldName;
    this.fieldDesc = fieldDesc;
    this.accessFlags = accessFlags;
    this.attributes = attributes;

    switch (fieldDesc) {
      case JavaType.byte:
      case JavaType.char:
      case JavaType.double:
      case JavaType.float:
      case JavaType.int:
      case JavaType.short:
      case JavaType.boolean:
        this.value = 0;
        break;
      case JavaType.long:
        this.value = 0n;
        break;
      default:
        this.value = null;
        break;
    }
  }

  static fromFieldInfo(cls: ClassRef, field: FieldInfo) {
    const fieldName = (cls.getConstant(field.nameIndex) as ConstantUtf8).get();
    const fieldDesc = (
      cls.getConstant(field.descriptorIndex) as ConstantUtf8
    ).get();

    return new FieldRef(
      cls,
      fieldName,
      fieldDesc,
      field.accessFlags,
      field.attributes
    );
  }

  getValue() {
    return this.value;
  }

  getFieldName() {
    return this.fieldName;
  }

  getFieldDesc() {
    return this.fieldDesc;
  }

  getClass() {
    return this.cls;
  }

  putValue(value: any) {
    this.value = value;
  }

  cloneField() {
    const field = new FieldRef(
      this.cls,
      this.fieldName,
      this.fieldDesc,
      this.accessFlags,
      this.attributes
    );
    return field;
  }

  /**
   * flags
   */
  checkPublic() {
    return (this.accessFlags & FIELD_FLAGS.ACC_PUBLIC) !== 0;
  }

  checkPrivate() {
    return (this.accessFlags & FIELD_FLAGS.ACC_PRIVATE) !== 0;
  }

  checkProtected() {
    return (
      (this.accessFlags & FIELD_FLAGS.ACC_PROTECTED) !== 0 ||
      (!this.checkPublic() && !this.checkPrivate())
    );
  }

  checkStatic() {
    return (this.accessFlags & FIELD_FLAGS.ACC_STATIC) !== 0;
  }

  checkFinal() {
    return (this.accessFlags & FIELD_FLAGS.ACC_FINAL) !== 0;
  }

  checkVolatile() {
    return (this.accessFlags & FIELD_FLAGS.ACC_VOLATILE) !== 0;
  }

  checkTransient() {
    return (this.accessFlags & FIELD_FLAGS.ACC_TRANSIENT) !== 0;
  }

  checkSynthetic() {
    return (this.accessFlags & FIELD_FLAGS.ACC_SYNTHETIC) !== 0;
  }

  checkEnum() {
    return (this.accessFlags & FIELD_FLAGS.ACC_ENUM) !== 0;
  }
}
