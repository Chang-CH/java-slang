import Thread from '../thread';

const loadStdlib = (name: string, location: string) => {
  return (
    onFinish: (lib: {
      [key: string]: (thread: Thread, locals: any[]) => void;
    }) => void
  ) => {
    console.log('LOGGNG');
    import(location)
      .then(lib => {
        const { default: fns } = lib;
        console.log('STDLIB LOAD');
        onFinish(fns);
      })
      .catch(e => {
        console.log(e);
        console.log('STDLIB LOAD FAIL');
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
      './implementation/java/io/FileOutputStream'
    ),
  },
  'java/io/UnixFileSystem': {
    loader: loadStdlib(
      'java/io/UnixFileSystem',
      './implementation/java/io/UnixFileSystem'
    ),
  },
  'java/lang/invoke/MethodHandleNatives': {
    loader: loadStdlib(
      'java/lang/invoke/MethodHandleNatives',
      './implementation/java/lang/invoke/MethodHandleNatives'
    ),
  },
  'java/lang/reflect/Array': {
    loader: loadStdlib(
      'java/lang/reflect/Array',
      './implementation/java/lang/reflect/Array'
    ),
  },
  'java/lang/Class': {
    loader: loadStdlib('java/lang/Class', './implementation/java/lang/Class'),
  },
  'java/lang/ClassLoader': {
    loader: loadStdlib(
      'java/lang/ClassLoader',
      './implementation/java/lang/ClassLoader'
    ),
  },
  'java/lang/Object': {
    loader: loadStdlib('java/lang/Object', './implementation/java/lang/Object'),
  },
  'java/lang/Runtime': {
    loader: loadStdlib(
      'java/lang/Runtime',
      './implementation/java/lang/Runtime'
    ),
  },
  'java/lang/String': {
    loader: loadStdlib('java/lang/String', './implementation/java/lang/String'),
  },
  'java/lang/Double': {
    loader: loadStdlib('java/lang/Double', './implementation/java/lang/Double'),
  },
  'java/lang/Float': {
    loader: loadStdlib('java/lang/Float', './implementation/java/lang/Float'),
  },
  'java/lang/System': {
    loader: loadStdlib('java/lang/System', './implementation/java/lang/System'),
  },
  'java/lang/Thread': {
    loader: loadStdlib('java/lang/Thread', './implementation/java/lang/Thread'),
  },
  'java/security/AccessController': {
    loader: loadStdlib(
      'java/security/AccessController',
      './implementation/java/security/AccessController'
    ),
  },
  'sun/misc/Perf': {
    loader: loadStdlib('sun/misc/Perf', './implementation/sun/misc/Perf'),
  },
  'sun/misc/Unsafe': {
    loader: loadStdlib('sun/misc/Unsafe', './implementation/sun/misc/Unsafe'),
  },
  'sun/misc/VM': {
    loader: loadStdlib('sun/misc/VM', './implementation/sun/misc/VM'),
  },
  'sun/reflect/NativeConstructorAccessorImpl': {
    loader: loadStdlib(
      'sun/reflect/NativeConstructorAccessorImpl',
      './implementation/sun/reflect/NativeConstructorAccessorImpl'
    ),
  },
  'sun/reflect/NativeMethodAccessorImpl': {
    loader: loadStdlib(
      'sun/reflect/NativeMethodAccessorImpl',
      './implementation/sun/reflect/NativeMethodAccessorImpl'
    ),
  },
  'sun/reflect/Reflection': {
    loader: loadStdlib(
      'sun/reflect/Reflection',
      './implementation/sun/reflect/Reflection'
    ),
  },
  'source/Source': {
    loader: loadStdlib('source/Source', './implementation/source/Source'),
  },
};

export default stdlib;
