import Thread from '#jvm/components/thread/thread';

const loadStdlib = (name: string, location: string) => {
  return (
    onFinish: (lib: {
      [key: string]: (thread: Thread, locals: any[]) => void;
    }) => void
  ) => {
    import(location)
      .then(lib => {
        const { default: fns } = lib;
        onFinish(fns);
      })
      .catch(e => {
        console.log(e);
        throw new Error('load failed');
      });
  };
};

const stdlib: {
  [key: string]: {
    loader: (
      onFinish: (lib: {
        [key: string]: (thread: Thread, locals: any[]) => void;
      }) => void
    ) => void;
  };
} = {
  'java/io/FileOutputStream': {
    loader: loadStdlib(
      'java/io/FileOutputStream',
      './java/io/FileOutputStream'
    ),
  },
  'java/io/UnixFileSystem': {
    loader: loadStdlib('java/io/UnixFileSystem', './java/io/UnixFileSystem'),
  },
  'java/lang/invoke/MethodHandleNatives': {
    loader: loadStdlib(
      'java/lang/invoke/MethodHandleNatives',
      './java/lang/invoke/MethodHandleNatives'
    ),
  },
  'java/lang/reflect/Array': {
    loader: loadStdlib('java/lang/reflect/Array', './java/lang/reflect/Array'),
  },
  'java/lang/Class': {
    loader: loadStdlib('java/lang/Class', './java/lang/Class'),
  },
  'java/lang/ClassLoader': {
    loader: loadStdlib('java/lang/ClassLoader', './java/lang/ClassLoader'),
  },
  'java/lang/Object': {
    loader: loadStdlib('java/lang/Object', './java/lang/Object'),
  },
  'java/lang/Runtime': {
    loader: loadStdlib('java/lang/Runtime', './java/lang/Runtime'),
  },
  'java/lang/String': {
    loader: loadStdlib('java/lang/String', './java/lang/String'),
  },
  'java/lang/Double': {
    loader: loadStdlib('java/lang/Double', './java/lang/Double'),
  },
  'java/lang/Float': {
    loader: loadStdlib('java/lang/Float', './java/lang/Float'),
  },
  'java/lang/System': {
    loader: loadStdlib('java/lang/System', './java/lang/System'),
  },
  'java/lang/Thread': {
    loader: loadStdlib('java/lang/Thread', './java/lang/Thread'),
  },
  'java/security/AccessController': {
    loader: loadStdlib(
      'java/security/AccessController',
      './java/security/AccessController'
    ),
  },
  'sun/misc/Perf': {
    loader: loadStdlib('sun/misc/Perf', './sun/misc/Perf'),
  },
  'sun/misc/Unsafe': {
    loader: loadStdlib('sun/misc/Unsafe', './sun/misc/Unsafe'),
  },
  'sun/misc/VM': {
    loader: loadStdlib('sun/misc/VM', './sun/misc/VM'),
  },
  'sun/reflect/NativeConstructorAccessorImpl': {
    loader: loadStdlib(
      'sun/reflect/NativeConstructorAccessorImpl',
      './sun/reflect/NativeConstructorAccessorImpl'
    ),
  },
  'sun/reflect/NativeMethodAccessorImpl': {
    loader: loadStdlib(
      'sun/reflect/NativeMethodAccessorImpl',
      './sun/reflect/NativeMethodAccessorImpl'
    ),
  },
  'sun/reflect/Reflection': {
    loader: loadStdlib('sun/reflect/Reflection', './sun/reflect/Reflection'),
  },
  'source/Source': {
    loader: loadStdlib('source/Source', './source/Source'),
  },
};

export default stdlib;
