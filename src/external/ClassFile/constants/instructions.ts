export enum OPCODE {
  NOP,
  ACONSTNULL,
  ICONSTM1,
  ICONST0,
  ICONST1,
  ICONST2,
  ICONST3,
  ICONST4,
  ICONST5,
  LCONST0,
  LCONST1,
  FCONST0,
  FCONST1,
  FCONST2,
  DCONST0,
  DCONST1,
  BIPUSH,
  SIPUSH,
  LDC,
  LDCW,
  LDC2W,
  ILOAD,
  LLOAD,
  FLOAD,
  DLOAD,
  ALOAD,
  ILOAD0,
  ILOAD1,
  ILOAD2,
  ILOAD3,
  LLOAD0,
  LLOAD1,
  LLOAD2,
  LLOAD3,
  FLOAD0,
  FLOAD1,
  FLOAD2,
  FLOAD3,
  DLOAD0,
  DLOAD1,
  DLOAD2,
  DLOAD3,
  ALOAD0,
  ALOAD1,
  ALOAD2,
  ALOAD3,
  IALOAD,
  LALOAD,
  FALOAD,
  DALOAD,
  AALOAD,
  BALOAD,
  CALOAD,
  SALOAD,
  ISTORE,
  LSTORE,
  FSTORE,
  DSTORE,
  ASTORE,
  ISTORE0,
  ISTORE1,
  ISTORE2,
  ISTORE3,
  LSTORE0,
  LSTORE1,
  LSTORE2,
  LSTORE3,
  FSTORE0,
  FSTORE1,
  FSTORE2,
  FSTORE3,
  DSTORE0,
  DSTORE1,
  DSTORE2,
  DSTORE3,
  ASTORE0,
  ASTORE1,
  ASTORE2,
  ASTORE3,
  IASTORE,
  LASTORE,
  FASTORE,
  DASTORE,
  AASTORE,
  BASTORE,
  CASTORE,
  SASTORE,
  POP,
  POP2,
  DUP,
  DUPX1,
  DUPX2,
  DUP2,
  DUP2X1,
  DUP2X2,
  SWAP,
  IADD,
  LADD,
  FADD,
  DADD,
  ISUB,
  LSUB,
  FSUB,
  DSUB,
  IMUL,
  LMUL,
  FMUL,
  DMUL,
  IDIV,
  LDIV,
  FDIV,
  DDIV,
  IREM,
  LREM,
  FREM,
  DREM,
  INEG,
  LNEG,
  FNEG,
  DNEG,
  ISHL,
  LSHL,
  ISHR,
  LSHR,
  IUSHR,
  LUSHR,
  IAND,
  LAND,
  IOR,
  LOR,
  IXOR,
  LXOR,
  IINC,
  I2L,
  I2F,
  I2D,
  L2I,
  L2F,
  L2D,
  F2I,
  F2L,
  F2D,
  D2I,
  D2L,
  D2F,
  I2B,
  I2C,
  I2S,
  LCMP,
  FCMPL,
  FCMPG,
  DCMPL,
  DCMPG,
  IFEQ,
  IFNE,
  IFLT,
  IFGE,
  IFGT,
  IFLE,
  IFICMPEQ,
  IFICMPNE,
  IFICMPLT,
  IFICMPGE,
  IFICMPGT,
  IFICMPLE,
  IFACMPEQ,
  IFACMPNE,
  GOTO,
  JSR,
  RET,
  TABLESWITCH,
  LOOKUPSWITCH,
  IRETURN,
  LRETURN,
  FRETURN,
  DRETURN,
  ARETURN,
  RETURN,
  GETSTATIC,
  PUTSTATIC,
  GETFIELD,
  PUTFIELD,
  INVOKEVIRTUAL,
  INVOKESPECIAL,
  INVOKESTATIC,
  INVOKEINTERFACE,
  INVOKEDYNAMIC,
  NEW,
  NEWARRAY,
  ANEWARRAY,
  ARRAYLENGTH,
  ATHROW,
  CHECKCAST,
  INSTANCEOF,
  MONITORENTER,
  MONITOREXIT,
  WIDE,
  MULTIANEWARRAY,
  IFNULL,
  IFNONNULL,
  GOTOW,
  JSRW,
  BREAKPOINT,
  IMPDEP1 = 254,
  IMPDEP2 = 255,
}