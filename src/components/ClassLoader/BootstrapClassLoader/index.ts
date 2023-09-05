import { constantTagMap } from '#constants/ClassFile/constants';
import MemoryArea from '#jvm/components/MemoryArea';
import { ClassFile } from '#types/ClassFile';
import { CONSTANT_TAG } from '#constants/ClassFile/constants';
import OsInterface from '#utils/OsInterface';
import { readAttribute } from './utils/readAttributes';
import { readConstants } from './utils/readConstants';
import { readField } from './utils/readField';
import { getMethodName, readMethod } from './utils/readMethod';
import {
  CONSTANT_Class_info,
  CONSTANT_Utf8_info,
} from '#types/ClassFile/constants';

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
      constant_pool: [],
      access_flags: 0,
      this_class: '',
      super_class: '',
      interfaces: [],
      fields: {},
      methods: {},
      attributes: [],
    };

    cls.magic = view.getUint32(offset);
    offset += 4;

    cls.minor_version = view.getUint16(offset);
    offset += 2;

    cls.major_version = view.getUint16(offset);
    offset += 2;

    const constant_pool_count = view.getUint16(offset);
    offset += 2;

    ({ result: cls.constant_pool, offset } = readConstants(
      view,
      offset,
      constant_pool_count
    ));

    cls.access_flags = view.getUint16(offset);
    offset += 2;

    const classIndex = cls.constant_pool[
      view.getUint16(offset)
    ] as CONSTANT_Class_info;
    const className = cls.constant_pool[
      classIndex.name_index
    ] as CONSTANT_Utf8_info;
    cls.this_class = className.value;
    offset += 2;

    const superClassIndex = cls.constant_pool[
      view.getUint16(offset)
    ] as CONSTANT_Class_info;
    const superClassName = cls.constant_pool[
      superClassIndex.name_index
    ] as CONSTANT_Utf8_info;
    cls.super_class = superClassName.value;
    offset += 2;

    const interfaces_count = view.getUint16(offset);
    offset += 2;
    cls.interfaces = [];
    for (let i = 0; i < interfaces_count; i += 1) {
      const interface_idx = cls.constant_pool[
        view.getUint16(offset)
      ] as CONSTANT_Class_info;
      const className = cls.constant_pool[
        interface_idx.name_index
      ] as CONSTANT_Utf8_info;
      cls.interfaces.push(className.value);
      // TODO: check index ok
      offset += 2;
    }

    const fields_count = view.getUint16(offset);
    offset += 2;

    cls.fields = {};
    for (let i = 0; i < fields_count; i += 1) {
      const { result, offset: resultOffset } = readField(
        cls.constant_pool,
        view,
        offset
      );
      const fieldName = cls.constant_pool[
        result.name_index
      ] as CONSTANT_Utf8_info;
      const fieldDesc = cls.constant_pool[
        result.descriptor_index
      ] as CONSTANT_Utf8_info;
      cls.fields[fieldName.value + fieldDesc.value] = result;
      offset = resultOffset;
    }

    const methods_count = view.getUint16(offset);
    offset += 2;

    cls.methods = {};
    for (let i = 0; i < methods_count; i += 1) {
      const { result, offset: resultOffset } = readMethod(
        cls.constant_pool,
        view,
        offset
      );

      cls.methods[getMethodName(result, cls.constant_pool)] = result;
      offset = resultOffset;
    }

    const attributes_count = view.getUint16(offset);
    offset += 2;

    cls.attributes = [];
    // TODO: get attributes
    for (let i = 0; i < attributes_count; i += 1) {
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
    console.warn('BootstrapClassLoader.prepareClass: not implemented.');
    return;
  }

  /**
   * Resolves symbolic references in the constant pool
   * @param cls class data to resolve
   * @returns class data with resolved references
   */
  linkClass(cls: ClassFile): ClassFile {
    console.warn('BootstrapClassLoader.linkClass: not implemented.');
    return cls;
  }

  /**
   * Adds the resolved class data to the memory area
   * @param cls resolved class data
   */
  loadClass(cls: ClassFile): void {
    console.warn('BootstrapClassLoader.loadClass: not implemented.');
    this.memoryArea.loadClass(this.getClassName(cls), cls);
  }

  getClassName(cls: ClassFile): string {
    return cls.this_class;
  }

  /**
   * Attempts to load a class file
   * @param className name of class to load
   */
  load(className: string, onFinish?: (data: ClassFile) => void): void {
    // TODO: verify jvm loading path etc.
    const classFile = this.os.readFile([className]); //FIXME: use classpath instead.
    let data = this.readClass(classFile);
    this.prepareClass(data);
    data = this.linkClass(data);
    this.loadClass(data);

    onFinish && onFinish(data);
  }
}
