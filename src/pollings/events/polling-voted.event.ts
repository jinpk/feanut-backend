import { Types } from 'mongoose';

export class PollingVotedEvent {
  constructor(
    private _pollingId: Types.ObjectId,
    private _pollId: Types.ObjectId,
    private _selectedProfileId: Types.ObjectId,
  ) {}

  get pollingId() {
    return this._pollingId;
  }
  get pollId() {
    return this._pollId;
  }
  get selectedProfileId() {
    return this._selectedProfileId;
  }
}
