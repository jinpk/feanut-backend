import { Types } from 'mongoose';
import { Gender } from 'src/profiles/enums';

export class UserCreatedEvent {
  constructor(
    private _userId: Types.ObjectId,
    private _name: string,
    private _phoneNumber: string,
    private _gender: Gender,
  ) {}

  get userId() {
    return this._userId;
  }
  get name() {
    return this._name;
  }
  get phoneNumber() {
    return this._phoneNumber;
  }
  get gender() {
    return this._gender;
  }
}
