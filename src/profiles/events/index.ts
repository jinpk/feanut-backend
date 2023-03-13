import { UpdateProfileDto } from '../dtos';

export class ProfileCreatedEvent {
  constructor(private _profileId: string) {}

  get profileId() {
    return this._profileId;
  }
}

export class ProfileUpdatedEvent {
  constructor(private _dto: UpdateProfileDto) {}

  get dto() {
    return this._dto;
  }
}
