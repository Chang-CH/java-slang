export enum ResultType {
  SUCCESS,
  ERROR,
  DEFER,
}

export abstract class Result<T> {
  private resultType: ResultType;
  constructor(ResultType: ResultType) {
    this.resultType = ResultType;
  }

  checkError(): this is Error<T> {
    return this.resultType === ResultType.ERROR;
  }

  checkSuccess(): this is Success<T> {
    return this.resultType === ResultType.SUCCESS;
  }

  checkDefer(): this is Defer<T> {
    return this.resultType === ResultType.DEFER;
  }
}

export class Success<T> extends Result<T> {
  private result: T;
  constructor(result: T) {
    super(ResultType.SUCCESS);
    this.result = result;
  }

  public getResult(): T {
    return this.result;
  }
}

export class Error<T> extends Result<T> {
  private className: string;
  private msg: string;
  constructor(className: string, msg: string) {
    super(ResultType.ERROR);
    this.className = className;
    this.msg = msg;
  }

  public getError(): { className: string; msg: string } {
    return {
      className: this.className,
      msg: this.msg,
    };
  }
}

export class Defer<T> extends Result<T> {
  constructor() {
    super(ResultType.DEFER);
  }
}
