import AbstractClassLoader from '#jvm/components/ClassLoader/AbstractClassLoader';
import {
  AttributeInfo,
  CodeAttribute,
} from '#jvm/external/ClassFile/types/attributes';
import { ConstantInfo } from '#jvm/external/ClassFile/types/constants';
import { FieldInfo } from '#jvm/external/ClassFile/types/fields';
import { MethodInfo } from '#jvm/external/ClassFile/types/methods';
import { MethodHandler } from '#types/class/Method';
import { JvmArray } from '#types/reference/Array';
import { ClassData } from './ClassData';

export class ArrayClassData extends ClassData {
  private componentClass?: ClassData;

  constructor(
    constantPool: Array<ConstantInfo>,
    accessFlags: number,
    thisClass: string,
    superClass: ClassData,
    interfaces: Array<ClassData>,
    fields: Array<FieldInfo>,
    methods: {
      method: MethodInfo;
      exceptionHandlers: MethodHandler[];
      code: CodeAttribute | null;
    }[],
    attributes: Array<AttributeInfo>,
    loader: AbstractClassLoader
  ) {
    super(
      constantPool,
      accessFlags,
      thisClass,
      superClass,
      interfaces,
      fields,
      methods,
      attributes,
      loader
    );
    this.packageName = 'java/lang';
  }

  setComponentClass(itemClass: ClassData) {
    this.componentClass = itemClass;
  }

  getComponentClass(): ClassData {
    if (this.componentClass === undefined) {
      throw new Error('Array item class not set');
    }
    return this.componentClass;
  }

  instantiate(): JvmArray {
    return new JvmArray(this);
  }

  static check(c: ClassData): c is ArrayClassData {
    return c.getClassname().startsWith('[');
  }

  checkCast(castTo: ClassData): boolean {
    if (this === castTo) {
      return true;
    }

    // Not an array class
    if (!ArrayClassData.check(castTo)) {
      // is a class
      if (!castTo.checkInterface()) {
        // If T is a class type, then T must be Object.
        // array superclass is Object.
        return this.superClass === castTo;
      }

      // is an interface
      for (let i = 0; i < this.interfaces.length; i++) {
        let inter = this.interfaces[i];
        // If T is an interface type, then T must be one of the interfaces implemented by arrays
        if (inter === castTo) {
          return true;
        }
      }
      return false;
    }

    // TC and SC are reference types, and type SC can be cast to TC by recursive application of these rules.
    // Primitive classes are loaded as well anyways, we can use the same logic.
    return this.getComponentClass().checkCast(castTo.getComponentClass());
  }
}
