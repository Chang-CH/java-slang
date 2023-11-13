import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import Thread from '#jvm/components/Thread/Thread';
import {
  ConstantDoubleInfo,
  ConstantFloatInfo,
  ConstantIntegerInfo,
  ConstantLongInfo,
} from '#jvm/external/ClassFile/types/constants';
import {
  LegacyConstantMethodref,
  LegacyConstantClass,
  LegacyConstantString,
} from '#types/ConstantRef';
import {
  ConstantClass,
  ConstantDouble,
  ConstantLong,
  ConstantMethodHandle,
  ConstantMethodType,
  ConstantString,
} from '#types/constants';
import { ClassRef } from '#types/class/ClassRef';

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

export function loadConstant(
  thread: Thread,
  index: number,
  onFinish?: () => void
): void {
  const invoker = thread.getClass();
  const constant = invoker.getConstant(index);

  if (ConstantMethodHandle.check(constant)) {
    const res = (constant as any).tempResolve(thread);
    if (!res.checkSuccess()) {
      if (res.checkError()) {
        const err = res.getError();
        thread.throwNewException(err.className, err.msg);
      }
      return;
    }

    thread.pushStack(res.getResult());
    onFinish && onFinish();
    return;
  }

  const resolutionRes = constant.resolve(thread);
  if (!resolutionRes.checkSuccess()) {
    if (resolutionRes.checkError()) {
      const err = resolutionRes.getError();
      thread.throwNewException(err.className, err.msg);
    }
    return;
  }

  let value = resolutionRes.getResult();
  if (ConstantClass.check(constant)) {
    const clsRef = value as ClassRef;
    const initRes = clsRef.initialize(thread);
    if (!initRes.checkSuccess()) {
      if (initRes.checkError()) {
        const err = initRes.getError();
        thread.throwNewException(err.className, err.msg);
      }
      return;
    }
    value = clsRef.getJavaObject();
  }
  onFinish && onFinish();
  thread.pushStack(value);
}

export function runLdc(thread: Thread): void {
  const indexbyte = thread.getCode().getUint8(thread.getPC() + 1);

  loadConstant(thread, indexbyte, () => thread.offsetPc(2));
}

export function runLdcW(thread: Thread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  loadConstant(thread, indexbyte, () => thread.offsetPc(3));
}

export function runLdc2W(thread: Thread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC() + 1);
  thread.offsetPc(3);
  const item = thread.getClass().getConstant(indexbyte) as
    | ConstantDouble
    | ConstantLong;

  thread.pushStack64(item.get());
}
