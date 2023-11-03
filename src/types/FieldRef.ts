import AbstractClassLoader from '#jvm/components/ClassLoader/AbstractClassLoader';
import Thread from '#jvm/components/Thread/Thread';
import { AttributeInfo } from '#jvm/external/ClassFile/types/attributes';
import { ConstantUtf8Info } from '#jvm/external/ClassFile/types/constants';
import { FIELD_FLAGS, FieldInfo } from '#jvm/external/ClassFile/types/fields';
import { newString } from '#utils/index';
import { ClassRef } from './class/ClassRef';
import { ConstantUtf8 } from './constants';
import { JavaType } from './dataTypes';
import { JvmObject } from './reference/Object';
import { ErrorResult, ImmediateResult, SuccessResult } from './result';

export class FieldRef {
  private cls: ClassRef;
  private fieldName: string;
  private fieldDesc: string;
  private value: any;
  private accessFlags: number;
  private attributes: AttributeInfo[];

  private static reflectedClass: ClassRef | null = null;
  private javaObject: JvmObject | null = null;

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

  static checkField(obj: any): obj is FieldRef {
    return obj.fieldName !== undefined;
  }

  getReflectedObject(thread: Thread): ImmediateResult<JvmObject> {
    if (this.javaObject) {
      return new SuccessResult(this.javaObject);
    }

    if (!FieldRef.reflectedClass) {
      const fRes = thread
        .getClass()
        .getLoader()
        .getClassRef('java/lang/reflect/Field');
      if (fRes.checkError()) {
        return new ErrorResult(fRes.getError().className, fRes.getError().msg);
      }
      FieldRef.reflectedClass = fRes.getResult();
    }

    this.javaObject = FieldRef.reflectedClass.instantiate();
    this.javaObject.$putField(
      'clazz',
      'java/lang/Class',
      'java/lang/reflect/Field',
      this.cls.getJavaObject()
    );
    // this.javaObject.$putField(
    //   'name',
    //   'java/lang/String',
    //   'java/lang/reflect/Field',
    //   newString()
    //   this.fieldName
    // );
    //   fieldObj['java/lang/reflect/Field/clazz'] = this.cls.getClassObject(thread);
    //   fieldObj['java/lang/reflect/Field/name'] = jvm.internString(this.name);
    //   fieldObj['java/lang/reflect/Field/type'] = typeObj;
    //   fieldObj['java/lang/reflect/Field/modifiers'] = this.accessFlags.getRawByte();
    //   fieldObj['java/lang/reflect/Field/slot'] = this.slot;
    //   fieldObj['java/lang/reflect/Field/signature'] = signatureAttr !== null ? initString(bsCl, signatureAttr.sig) : null;
    //   fieldObj['java/lang/reflect/Field/annotations'] = this.getAnnotationType(thread, 'RuntimeVisibleAnnotations');
  }

  getValue() {
    return this.value;
  }

  getName() {
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
