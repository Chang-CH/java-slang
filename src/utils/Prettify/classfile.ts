import { ClassFile } from '#types/ClassFile';

export const classFileToText = (cls: ClassFile) => {
  const result: any = cls;
  for (let i = 0; i < result.constant_pool.length; i += 1) {
    result.constant_pool[i].index = i;
  }

  for (const method of result.methods) {
    method.name = result.constant_pool[method.name_index].value;
  }
  return JSON.stringify(result, null, 2);
};
