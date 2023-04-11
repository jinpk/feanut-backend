export class SignOutEvent {
  constructor(private _userId: string) {}

  get userId() {
    return this._userId;
  }
}
