import {
  asDouble,
  asFloat,
  attrInfo2Interface,
  getArgs,
  parseMethodDescriptor,
} from '#utils/index';
import {
  METHOD_FLAGS,
  MethodInfo,
} from '#jvm/external/ClassFile/types/methods';
import { ArrayClassData } from './ClassData';
import { ClassData, ReferenceClassData } from './ClassData';
import {
  ConstantClass,
  ConstantMethodref,
  ConstantNameAndType,
  ConstantUtf8,
} from './Constants';
import { JavaType, type JvmObject } from '../reference/Object';
import Thread from '#jvm/components/thread';
import { JavaStackFrame, NativeStackFrame } from '#jvm/components/stackframe';
import { ConstantPool } from '#jvm/components/ConstantPool';
import { Code, Exceptions, IAttribute, Signature } from './Attributes';
import {
  ImmediateResult,
  checkError,
  ErrorResult,
  checkSuccess,
} from '#types/Result';
import { Sign } from 'node:crypto';
import { SignatureAttribute } from '#jvm/external/ClassFile/types/attributes';
import { JvmArray } from '#types/reference/Array';
import { OPCODE } from '#jvm/external/ClassFile/constants/instructions';

export interface MethodHandler {
  startPc: number;
  endPc: number;
  handlerPc: number;
  catchType: null | ReferenceClassData;
}

export class Method {
  private cls: ReferenceClassData;
  private code: Code | null; // native methods have no code
  private accessFlags: number;
  private name: string;
  private descriptor: string;
  private attributes: { [attributeName: string]: IAttribute } = {};

  private static reflectMethodClass: ReferenceClassData | null = null;
  private static reflectConstructorClass: ReferenceClassData | null = null;
  private bridgeCounter = 0;

  private javaObject?: JvmObject;
  private slot: number;

  constructor(
    cls: ReferenceClassData,
    accessFlags: number,
    name: string,
    descriptor: string,
    attributes: { [attributeName: string]: IAttribute },
    slot: number
  ) {
    this.cls = cls;
    this.code = (attributes['Code'] as Code) ?? null;
    this.accessFlags = accessFlags;
    this.name = name;
    this.descriptor = descriptor;
    this.attributes = attributes;
    this.slot = slot;
  }

  /**
   * factory method for class loaders to create a method
   */
  static fromInfo(
    cls: ReferenceClassData,
    method: MethodInfo,
    slot: number,
    constantPool: ConstantPool
  ) {
    // get name and descriptor
    const name = (cls.getConstant(method.nameIndex) as ConstantUtf8).get();
    const descriptor = (
      cls.getConstant(method.descriptorIndex) as ConstantUtf8
    ).get();
    const accessFlags = method.accessFlags;

    // get attributes
    const attributes = attrInfo2Interface(method.attributes, constantPool);

    return new Method(cls, accessFlags, name, descriptor, attributes, slot);
  }

  /**
   * Type guard function to check if an object is a Method.
   */
  static checkMethod(obj: any): obj is Method {
    return obj.code !== undefined;
  }

  checkSignaturePolymorphic() {
    return (
      this.cls.getClassname() === 'java/lang/invoke/MethodHandle' &&
      this.descriptor === '([Ljava/lang/Object;)Ljava/lang/Object;' &&
      this.checkVarargs() &&
      this.checkNative()
    );
  }

