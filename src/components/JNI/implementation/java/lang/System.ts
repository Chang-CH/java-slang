import { JNI } from '#jvm/components/JNI';
import Thread from '#jvm/components/Thread/Thread';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';

export const registerJavaLangSystem = (jni: JNI) => {
  jni.registerNativeMethod(
    'java/lang/System',
    'registerNatives()V',
    (thread: Thread, locals: any[]) => {
      thread.returnSF();
    }
  );
  jni.registerNativeMethod(
    'java/lang/System',
    'arraycopy(Ljava/lang/Object;ILjava/lang/Object;II)V',
    (thread: Thread, locals: any[]) => {
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
        src.getClass().getClassname()[0] !== '[' ||
        dest.getClass().getClassname()[0] !== '['
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

      if (srcCls.checkCast(destCls)) {
        // safe to copy
        for (let i = 0; i < length; i++) {
          dest.set(destPos + i, src.get(i + srcPos));
        }
      } else {
        // FIXME: we should check if the types are actually compatible
        for (let i = 0; i < length; i++) {
          dest.set(destPos + i, src.get(i + srcPos));
        }
      }

      thread.returnSF();
    }
  );

  jni.registerNativeMethod(
    'java/lang/System',
    'initProperties(Ljava/util/Properties;)Ljava/util/Properties;',
    (thread: Thread, locals: any[]) => {
      const props = locals[0] as JvmObject;
      // FIXME: use actual values
      // modified from Doppio https://github.com/plasma-umass/doppio/blob/master/src/jvm.ts
      const systemProperties = {
        'java.class.path': 'example',
        'java.home': 'natives',
        'java.ext.dirs': 'natives/lib/ext',
        'java.io.tmpdir': 'temp',
        'sun.boot.class.path': 'natives',
        'file.encoding': 'UTF-8',
        'java.vendor': 'Source Academy',
        'java.version': '1.0',
        'java.vendor.url': 'https://github.com/source-academy/java-slang',
        'java.class.version': '52.0',
        'java.specification.version': '1.8',
        'line.separator': '\n',
        'file.separator': '/',
        'path.separator': ':',
        'user.dir': 'example',
        'user.home': '.',
        'user.name': 'SourceAcademy',
        'os.name': 'source',
        'os.arch': 'js',
        'os.version': '0',
        'java.vm.name': 'Source Academy JVM',
        'java.vm.version': '0.1',
        'java.vm.vendor': 'Source Academy',
        'java.awt.headless': 'true', // true if we're using the console frontend
        'java.awt.graphicsenv': 'classes.awt.CanvasGraphicsEnvironment',
        'jline.terminal': 'jline.UnsupportedTerminal', // we can't shell out to `stty`,
        'sun.arch.data.model': '32', // Identify as 32-bit, because that's how we act.
        'sun.jnu.encoding': 'UTF-8', // Determines how Java parses command line options.
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

      thread.returnSF(props);

      Object.entries(systemProperties).forEach(([key, value]) => {
        const keyObj = thread.getJVM().getInternedString(key);
        const valueObj = thread.getJVM().getInternedString(value);

        thread.invokeSf(
          props.getClass(),
          method,
          0,
          [props, keyObj, valueObj],
          () => {}
        );
      });
    }
  );
};
