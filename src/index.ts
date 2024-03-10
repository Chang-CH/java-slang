import JVM from './jvm';
import CustomSystem from '#utils/CustomSystem';
import parseBin from '#utils/parseBinary';
import { ClassFile } from './external/ClassFile/types';

const setupJVM = (options: {
  mainClass?: string;
  javaClassPath?: string;
  userDir?: string;
  nativesPath?: string;
  callbacks: {
    readFileSync: (path: string) => ClassFile;
    readFile?: (path: string) => Promise<any>;
    stdout?: (message: string) => void;
    stderr?: (message: string) => void;
    onFinish?: () => void;
  };
}) => {
  const sys = new CustomSystem(
    options.callbacks.readFileSync,
    options.callbacks.readFile ??
      (async () => {
        throw new Error('readFile not implemented');
      }),
    options.callbacks.stdout ?? console.log,
    options.callbacks.stderr ?? console.error
  );

  const jvm = new JVM(sys, {
    javaClassPath: options.javaClassPath,
    nativesPath: options.nativesPath,
    userDir: options.userDir,
  });
  return () => jvm.run(options.mainClass ?? 'Main', options.callbacks.onFinish);
};

export { parseBin };

export default setupJVM;
