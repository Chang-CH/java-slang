import { InternalStackFrame } from '#jvm/components/stackframe';
import Thread from '#jvm/components/thread';
import { SuccessResult } from '#types/Result';
import { ReferenceClassData } from '#types/class/ClassData';
import type { JvmArray } from '#types/reference/Array';
import type { JvmObject } from '#types/reference/Object';
import { logger } from '#utils/index';

const functions = {
  'registerNatives()V': (thread: Thread, locals: any[]) => {
    thread.returnStackFrame();
  },
  'arraycopy(Ljava/lang/Object;ILjava/lang/Object;II)V': (
    thread: Thread,
    locals: any[]
  ) => {
    // is static.
    const src = locals[0] as JvmArray;
    const srcPos = locals[1];
    const dest = locals[2] as JvmArray;
    const destPos = locals[3];
    const length = locals[4];

    if (src === null || dest === null) {
      thread.throwNewException(
        'java/lang/NullPointerException',
        'Cannot copy to/from a null array.'
      );
      return;
    }

    if (
      src.getClass().getName()[0] !== '[' ||
      dest.getClass().getName()[0] !== '['
    ) {
      thread.throwNewException(
        'java/lang/ArrayStoreException',
        'src and dest arguments must be of array type.'
      );
      return;
    }

    if (
      srcPos < 0 ||
      srcPos + length > src.len() ||
      destPos < 0 ||
      destPos + length > dest.len() ||
      length < 0
    ) {
      thread.throwNewException(
        'java/lang/ArrayIndexOutOfBoundsException',
        'Tried to write to an illegal index in an array.'
      );
      return;
    }

    const srcCls = src.getClass();
    const destCls = dest.getClass();

    // copy src data
    const data = [...src.getJsArray()];

    if (srcCls.checkCast(destCls)) {
      // safe to copy
      for (let i = 0; i < length; i++) {
        dest.set(destPos + i, data[i + srcPos]);
      }
    } else {
      for (let i = 0; i < length; i++) {
        dest.set(destPos + i, data[i + srcPos]);
      }
    }

    thread.returnStackFrame();
  },
  'initProperties(Ljava/util/Properties;)Ljava/util/Properties;': (
    thread: Thread,
    locals: any[]
  ) => {
    const props = locals[0] as JvmObject;
    const systemProperties = {
      'file.encoding': 'UTF-8',
      'line.separator': '\n',
      'file.separator': '/',
      'path.separator': ':',
      'user.home': '.',
      'sun.arch.data.model': '32',
      'sun.jnu.encoding': 'UTF-8',
    };

    const loader = thread.getClass().getLoader();
    const propClass = props.getClass();
    const method = propClass.getMethod(
      'setProperty(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/Object;'
    );
    if (!method) {
      thread.throwNewException(
        'java/lang/NoSuchMethodException',
        'setProperty(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/Object;'
      );
      return;
    }

    thread.returnStackFrame(props);

    Object.entries(systemProperties).forEach(([key, value]) => {
      const keyObj = thread.getJVM().getInternedString(key);
      const valueObj = thread.getJVM().getInternedString(value);

      thread.invokeStackFrame(
        new InternalStackFrame(
          props.getClass() as ReferenceClassData,
          method,
          0,
          [props, keyObj, valueObj],
          () => {}
        )
      );
    });
  },
  'setIn0(Ljava/io/InputStream;)V': (thread: Thread, locals: any[]) => {
    const stream = locals[0] as JvmObject;
    const sysCls = (
      thread
        .getJVM()
        .getBootstrapClassLoader()
        .getClass('java/lang/System') as SuccessResult<ReferenceClassData>
    ).result;

    const fr = sysCls.lookupField('inLjava/io/InputStream;');
    if (fr) {
      fr.putValue(stream);
    }
    thread.returnStackFrame();
  },
  'setOut0(Ljava/io/PrintStream;)V': (thread: Thread, locals: any[]) => {
    const stream = locals[0] as JvmObject;
    const sysCls = (
      thread
        .getJVM()
        .getBootstrapClassLoader()
        .getClass('java/lang/System') as SuccessResult<ReferenceClassData>
    ).result;

    const fr = sysCls.lookupField('outLjava/io/PrintStream;');
    if (fr) {
      fr.putValue(stream);
    }
    thread.returnStackFrame();
  },
  'setErr0(Ljava/io/PrintStream;)V': (thread: Thread, locals: any[]) => {
    const stream = locals[0] as JvmObject;
    const sysCls = (
      thread
        .getJVM()
        .getBootstrapClassLoader()
        .getClass('java/lang/System') as SuccessResult<ReferenceClassData>
    ).result;

    const fr = sysCls.lookupField('errLjava/io/PrintStream;');
    if (fr) {
      fr.putValue(stream);
    }
    thread.returnStackFrame();
  },

  'currentTimeMillis()J': (thread: Thread, locals: any[]) => {
    const time = BigInt(Date.now());
    thread.returnStackFrame64(time);
  },

  'identityHashCode(Ljava/lang/Object;)I': (thread: Thread, locals: any[]) => {
    logger.warn('System.identityHashCode(Ljava/lang/Object;)I not implemented');
    thread.returnStackFrame(0);
  },

  'nanoTime()J': (thread: Thread, locals: any[]) => {
    const time = BigInt(process.hrtime.bigint());
    console.log('nanotime');
    thread.returnStackFrame64(time);
  },
};

export default functions;
