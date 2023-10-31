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

  checkError(): this is ErrorResult<T> {
    return this.resultType === ResultType.ERROR;
  }

  checkSuccess(): this is SuccessResult<T> {
    return this.resultType === ResultType.SUCCESS;
  }

  checkDefer(): this is DeferResult<T> {
    return this.resultType === ResultType.DEFER;
  }
}

export class SuccessResult<T> extends Result<T> {
  private result: T;
  constructor(result: T) {
    super(ResultType.SUCCESS);
    this.result = result;
  }

  public getResult(): T {
    return this.result;
  }
}

export class ErrorResult<T> extends Result<T> {
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

export class DeferResult<T> extends Result<T> {
  constructor() {
    super(ResultType.DEFER);
  }
}
