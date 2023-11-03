import AbstractClassLoader from '#jvm/components/ClassLoader/AbstractClassLoader';
import { AttributeInfo } from '#jvm/external/ClassFile/types/attributes';
import { FieldInfo } from '#jvm/external/ClassFile/types/fields';
import { MethodInfo } from '#jvm/external/ClassFile/types/methods';
import { ConstantRef } from '#types/ConstantRef';
import { JvmArray } from '#types/reference/Array';
import { ClassRef } from './ClassRef';

export class ArrayClassRef extends ClassRef {
  constructor(
    constantPool: Array<ConstantRef>,
    accessFlags: number,
    thisClass: string,
    superClass: ClassRef | null,
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

    for (let i = 0; i < this.interfaces.length; i++) {
      let inter = this.interfaces[i];
      if (inter.checkCast(castTo)) {
        return true;
      }
    }

    const superClass = this.getSuperClass();

    if (superClass === null) {
      return false;
    }

    return superClass.checkCast(castTo);
  }

  // TODO: override checkcast
}
