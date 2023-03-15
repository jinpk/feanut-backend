import { Injectable } from '@nestjs/common';
import { PollingDto } from './dtos/polling.dto';
import { UpdatePollingDto } from './dtos/update-polling.dto';

@Injectable()
export class PollingsService {
  create(PollingDto: PollingDto) {
    return 'This action adds a new polling';
  }

  findAll() {
    return `This action returns all pollings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} polling`;
  }

  update(id: number, updatePollingDto: UpdatePollingDto) {
    return `This action updates a #${id} polling`;
  }

  remove(id: number) {
    return `This action removes a #${id} polling`;
  }
}
