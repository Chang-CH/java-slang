import { AttributeInfo } from '#jvm/external/ClassFile/types/attributes';
import { ConstantUtf8Info } from '#jvm/external/ClassFile/types/constants';
import { FIELD_FLAGS, FieldInfo } from '#jvm/external/ClassFile/types/fields';
import { ClassRef } from './ClassRef';

export class FieldRef {
  private cls: ClassRef;
  private fieldName: string;
  private fieldDesc: string;
  private value: any;
  private accessFlags: number;
  private attributes: AttributeInfo[];

  constructor(cls: ClassRef, field: FieldInfo) {
    this.cls = cls;

    const fieldName = cls.getConstant(field.nameIndex) as ConstantUtf8Info;
    const fieldDesc = cls.getConstant(
      field.descriptorIndex
    ) as ConstantUtf8Info;

    this.fieldName = fieldName.value;
    this.fieldDesc = fieldDesc.value;
    this.accessFlags = field.accessFlags;
    this.attributes = field.attributes;
    // TODO: set default value?
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
    const field = new FieldRef(this.cls, {
      accessFlags: this.accessFlags,
      attributes: this.attributes,
      attributesCount: this.attributes.length,
      descriptorIndex: 0,
      nameIndex: 0,
    });
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
