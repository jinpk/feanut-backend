export class ProfileCreatedEvent {
  constructor(private _profileId: string) {}

  get profileId() {
    return this._profileId;
  }
}
