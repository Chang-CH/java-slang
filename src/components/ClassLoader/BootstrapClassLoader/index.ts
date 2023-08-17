/**
 * Reads classfile as byte array and loads it into memory area
 */
export default class BootstrapClassLoader {
  /**
   * Reads a class file to a JS object
   * @param view ArrayBuffer DataView representing the binary class file
   * @returns Object representing the class
   */
  parseClass(view: DataView): any {
    let offset = 0;

    const cls: any = {
      magic: -1,
      minor_version: -1,
      major_version: -1,
      constant_pool_count: -1,
      constant_pool: [],
      access_flags: -1,
      this_class: -1,
      super_class: -1,
      interfaces_count: -1,
      interfaces: [],
      fields_count: -1,
      fields: [],
      methods_count: -1,
      methods: [],
      attributes_count: -1,
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

    // TODO: continue parsing class file
    return cls;
  }
}
