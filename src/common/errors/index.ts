import { HttpStatus } from '@nestjs/common';

export class WrappedError {
  constructor(
    private _module?: string,
    private _code?: number,
    private _message?: string,
    private _status?: number,
  ) {}

  // 인증/인가 실패
  // 이 코드는 되도록 사용하지 마십시오.
  unauthorized() {
    this._status = HttpStatus.UNAUTHORIZED;
    return this;
  }

  // 존재하지않는 데이터 접근
  notFound() {
    this._status = HttpStatus.NOT_FOUND;
    return this;
  }

  // 이미 존재하는 데이터
  alreadyExist() {
    this._status = HttpStatus.CONFLICT;
    return this;
  }

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
