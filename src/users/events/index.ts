import { PatchUserDto } from '../dtos';

export class UserPatchedEvent {
  constructor(private _userId: string, private _dto: PatchUserDto) {}

  get userId() {
    return this._userId;
  }

  get dto() {
    return this._dto;
  }
}
