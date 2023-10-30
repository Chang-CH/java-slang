import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import Thread from '#jvm/components/Threads/Thread';
import {
  ConstantDoubleInfo,
  ConstantFloatInfo,
  ConstantIntegerInfo,
  ConstantLongInfo,
} from '#jvm/external/ClassFile/types/constants';
import {
  ConstantMethodref,
  ConstantClass,
  ConstantString,
} from '#types/ConstantRef';

export function runNop(thread: Thread): void {
  thread.offsetPc(1);
  return;
}

export function runAconstNull(thread: Thread): void {
  thread.offsetPc(1);
  thread.pushStack(null);
}

export function runIconstM1(thread: Thread): void {
  thread.offsetPc(1);
  thread.pushStack(-1);
}

export function runIconst0(thread: Thread): void {
  thread.offsetPc(1);
  thread.pushStack(0);
}

export function runIconst1(thread: Thread): void {
  thread.offsetPc(1);
  thread.pushStack(1);
}

export function runIconst2(thread: Thread): void {
  thread.offsetPc(1);
  thread.pushStack(2);
}

export function runIconst3(thread: Thread): void {
  thread.offsetPc(1);
  thread.pushStack(3);
}

export function runIconst4(thread: Thread): void {
  thread.offsetPc(1);
  thread.pushStack(4);
}

export function runIconst5(thread: Thread): void {
  thread.offsetPc(1);
  thread.pushStack(5);
}

export function runLconst0(thread: Thread): void {
  thread.offsetPc(1);
  thread.pushStack64(0n);
}

export function runLconst1(thread: Thread): void {
  thread.offsetPc(1);
  thread.pushStack64(1n);
}

export function runFconst0(thread: Thread): void {
  thread.offsetPc(1);
  thread.pushStack(0.0);
}

export function runFconst1(thread: Thread): void {
  thread.offsetPc(1);
  thread.pushStack(1.0);
}

export function runFconst2(thread: Thread): void {
  thread.offsetPc(1);
  thread.pushStack(2.0);
}

export function runDconst0(thread: Thread): void {
  thread.offsetPc(1);
  thread.pushStack64(0.0);
}

export function runDconst1(thread: Thread): void {
  thread.offsetPc(1);
  thread.pushStack64(1.0);
}

export function runBipush(thread: Thread): void {
  thread.offsetPc(1);
  const byte = thread.getCode().getInt8(thread.getPC());
  thread.offsetPc(1);
  thread.pushStack(byte);
}

export function runSipush(thread: Thread): void {
  thread.offsetPc(1);
  const short = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);
  thread.pushStack(short);
}

function loadConstant(thread: Thread, index: number): void {
  const invoker = thread.getClass();
  const constant = invoker.getConstant(index);

  switch (constant.tag) {
    case CONSTANT_TAG.Integer:
    case CONSTANT_TAG.Float:
      thread.pushStack(
        (constant as ConstantIntegerInfo | ConstantFloatInfo).value
      );
      return;
    case CONSTANT_TAG.String:
      const stringRes = invoker.resolveStringRef(constant as ConstantString);
      if (stringRes.error || !stringRes.result) {
        thread.throwNewException(
          stringRes.error ?? 'java/lang/ClassNotFoundException',
          ''
        );
        return;
      }
      thread.pushStack(stringRes.result);
      return;
    case CONSTANT_TAG.Class:
      const { error: classResError, classRef } =
        invoker.resolveClassRef(constant);
      if (classResError || !classRef) {
        thread.throwNewException(
          classResError ?? 'java/lang/ClassNotFoundException',
          ''
        );
        return;
      }

      // FIXME: should be class object not classref on stack.
      thread.pushStack(classRef);
      return;
    case CONSTANT_TAG.MethodType:
    case CONSTANT_TAG.MethodHandle:
      throw new Error('not implemented');
  }
}

export function runLdc(thread: Thread): void {
  thread.offsetPc(1);
  const indexbyte = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);
  loadConstant(thread, indexbyte);
}

export function runLdcW(thread: Thread): void {
  thread.offsetPc(1);
  const indexbyte = thread.getCode().getUint16(thread.getPC());
  thread.offsetPc(2);
  loadConstant(thread, indexbyte);
}

export function runLdc2W(thread: Thread): void {
  thread.offsetPc(1);
  const indexbyte = thread.getCode().getUint16(thread.getPC());
  thread.offsetPc(2);
  const item = thread.getClass().getConstant(indexbyte) as
    | ConstantDoubleInfo
    | ConstantLongInfo;

  thread.pushStack64(item.value);
}