  /**
   * Gets the reflected java object for this method.
   */
  getReflectedObject(thread: Thread): ImmediateResult<JvmObject> {
    if (this.javaObject) {
      return { result: this.javaObject };
    }

    const loader = this.cls.getLoader();
    const caRes = loader.getClass('[Ljava/lang/Class;');
    if (checkError(caRes)) {
      return caRes;
    }
    const caCls = caRes.result as ArrayClassData;

    // #region create parameter class array
    const { args, ret } = parseMethodDescriptor(this.descriptor);
    const parameterTypes = caCls.instantiate();
    let error: ErrorResult | null = null;
    parameterTypes.initArray(
      args.length,
      args.map(arg => {
        if (arg.referenceCls) {
          const res = loader.getClass(arg.referenceCls);
          if (checkError(res)) {
            error = res;
            return null;
          }
          return res.result.getJavaObject();
        }

        return loader.getPrimitiveClass(arg.type).getJavaObject();
      })
    );
    if (error !== null) {
      return error;
    }
    // #endregion

    // #region create return class
    let returnType: JvmObject;
    if (ret.referenceCls) {
      const res = loader.getClass(ret.referenceCls);
      if (checkError(res)) {
        return res;
      }
      returnType = res.result.getJavaObject();
    } else {
      returnType = loader.getPrimitiveClass(ret.type).getJavaObject();
    }
    // #endregion

    // create exception class array
    const exceptionTypes = caCls.instantiate();
    const exceptions = this.attributes['Exceptions'] as Exceptions;
    let err;
    if (exceptions) {
      exceptionTypes.initArray(
        exceptions.exceptionTable.length,
        exceptions.exceptionTable.map(exceptionClass => {
          const res = exceptionClass.resolve();
          if (checkError(res)) {
            err = res;
            return null;
          }
          return res.result.getJavaObject();
        })
      );
    } else {
      exceptionTypes.initArray(0, []);
    }

    // modifiers
    const modifiers = this.accessFlags;

    // signature
    let signature = this.attributes['Signature']
      ? thread
          .getJVM()
          .getInternedString(
            (this.attributes['Signature'] as Signature).signature
          )
      : null;

    // annotations
    const baRes = loader.getClass('[B');
    if (checkError(baRes)) {
      return baRes;
    }
    const baCls = baRes.result as ArrayClassData;
    const annotations = baCls.instantiate() as JvmArray;
    annotations.initArray(0, []);
    const anno = this.attributes['RuntimeVisibleAnnotations'];
    if (anno) {
      // convert attribute back to byte array
      console.warn('reflected method annotations not implemented');
    }

    // parameter annotations
    const parameterAnnotations = baCls.instantiate() as JvmArray;
    parameterAnnotations.initArray(0, []);
    const pAnno = this.attributes['RuntimeVisibleParameterAnnotations'];
    if (pAnno) {
      // convert attribute back to byte array
      console.warn('reflected method annotations not implemented');
    }

    let javaObject: JvmObject;

    // #region create method object
    // constructor
    const isConstructor = this.name === '<init>';
    if (isConstructor) {
      // load constructor class
      if (!Method.reflectConstructorClass) {
        const fRes = loader.getClass('java/lang/reflect/Constructor');
        if (checkError(fRes)) {
          return fRes;
        }
        Method.reflectConstructorClass = fRes.result as ReferenceClassData;
      }

      javaObject = Method.reflectConstructorClass.instantiate();
      const initRes = javaObject.initialize(thread);
      if (!checkSuccess(initRes)) {
        if (checkError(initRes)) {
          return initRes;
        }
        throw new Error('Reflected method should not have static initializer');
      }
    } else {
      if (!Method.reflectMethodClass) {
        const fRes = thread
          .getClass()
          .getLoader()
          .getClass('java/lang/reflect/Method');
        if (checkError(fRes)) {
          return fRes;
        }
        Method.reflectMethodClass = fRes.result as ReferenceClassData;
      }

      javaObject = Method.reflectMethodClass.instantiate();
      const initRes = javaObject.initialize(thread);
      if (!checkSuccess(initRes)) {
        if (checkError(initRes)) {
          return initRes;
        }
        throw new Error('Reflected method should not have static initializer');
      }

      javaObject._putField(
        'name',
        'Ljava/lang/String;',
        'java/lang/reflect/Method',
        thread.getJVM().getInternedString(this.name)
      );

      javaObject._putField(
        'returnType',
        'Ljava/lang/Class;',
        'java/lang/reflect/Method',
        returnType
      );
      javaObject._putField(
        'annotationDefault',
        '[B',
        'java/lang/reflect/Method',
        null
      );
    }
    // #endregion

    // #region put common fields
    javaObject._putField(
      'clazz',
      'Ljava/lang/Class;',
      isConstructor
        ? 'java/lang/reflect/Constructor'
        : 'java/lang/reflect/Method',
      this.cls.getJavaObject()
    );
    javaObject._putField(
      'parameterTypes',
      '[Ljava/lang/Class;',
      isConstructor
        ? 'java/lang/reflect/Constructor'
        : 'java/lang/reflect/Method',
      parameterTypes
    );
    javaObject._putField(
      'exceptionTypes',
      '[Ljava/lang/Class;',
      isConstructor
        ? 'java/lang/reflect/Constructor'
        : 'java/lang/reflect/Method',
      exceptionTypes
    );
    javaObject._putField(
      'modifiers',
      'I',
      isConstructor
        ? 'java/lang/reflect/Constructor'
        : 'java/lang/reflect/Method',
      modifiers
    );
    javaObject._putField(
      'slot',
      'I',
      isConstructor
        ? 'java/lang/reflect/Constructor'
        : 'java/lang/reflect/Method',
      this.slot
    );
    javaObject._putField(
      'signature',
      'Ljava/lang/String;',
      isConstructor
        ? 'java/lang/reflect/Constructor'
        : 'java/lang/reflect/Method',
      signature
    );
    javaObject._putField(
      'annotations',
      '[B',
      isConstructor
        ? 'java/lang/reflect/Constructor'
        : 'java/lang/reflect/Method',
      annotations
    );
    javaObject._putField(
      'parameterAnnotations',
      '[B',
      isConstructor
        ? 'java/lang/reflect/Constructor'
        : 'java/lang/reflect/Method',
      parameterAnnotations
    );
    // #endregion

    javaObject.putNativeField('methodRef', this);

    this.javaObject = javaObject;
    return { result: javaObject };
  }

