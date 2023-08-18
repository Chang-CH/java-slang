import { constantTagMap } from '#constants/ClassFile/constants';
import MemoryArea from '#jvm/components/MemoryArea';
import { ClassFile } from '#types/ClassFile';
import { CONSTANT_TAG } from '#types/ClassFile/constants';
import OsInterface from '#utils/OsInterface';
import { readAttribute } from './utils/readAttributes';
import { readConstant } from './utils/readConstants';
import { readField } from './utils/readField';
import { readMethod } from './utils/readMethod';

/**
 * Reads classfile as byte array and loads it into memory area
 */
export default class BootstrapClassLoader {
  private memoryArea: MemoryArea;
  private os: OsInterface;
  // TODO: add classpath etc.

  constructor(memoryArea: MemoryArea, os: OsInterface) {
    this.memoryArea = memoryArea;
    this.os = os;
  }

  /**
   * Reads a class file to a JS object
   * @param view ArrayBuffer DataView representing the binary class file
   * @returns Object representing the class
   */
  readClass(view: DataView): ClassFile {
    let offset = 0;

    const cls: ClassFile = {
      magic: 0,
      minor_version: 0,
      major_version: 0,
      constant_pool_count: 0,
      constant_pool: [],
      access_flags: 0,
      this_class: 0,
      super_class: 0,
      interfaces_count: 0,
      interfaces: [],
      fields_count: 0,
      fields: [],
      methods_count: 0,
      methods: [],
      attributes_count: 0,
      attributes: [],
    };

    cls.magic = view.getUint32(offset);
    offset += 4;

    cls.minor_version = view.getUint16(offset);
    offset += 2;

    cls.major_version = view.getUint16(offset);
    offset += 2;

    cls.constant_pool_count = view.getUint16(offset);
    offset += 2;

    // constant pool is 1 indexed
    cls.constant_pool = [{ tag: CONSTANT_TAG.CONSTANT_Class, name_index: 0 }];
    for (let i = 0; i < cls.constant_pool_count - 1; i += 1) {
      const tag = constantTagMap[view.getUint8(offset)];
      offset += 1;
      const { result, offset: resultOffset } = readConstant(view, offset, tag); // TODO: check index's in readConstant
      cls.constant_pool.push(result);
      offset = resultOffset;
    }

    cls.access_flags = view.getUint16(offset);
    offset += 2;

    cls.this_class = view.getUint16(offset);
    offset += 2;

    cls.super_class = view.getUint16(offset);
    offset += 2;

    cls.interfaces_count = view.getUint16(offset);
    offset += 2;

    // TODO: check interfaces 1 indexed.
    cls.interfaces = [];
    for (let i = 0; i < cls.interfaces_count; i += 1) {
      cls.interfaces.push(view.getUint16(offset));
      // TODO: check index ok
      offset += 2;
    }

    cls.fields_count = view.getUint16(offset);
    offset += 2;

    cls.fields = [];
    for (let i = 0; i < cls.fields_count; i += 1) {
      const { result, offset: resultOffset } = readField(
        cls.constant_pool,
        view,
        offset
      );
      cls.fields.push(result);
      offset = resultOffset;
    }

    cls.methods_count = view.getUint16(offset);
    offset += 2;

    cls.methods = [];
    for (let i = 0; i < cls.methods_count; i += 1) {
      const { result, offset: resultOffset } = readMethod(
        cls.constant_pool,
        view,
        offset
      );
      cls.methods.push(result);
      offset = resultOffset;
    }

    cls.attributes_count = view.getUint16(offset);
    offset += 2;

    cls.attributes = [];
    // TODO: get attributes
    for (let i = 0; i < cls.attributes_count; i += 1) {
      const { result, offset: resultOffset } = readAttribute(
        cls.constant_pool,
        view,
        offset
      );
      cls.attributes.push(result);
      offset = resultOffset;
    }

    return cls;
  }

  /**
   * Prepares the class data by checking jvm constraints
   * @param cls class data to check
   * @returns Error, if any
   */
  prepareClass(cls: ClassFile): void | Error {
    console.error('BootstrapClassLoader.prepareClass: not implemented.');
    return;
  }

  /**
   * Resolves symbolic references in the constant pool
   * @param cls class data to resolve
   * @returns class data with resolved references
   */
  linkClass(cls: ClassFile): ClassFile {
    console.error('BootstrapClassLoader.linkClass: not implemented.');
    return cls;
  }

  /**
   * Adds the resolved class data to the memory area
   * @param cls resolved class data
   */
  loadClass(cls: ClassFile): void {
    console.error('BootstrapClassLoader.loadClass: not implemented.');
    this.memoryArea.loadClass('temp', cls);
  }

  /**
   * Attempts to load a class file
   * @param className name of class to load
   */
  load(className: string): void {
    // TODO: verify jvm loading path etc.
    const classFile = this.os.readFile([className]); //FIXME: use classpath instead.
    let data = this.readClass(classFile);
    this.prepareClass(data);
    data = this.linkClass(data);
    this.loadClass(data);
  }
}
