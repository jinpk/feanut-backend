import { Types } from 'mongoose';

export class UserDeletedEvent {
  constructor(private _userId: Types.ObjectId) {}

  get userId() {
    return this._userId;
  }
}