  getName() {
    return this.name;
  }

  getDescriptor() {
    return this.descriptor;
  }

  /**
   * Gets the slot number of this method in the class.
   * Slot numbers can be used find a method given a class.
   */
  getSlot() {
    return this.slot;
  }

  getClass() {
    return this.cls;
  }

  getMaxStack() {
    return this.code ? this.code.maxStack : 0;
  }

  getExceptionHandlers() {
    if (!this.code) {
      return [];
    }
    return this.code.exceptionTable;
  }

  getAccessFlags() {
    return this.accessFlags;
  }

  /**
   * Pops and returns the arguments of this method from the stack.
   * Wide primitives occupy 2 indexes for non native methods.
   */
  getArgs(thread: Thread): any[] {
    return getArgs(thread, this.descriptor, this.checkNative());
  }

  generateBridgeMethod() {
    const isStatic = this.checkStatic();
    const bridgeDescriptor = isStatic
      ? this.descriptor
      : `(${this.cls.getClassname()};${this.descriptor.slice(1)}`;

    const pdesc = parseMethodDescriptor(this.descriptor);
    let maxStack = 0;
    let maxLocals = 0;

    // #region build bytecode
    let bytecode = [];
    let constantIdx = 0;
    // push args
    if (!isStatic) {
      bytecode.push(OPCODE.ALOAD_0);
      maxStack++;
      maxLocals++;
    }
    for (const arg of pdesc.args) {
      let stacksize = 1;
      switch (arg.type) {
        case JavaType.byte:
        case JavaType.char:
        case JavaType.short:
        case JavaType.boolean:
        case JavaType.int:
          bytecode.push(OPCODE.ILOAD);
          break;
        case JavaType.double:
          bytecode.push(OPCODE.DLOAD);
          stacksize++;
          break;
        case JavaType.float:
          bytecode.push(OPCODE.FLOAD);
          break;
        case JavaType.long:
          bytecode.push(OPCODE.LLOAD);
          stacksize++;
          break;
        case JavaType.array:
        case JavaType.reference:
          bytecode.push(OPCODE.ALOAD);
          break;
        case JavaType.void:
          throw new Error('void type in method descriptor');
      }
      bytecode.push(maxLocals);
      maxStack += stacksize;
      maxLocals += stacksize;
    }

    // invoke original method
    bytecode.push(isStatic ? OPCODE.INVOKESTATIC : OPCODE.INVOKESPECIAL);
    constantIdx = bytecode.length;
    let index = this.cls.getMethodConstantIndex(this);
    if (index <= 0) {
      const nc = new ConstantUtf8(this.cls, this.name);
      const dc = new ConstantUtf8(this.cls, this.descriptor);
      const nt = new ConstantNameAndType(this.cls, nc, dc);
      this.cls.insertConstant(nc);
      this.cls.insertConstant(dc);
      this.cls.insertConstant(nt);

      const cnc = new ConstantUtf8(this.cls, this.cls.getClassname());
      const cc = ConstantClass.asResolved(this.cls, cnc, this.cls);
      this.cls.insertConstant(cnc);
      this.cls.insertConstant(cc);

      const mc = ConstantMethodref.asResolved(this.cls, cc, nt, this);
      index = this.cls.insertConstant(mc);
    }
    bytecode.push(index);

    // return
    switch (pdesc.ret.type) {
      case JavaType.byte:
      case JavaType.char:
      case JavaType.short:
      case JavaType.boolean:
      case JavaType.int:
        bytecode.push(OPCODE.IRETURN);
        maxStack = Math.max(maxStack, 1);
        break;
      case JavaType.double:
        bytecode.push(OPCODE.DRETURN);
        maxStack = Math.max(maxStack, 2);
        break;
      case JavaType.float:
        bytecode.push(OPCODE.FRETURN);
        maxStack = Math.max(maxStack, 1);
        break;
      case JavaType.long:
        bytecode.push(OPCODE.LRETURN);
        maxStack = Math.max(maxStack, 2);
        break;
      case JavaType.array:
      case JavaType.reference:
        bytecode.push(OPCODE.ARETURN);
        maxStack = Math.max(maxStack, 1);
        break;
      case JavaType.void:
    }

    const ab = new ArrayBuffer(bytecode.length + 1);
    const dv = new DataView(ab);
    let dvidx = 0;
    for (let i = 0; i < bytecode.length; i++) {
      if (i !== constantIdx) {
        dv.setUint8(dvidx++, bytecode[i]);
      } else {
        dv.setUint16(dvidx, bytecode[i]);
        dvidx += 2;
      }
    }
    // #endregion

    const bridge = new Method(
      this.cls,
      METHOD_FLAGS.ACC_SYNTHETIC | METHOD_FLAGS.ACC_STATIC,
      this.name + '$' + this.bridgeCounter++,
      bridgeDescriptor,
      {
        Code: {
          name: 'Code',
          maxStack: maxStack,
          maxLocals: maxLocals,
          codeLength: dv.buffer.byteLength,
          code: dv,
          exceptionTableLength: 0,
          exceptionTable: [],
          attributes: {},
        } as Code,
      },
      -1 // FIXME: get a slot number from cls
    );

    this.cls.addMethod(bridge);

    return bridge;
  }

