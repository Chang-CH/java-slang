import AbstractClassLoader from '#jvm/components/ClassLoader/AbstractClassLoader';
import { AttributeInfo } from '#jvm/external/ClassFile/types/attributes';
import { FieldInfo } from '#jvm/external/ClassFile/types/fields';
import { MethodInfo } from '#jvm/external/ClassFile/types/methods';
import { ConstantRef } from '#types/ConstantRef';
import { JvmArray } from '#types/reference/Array';
import { ClassRef } from './ClassRef';

export class ArrayClassRef extends ClassRef {
  private itemClass?: ClassRef;

  constructor(
    constantPool: Array<ConstantRef>,
    accessFlags: number,
    thisClass: string,
    superClass: ClassRef,
    interfaces: Array<ClassRef>,
    fields: Array<FieldInfo>,
    methods: Array<MethodInfo>,
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

  setItemClass(itemClass: ClassRef) {
    this.itemClass = itemClass;
  }

  getItemClass(): ClassRef {
    if (this.itemClass === undefined) {
      throw new Error('Array item class not set');
    }
    return this.itemClass;
  }

  instantiate(): JvmArray {
    return new JvmArray(this);
  }

  static check(c: ClassRef): c is ArrayClassRef {
    return c.getClassname().startsWith('[');
  }

  checkCast(castTo: ClassRef): boolean {
    if (this === castTo) {
      return true;
    }

    // Not an array class
    if (!ArrayClassRef.check(castTo)) {
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
    return this.getItemClass().checkCast(castTo.getItemClass());
  }
}
