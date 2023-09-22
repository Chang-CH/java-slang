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

export function runNop(thread: NativeThread) {
  thread.offsetPc(1);
  return;
}

export function runAconstNull(thread: NativeThread) {
  thread.pushStack(null);
  thread.offsetPc(1);
}

export function runIconstM1(thread: NativeThread) {
  thread.pushStack(-1);
  thread.offsetPc(1);
}

export function runIconst0(thread: NativeThread) {
  thread.pushStack(0);
  thread.offsetPc(1);
}

export function runIconst1(thread: NativeThread) {
  thread.pushStack(1);
  thread.offsetPc(1);
}

export function runIconst2(thread: NativeThread) {
  thread.pushStack(2);
  thread.offsetPc(1);
}

export function runIconst3(thread: NativeThread) {
  thread.pushStack(3);
  thread.offsetPc(1);
}

export function runIconst4(thread: NativeThread) {
  thread.pushStack(4);
  thread.offsetPc(1);
}

export function runIconst5(thread: NativeThread) {
  thread.pushStack(5);
  thread.offsetPc(1);
}

export function runLconst0(thread: NativeThread) {
  thread.pushStack64(0n);
  thread.offsetPc(1);
}

export function runLconst1(thread: NativeThread) {
  thread.pushStack64(1n);
  thread.offsetPc(1);
}

export function runFconst0(thread: NativeThread) {
  thread.pushStack(0.0);
  thread.offsetPc(1);
}

export function runFconst1(thread: NativeThread) {
  thread.pushStack(1.0);
  thread.offsetPc(1);
}

export function runFconst2(thread: NativeThread) {
  thread.pushStack(2.0);
  thread.offsetPc(1);
}

export function runDconst0(thread: NativeThread) {
  thread.pushStack64(0.0);
  thread.offsetPc(1);
}

export function runDconst1(thread: NativeThread) {
  thread.pushStack64(1.0);
  thread.offsetPc(1);
}

export function runBipush(thread: NativeThread) {
  const byte = thread.getCode().getInt8(thread.getPC());
  thread.offsetPc(1);
  thread.pushStack(byte);
}

export function runSipush(thread: NativeThread) {
  const short = thread.getCode().getInt16(thread.getPC());
  thread.offsetPc(2);
  thread.pushStack(short);
}

export function runLdc(thread: NativeThread) {
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

export function runLdcW(thread: NativeThread) {
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

export function runLdc2W(thread: NativeThread) {
  const indexbyte = thread.getCode().getUint16(thread.getPC());
  thread.offsetPc(2);
  const item = thread.getClass().getConstant(thread, indexbyte) as
    | ConstantDoubleInfo
    | ConstantLongInfo;

  thread.pushStack64(item.value);
}
