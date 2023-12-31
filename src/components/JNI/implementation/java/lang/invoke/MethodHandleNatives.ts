import Thread from '#jvm/components/thread/thread';
import { checkError } from '#types/Result';
import { ReferenceClassData } from '#types/class/ClassData';
import { JvmArray } from '#types/reference/Array';
import { JvmObject } from '#types/reference/Object';
import { j2jsString } from '#utils/index';

export enum MethodHandleReferenceKind {
  REF_getField = 1,
  REF_getStatic = 2,
  REF_putField = 3,
  REF_putStatic = 4,
  REF_invokeVirtual = 5,
  REF_invokeStatic = 6,
  REF_invokeSpecial = 7,
  REF_newInvokeSpecial = 8,
  REF_invokeInterface = 9,
}

enum MemberNameFlags {
  MN_IS_METHOD = 0x00010000, // method (not constructor)
  MN_IS_CONSTRUCTOR = 0x00020000, // constructor
  MN_IS_FIELD = 0x00040000, // field
  MN_IS_TYPE = 0x00080000, // nested type
  MN_CALLER_SENSITIVE = 0x00100000, // @CallerSensitive annotation detected
  MN_TRUSTED_FINAL = 0x00200000, // trusted final field
  MN_HIDDEN_MEMBER = 0x00400000, // members defined in a hidden class or with @Hidden
  MN_REFERENCE_KIND_SHIFT = 24, // refKind
  MN_REFERENCE_KIND_MASK = 0x0f000000 >> MN_REFERENCE_KIND_SHIFT,
}

