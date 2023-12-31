import { FIELD_FLAGS, FieldInfo } from '#jvm/external/ClassFile/types/fields';
import { ReferenceClassData } from './ClassData';
import { ConstantUtf8 } from './Constants';
import { JavaType } from '../reference/Object';
import type { JvmObject } from '../reference/Object';
import Thread from '#jvm/components/thread/thread';
import { ConstantValue, IAttribute } from './Attributes';
import { ConstantPool } from '#jvm/components/constant-pool';
import { attrInfo2Interface } from '#utils/index';
import {
  ImmediateResult,
  checkError,
  Result,
  checkSuccess,
} from '#types/Result';

export class Field {
  private cls: ReferenceClassData;
  private fieldName: string;
  private fieldDesc: string;
  private value: any;
  private accessFlags: number;
  private attributes: { [attributeName: string]: IAttribute[] } = {};

  private static reflectedClass: ReferenceClassData | null = null;
  private javaObject: JvmObject | null = null;
  private slot: number;

  constructor(
    cls: ReferenceClassData,
    fieldName: string,
    fieldDesc: string,
    accessFlags: number,
    attributes: { [attributeName: string]: IAttribute[] },
    slot: number
  ) {
    this.cls = cls;
    this.fieldName = fieldName;
    this.fieldDesc = fieldDesc;
    this.accessFlags = accessFlags;
    this.attributes = attributes;
    this.slot = slot;

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

    if (this.checkStatic() && this.attributes['ConstantValue']) {
      const constantValue = (
        this.attributes['ConstantValue'][0] as ConstantValue
      ).constantvalue.resolve(null as any, cls.getLoader()); // String resolution does not need thread
      if (!checkSuccess(constantValue)) {
        return;
      }

      this.value = constantValue.result;
      return;
    }
  }

  static fromFieldInfo(
    cls: ReferenceClassData,
    field: FieldInfo,
    slot: number,
    constantPool: ConstantPool
  ) {
    const fieldName = (cls.getConstant(field.nameIndex) as ConstantUtf8).get();
    const fieldDesc = (
      cls.getConstant(field.descriptorIndex) as ConstantUtf8
    ).get();

    return new Field(
      cls,
      fieldName,
      fieldDesc,
      field.accessFlags,
      attrInfo2Interface(field.attributes, constantPool),
      slot
    );
  }

  static checkField(obj: any): obj is Field {
    return obj.fieldName !== undefined;
  }

  getAccessFlags() {
    return this.accessFlags;
  }

  getSlot() {
    return this.slot;
  }

  getReflectedObject(thread: Thread): ImmediateResult<JvmObject> {
    if (this.javaObject) {
      return { result: this.javaObject };
    }

    if (!Field.reflectedClass) {
      const fRes = thread
        .getClass()
        .getLoader()
        .getClassRef('java/lang/reflect/Field');
      if (checkError(fRes)) {
        return fRes;
      }
      Field.reflectedClass = fRes.result as ReferenceClassData;
    }

    this.javaObject = Field.reflectedClass.instantiate();
    this.javaObject.initialize(thread);

    this.javaObject._putField(
      'clazz',
      'Ljava/lang/Class;',
      'java/lang/reflect/Field',
      Field.reflectedClass.getJavaObject()
    );
    this.javaObject._putField(
      'name',
      'Ljava/lang/String;',
      'java/lang/reflect/Field',
      thread.getJVM().getInternedString(this.fieldName)
    );
    this.javaObject._putField(
      'type',
      'Ljava/lang/Class;',
      'java/lang/reflect/Field',
      this.cls.getJavaObject()
    );
    this.javaObject._putField(
      'modifiers',
      'I',
      'java/lang/reflect/Field',
      this.accessFlags
    );
    this.javaObject._putField(
      'slot',
      'I',
      'java/lang/reflect/Field',
      this.slot
    );

    console.warn('getReflectedObject: not using signature, annotations');
    this.javaObject._putField(
      'signature',
      'Ljava/lang/String;',
      'java/lang/reflect/Field',
      null
    );
    this.javaObject._putField(
      'annotations',
      '[B',
      'java/lang/reflect/Field',
      null
    );

    this.javaObject.putNativeField('fieldRef', this);

    return { result: this.javaObject };
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
    if (value === undefined) {
      throw new Error('putValue: value is undefined');
    }
    this.value = value;
  }

  cloneField() {
    const field = new Field(
      this.cls,
      this.fieldName,
      this.fieldDesc,
      this.accessFlags,
      this.attributes,
      this.slot
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

  /**
   * Checks if the current method has access to the field
   * @param thread thread accessing the field
   * @param isStaticAccess true for getstatic/putstatic
   * @param isPut true for putstatic/putfield
   * @returns
   */
  checkAccess(
    thread: Thread,
    isStaticAccess: boolean = false,
    isPut: boolean = false
  ): Result<Field> {
    // logical xor
    if (isStaticAccess !== this.checkStatic()) {
      return {
        exceptionCls: 'java/lang/IncompatibleClassChangeError',
        msg: '',
      };
    }

    const invokerClass = thread.getClass();
    const fieldClass = this.getClass();
    // FIXME: check innter classes if private
    if (this.checkPrivate() && invokerClass !== fieldClass) {
      return { exceptionCls: 'java/lang/IllegalAccessError', msg: '' };
    }

    if (
      this.checkProtected() &&
      !invokerClass.checkCast(fieldClass) &&
      invokerClass.getPackageName() !== this.getClass().getPackageName()
    ) {
      return { exceptionCls: 'java/lang/IllegalAccessError', msg: '' };
    }

    const invokerMethod = thread.getMethod();
    if (
      isPut &&
      this.checkFinal() &&
      (fieldClass !== invokerClass ||
        invokerMethod.getName() !== (isStaticAccess ? '<clinit>' : '<init>'))
    ) {
      return { exceptionCls: 'java/lang/IllegalAccessError', msg: '' };
    }

    return { result: this };
  }
}
