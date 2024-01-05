import { InternalStackFrame } from '#jvm/components/stackframe';
import Thread from '#jvm/components/thread/thread';
import { ReferenceClassData } from '#types/class/ClassData';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';
import { autoUnbox, autoBox } from '#utils/index';

const functions = {
  'invoke0(Ljava/lang/reflect/Method;Ljava/lang/Object;[Ljava/lang/Object;)Ljava/lang/Object;':
    (thread: Thread, locals: any[]) => {
      const methodObj = locals[0] as JvmObject; // reflected method
      const methodCls = (
        methodObj._getField(
          'clazz',
          'Ljava/lang/Class;',
          'java/lang/reflect/Method'
        ) as JvmObject
      ).getNativeField('classRef') as ReferenceClassData;
      const methodSlot = methodObj._getField(
        'slot',
        'I',
        'java/lang/reflect/Method'
      ) as number;
      const method = methodCls.getMethodFromSlot(methodSlot);
      if (!method) {
        throw new Error('Invalid slot?');
      }
      const retType = methodObj._getField(
        'returnType',
        'Ljava/lang/Class;',
        'java/lang/reflect/Method'
      ) as JvmObject;

      const paramJavaArray = locals[2] as JvmArray;
      let params: any[] = [];
      if (paramJavaArray != null) {
        params = paramJavaArray.getJsArray().map(x => autoUnbox(x));
      }

      thread.invokeStackFrame(
        new InternalStackFrame(methodCls, method, 0, params, (ret, err) => {
          if (err) {
            // FIXME: wrap exception instead
            thread.throwNewException(
              'java/lang/reflect/InvocationTargetException',
              err.exceptionCls + ': ' + err.msg
            );
            return;
          }

          // void return type returns null
          if (ret === undefined) {
            thread.returnStackFrame(null);
            return;
          }
          thread.returnStackFrame(autoBox(ret));
        })
      );
    },
};

export default functions;