const functions = {
  'init(Ljava/lang/invoke/MemberName;Ljava/lang/Object;)V': (
    thread: Thread,
    locals: any[]
  ) => {
    const ref = locals[1] as JvmObject;
    const memberName = locals[0] as JvmObject;
    const refClassname = ref.getClass().getClassname();

    if (refClassname === 'java/lang/reflect/Field') {
      throw new Error('Not implemented');
    } else if (refClassname === 'java/lang/reflect/Method') {
      const clazz = ref._getField(
        'clazz',
        'Ljava/lang/Class;',
        'java/lang/reflect/Method'
      );
      const classData = clazz.getNativeField('classRef') as ReferenceClassData;
      const methodSlot = ref._getField(
        'slot',
        'I',
        'java/lang/reflect/Method'
      ) as number;
      const method = classData.getMethodFromSlot(methodSlot);
      if (!method) {
        console.error(
          'init(Ljava/lang/invoke/MemberName;Ljava/lang/Object;)V: Method not found'
        );
        thread.returnStackFrame();
        return;
      }

      let flags = method.getAccessFlags() | MemberNameFlags.MN_IS_METHOD;
      if (method.checkStatic()) {
        flags |=
          MethodHandleReferenceKind.REF_invokeStatic <<
          MemberNameFlags.MN_REFERENCE_KIND_SHIFT;
      } else if (classData.checkInterface()) {
        flags |=
          MethodHandleReferenceKind.REF_invokeInterface <<
          MemberNameFlags.MN_REFERENCE_KIND_SHIFT;
      } else {
        flags |=
          MethodHandleReferenceKind.REF_invokeVirtual <<
          MemberNameFlags.MN_REFERENCE_KIND_SHIFT;
      }
      // constructor should be handled separately
      // check and |= callersensitive here in the future

      memberName._putField('flags', 'I', 'java/lang/invoke/MemberName', flags);
      memberName._putField(
        'clazz',
        'Ljava/lang/Class;',
        'java/lang/invoke/MemberName',
        clazz
      );
      memberName.putNativeField('vmtarget', method);
      thread.returnStackFrame();
      return;
      // MemberNameFlags
    } else if (refClassname === 'java/lang/reflect/Constructor') {
      const clazz = ref._getField(
        'clazz',
        'Ljava/lang/Class;',
        'java/lang/reflect/Constructor'
      );
      const classData = clazz.getNativeField('classRef') as ReferenceClassData;
      const methodSlot = ref._getField(
        'slot',
        'I',
        'java/lang/reflect/Constructor'
      ) as number;
      const method = classData.getMethodFromSlot(methodSlot);
      if (!method) {
        thread.returnStackFrame();
        return;
      }
      const flags =
        method.getAccessFlags() |
        MemberNameFlags.MN_IS_CONSTRUCTOR |
        (MethodHandleReferenceKind.REF_invokeSpecial <<
          MemberNameFlags.MN_REFERENCE_KIND_SHIFT);
      memberName._putField('flags', 'I', 'java/lang/invoke/MemberName', flags);
      memberName._putField(
        'clazz',
        'Ljava/lang/Class;',
        'java/lang/invoke/MemberName',
        clazz
      );
      memberName.putNativeField('vmtarget', method);
      thread.returnStackFrame();
      return;
    }

    thread.throwNewException(
      'java/lang/InternalError',
      'init: Invalid target.'
    );
  },

  'resolve(Ljava/lang/invoke/MemberName;Ljava/lang/Class;)Ljava/lang/invoke/MemberName;':
    (thread: Thread, locals: any[]) => {
      const memberName = locals[0] as JvmObject; // MemberName

      const type = memberName._getField(
        'type',
        'Ljava/lang/Object;',
        'java/lang/invoke/MemberName'
      ) as JvmObject;
      const jNameString = memberName._getField(
        'name',
        'Ljava/lang/String;',
        'java/lang/invoke/MemberName'
      ) as JvmObject;
      const clsObj = memberName._getField(
        'clazz',
        'Ljava/lang/Class;',
        'java/lang/invoke/MemberName'
      ) as JvmObject;
      const flags = memberName._getField(
        'flags',
        'I',
        'java/lang/invoke/MemberName'
      ) as number;

      if (clsObj === null || jNameString === null || type === null) {
        thread.throwNewException(
          'java/lang/IllegalArgumentException',
          'Invalid MemberName'
        );
        return;
      }

      const clsRef = clsObj.getNativeField('classRef') as ReferenceClassData;
      const name = j2jsString(jNameString);

      if (
        flags &
        (MemberNameFlags.MN_IS_CONSTRUCTOR | MemberNameFlags.MN_IS_METHOD)
      ) {
        const rtype = (
          (
            type._getField(
              'rtype',
              'Ljava/lang/Class;',
              'java/lang/invoke/MethodType'
            ) as JvmObject
          ).getNativeField('classRef') as ReferenceClassData
        ).getDescriptor();
        const ptypes = (
          type._getField(
            'ptypes',
            '[Ljava/lang/Class;',
            'java/lang/invoke/MethodType'
          ) as JvmArray
        )
          .getJsArray()
          .map((cls: JvmObject) =>
            cls.getNativeField('classRef').getDescriptor()
          );
        const methodDesc = `(${ptypes.join('')})${rtype}`;

        // method resolution
        const lookupRes = clsRef.lookupMethod(
          name + methodDesc,
          null as any,
          false,
          false,
          true,
          true
        );

        if (checkError(lookupRes)) {
          console.log(
            'failed resolution::: ',
            clsRef.getClassname(),
            '@',
            name + methodDesc
          );
          thread.throwNewException(
            'java/lang/NoSuchMethodError',
            `Invalid method ${methodDesc}`
          );
          return;
        }
        const method = lookupRes.result;

        const methodFlags = method.getAccessFlags();
        console.warn(
          'MethodHandle resolution: CALLER_SENSITIVE not implemented'
        ); // FIXME: check method caller sensitive and |= caller sensitive flag.
        const refKind = flags >>> MemberNameFlags.MN_REFERENCE_KIND_SHIFT;
        memberName._putField(
          'flags',
          'I',
          'java/lang/invoke/MemberName',
          methodFlags | flags
        );

        memberName.putNativeField('vmtarget', method);
        thread.returnStackFrame(memberName);
        return;
      } else if (flags & MemberNameFlags.MN_IS_FIELD) {
        const descriptor = (
          type.getNativeField('classRef') as ReferenceClassData
        ).getDescriptor();
        const field = clsRef.lookupField(name + descriptor);
        console.log('Lookup field: ', name, descriptor);
        if (field === null) {
          thread.throwNewException(
            'java/lang/NoSuchFieldError',
            `Invalid field ${name}`
          );
          return;
        }
        const fieldflags = field.getAccessFlags();
        memberName._putField(
          'flags',
          'I',
          'java/lang/invoke/MemberName',
          fieldflags | flags
        );
        memberName.putNativeField('field', field);
        thread.returnStackFrame(memberName);
        return;
      } else {
        console.log('Unknown member name');
        thread.throwNewException(
          'java/lang/LinkageError',
          `Could not resolve member name`
        );
        return;
      }
    },
};

export default functions;
