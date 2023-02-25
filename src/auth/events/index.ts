export class PhoneNumberLoginEvent {
  constructor(private _phoneNumber: string, private _code: string) {}

  get phoneNumber() {
    return this._phoneNumber;
  }

  get code() {
    return this._code;
  }
}

export class EmailLoginEvent {
  constructor(private _email: string, private _code: string) {}

  get email() {
    return this._email;
  }

  get code() {
    return this._code;
  }
}
