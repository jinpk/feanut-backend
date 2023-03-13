import { HttpStatus } from '@nestjs/common';

export class WrappedError {
  constructor(
    private _module: string,
    private _code: number,
    private _message?: string,
    private _status?: number,
  ) {}

  // 요청 처리 거부
  reject() {
    this._status = HttpStatus.FORBIDDEN;
    return this;
  }

  // 잘못된 파라미터
  badRequest() {
    this._status = HttpStatus.BAD_REQUEST;
    return this;
  }

  get module() {
    return this._module;
  }
  get code() {
    return this._code;
  }
  get message() {
    return this._message;
  }
  get status() {
    return this._status;
  }
}
