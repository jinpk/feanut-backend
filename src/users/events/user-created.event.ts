import { Types } from 'mongoose';

export class UserCreatedEvent {
  constructor(private userId: Types.ObjectId, private name: string) {}
}
