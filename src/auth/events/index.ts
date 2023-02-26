export class EmailLoginEvent {
  constructor(private _email: string, private _code: string) {}

  get email() {
    return this._email;
  }

  get code() {
    return this._code;
  }
}