  /**
   * flags
   */
  checkPublic() {
    return (this.accessFlags & METHOD_FLAGS.ACC_PUBLIC) !== 0;
  }

  checkPrivate() {
    return (this.accessFlags & METHOD_FLAGS.ACC_PRIVATE) !== 0;
  }

  checkProtected() {
    return (this.accessFlags & METHOD_FLAGS.ACC_PROTECTED) !== 0;
  }

  checkDefault() {
    return (
      !this.checkPublic() && !this.checkPrivate() && !this.checkProtected()
    );
  }

  checkStatic() {
    return (this.accessFlags & METHOD_FLAGS.ACC_STATIC) !== 0;
  }

  checkFinal() {
    return (this.accessFlags & METHOD_FLAGS.ACC_FINAL) !== 0;
  }

  checkSynchronized() {
    return (this.accessFlags & METHOD_FLAGS.ACC_SYNCHRONIZED) !== 0;
  }

  checkBridge() {
    return (this.accessFlags & METHOD_FLAGS.ACC_BRIDGE) !== 0;
  }

  checkVarargs() {
    return (this.accessFlags & METHOD_FLAGS.ACC_VARARGS) !== 0;
  }

  checkNative() {
    return (this.accessFlags & METHOD_FLAGS.ACC_NATIVE) !== 0;
  }

  checkAbstract() {
    return (this.accessFlags & METHOD_FLAGS.ACC_ABSTRACT) !== 0;
  }

  checkStrict() {
    return (this.accessFlags & METHOD_FLAGS.ACC_STRICT) !== 0;
  }

  checkSynthetic() {
    return (this.accessFlags & METHOD_FLAGS.ACC_SYNTHETIC) !== 0;
  }

  /**
   * Checks if this method is accessible to a given class through a symbolic reference.
   */
  checkAccess(accessingClass: ClassData, symbolicClass: ClassData) {
    const declaringCls = this.getClass();

    // this is public
    if (this.checkPublic()) {
      return true;
    }

    const isSamePackage =
      declaringCls.getPackageName() === accessingClass.getPackageName();

    if (this.checkDefault()) {
      return isSamePackage;
    }

    if (this.checkProtected()) {
      if (isSamePackage) {
        return true;
      }

      // this is protected and is declared in a class C, and D is either a subclass of C or C itself
      if (!accessingClass.checkCast(declaringCls)) {
        return false;
      }

      // if this is not static, then the symbolic reference to this must contain a symbolic reference to a class T,
      // such that T is either a subclass of D, a superclass of D, or D itself.
      return (
        this.checkStatic() ||
        declaringCls.checkCast(symbolicClass) ||
        symbolicClass.checkCast(declaringCls)
      );
    }

    // R is private
    return accessingClass === declaringCls;
  }

  _getCode() {
    return this.code;
  }
}
