import { ClassFile } from '#jvm/external/ClassFile/types';

export default abstract class AbstractSystem {
  abstract readFile(path: string): ClassFile;

  abstract stdout(message: string): void;

  abstract stderr(message: string): void;
}
