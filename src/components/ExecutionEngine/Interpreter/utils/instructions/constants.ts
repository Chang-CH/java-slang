import { CONSTANT_TAG } from '#jvm/external/ClassFile/constants/constants';
import NativeThread from '#jvm/components/ExecutionEngine/NativeThreadGroup/NativeThread';
import {
  ConstantDoubleInfo,
  ConstantFloatInfo,
  ConstantIntegerInfo,
  ConstantLongInfo,
} from '#jvm/external/ClassFile/types/constants';
import {
  ConstantMethodref,
  ConstantInterfaceMethodref,
  ConstantClass,
  ConstantString,
} from '#types/ConstantRef';

export function runNop(thread: NativeThread): void {
  return;
}

export function runAconstNull(thread: NativeThread): void {
  thread.pushStack(null);
}

export function runIconstM1(thread: NativeThread): void {
  thread.pushStack(-1);
}

export function runIconst0(thread: NativeThread): void {
  thread.pushStack(0);
}

export function runIconst1(thread: NativeThread): void {
  thread.pushStack(1);
}

export function runIconst2(thread: NativeThread): void {
  thread.pushStack(2);
}

export function runIconst3(thread: NativeThread): void {
  thread.pushStack(3);
}

export function runIconst4(thread: NativeThread): void {
  thread.pushStack(4);
}

export function runIconst5(thread: NativeThread): void {
  thread.pushStack(5);
}

export function runLconst0(thread: NativeThread): void {
  thread.pushStack64(0n);
}

export function runLconst1(thread: NativeThread): void {
  thread.pushStack64(1n);
}

export function runFconst0(thread: NativeThread): void {
  thread.pushStack(0.0);
}

export function runFconst1(thread: NativeThread): void {
  thread.pushStack(1.0);
}

export function runFconst2(thread: NativeThread): void {
  thread.pushStack(2.0);
}

export function runDconst0(thread: NativeThread): void {
  thread.pushStack64(0.0);
}

export function runDconst1(thread: NativeThread): void {
  thread.pushStack64(1.0);
}

export function runBipush(thread: NativeThread): void {
  const byte = thread.getCode().getInt8(thread.getPC());
  thread.offsetPc(1);
  thread.pushStack(byte);
}

export function runSipush(thread: NativeThread): void {
  const short = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);
  thread.pushStack(short);
}

export function runLdc(thread: NativeThread): void {
  const index = thread.getCode().getUint8(thread.getPC());
  thread.offsetPc(1);
  const item = thread.getClass().getConstant(thread, index);
  if (
    item.tag === CONSTANT_TAG.Methodref ||
    item.tag === CONSTANT_TAG.InterfaceMethodref ||
    item.tag === CONSTANT_TAG.Class ||
    item.tag === CONSTANT_TAG.String
  ) {
    thread.pushStack(
      (
        item as
          | ConstantMethodref
          | ConstantInterfaceMethodref
          | ConstantClass
          | ConstantString
      ).ref
    );
    return;
  }
  thread.pushStack((item as ConstantIntegerInfo | ConstantFloatInfo).value);
}

export function runLdcW(thread: NativeThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC());
  thread.offsetPc(2);
  const item = thread.getClass().getConstant(thread, indexbyte);
  if (
    item.tag === CONSTANT_TAG.Methodref ||
    item.tag === CONSTANT_TAG.InterfaceMethodref ||
    item.tag === CONSTANT_TAG.Class ||
    item.tag === CONSTANT_TAG.String
  ) {
    thread.pushStack(
      (
        item as
          | ConstantMethodref
          | ConstantInterfaceMethodref
          | ConstantClass
          | ConstantString
      ).ref
    );

    return;
  }

  thread.pushStack((item as ConstantIntegerInfo | ConstantFloatInfo).value);
}

export function runLdc2W(thread: NativeThread): void {
  const indexbyte = thread.getCode().getUint16(thread.getPC());
  thread.offsetPc(2);
  const item = thread.getClass().getConstant(thread, indexbyte) as
    | ConstantDoubleInfo
    | ConstantLongInfo;

  thread.pushStack64(item.value);
}
