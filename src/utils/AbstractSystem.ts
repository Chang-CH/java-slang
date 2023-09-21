import { ClassFile } from '#jvm/external/ClassFile/types';

export default abstract class AbstractSystem {
  abstract readFile(path: string): ClassFile;
}
