import { JvmObject } from '#types/reference/Object';

export const j2jsString = (str: JvmObject) => {
  return String.fromCharCode(
    ...str._getField('value', '[C', 'java/lang/String').getJsArray()
  );
};
