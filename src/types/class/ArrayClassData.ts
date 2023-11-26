import AbstractClassLoader from '#jvm/components/ClassLoader/AbstractClassLoader';
import { JvmArray } from '#types/reference/Array';
import { ErrorResult, checkError } from '#types/result';
import { CLASS_TYPE, ClassData, ReferenceClassData } from './ClassData';

export class ArrayClassData extends ClassData {
  private componentClass?: ClassData;

  constructor(
    accessFlags: number,
    thisClass: string,
    loader: AbstractClassLoader,
    componentClass: ClassData,
    onError: (error: ErrorResult) => void
  ) {
    super(loader, accessFlags, CLASS_TYPE.ARRAY, thisClass);
    this.packageName = 'java/lang';
    this.componentClass = componentClass;

    // #region load array superclasses/interfaces
    const objRes = loader.getClassRef('java/lang/Object');
    if (checkError(objRes)) {
      onError(objRes);
      return;
    }
    const cloneableRes = loader.getClassRef('java/lang/Cloneable');
    if (checkError(cloneableRes)) {
      onError(cloneableRes);
      return;
    }
    const serialRes = loader.getClassRef('java/io/Serializable');
    if (checkError(serialRes)) {
      onError(serialRes);
      return;
    }
    // #endregion
    this.superClass = objRes.result as ReferenceClassData;
    this.interfaces.push(cloneableRes.result as ReferenceClassData);
    this.interfaces.push(serialRes.result as ReferenceClassData);
  }

  getDescriptor(): string {
    return this.getClassname();
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

  checkArray(): this is ArrayClassData {
    return true;
  }

  checkCast(castTo: ClassData): boolean {
    if (this === castTo) {
      return true;
    }

    // Not an array class
    if (!castTo.checkArray()) {
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
