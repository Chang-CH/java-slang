import obj from './java_lang_Object';

export class JNI {
  classes: {
    [className: string]: {
      methods: {
        [methodName: string]: Function;
      };
    };
  };

  constructor() {
    this.classes = {
      'java/lang/Object': {
        methods: obj,
      },
    };
  }

  getNativeMethod(className: string, methodName: string) {
    return this.classes[className].methods[methodName];
  }
}
