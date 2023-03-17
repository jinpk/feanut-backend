import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  now,
  FilterQuery,
  Model,
  PipelineStage,
  ProjectionFields,
  Types,
} from 'mongoose';
import { PagingResDto } from 'src/common/dtos';
import { ProfilesService } from 'src/profiles/profiles.service';
import { Coin, CoinDocument } from '../coins/schemas/coin.schema';
import { Polling, PollingDocument } from './schemas/polling.schema';
import { PollingDto } from './dtos/polling.dto';
import { UpdatePollingDto } from './dtos/update-polling.dto';
import { GetListPollingDto, GetPollingDto } from './dtos/get-polling.dto';

@Injectable()
export class PollingsService {
  constructor(
    @InjectModel(Polling.name) private coinModel: Model<PollingDocument>,
    @InjectModel(Coin.name) private buycoinModel: Model<CoinDocument>,
    private profilesService: ProfilesService,
  ) {}

  async createPolling(user_id: string, body: PollingDto){

  }

  async findRefreshedPollingById(query: GetListPollingDto) {

  }

  async findListPolling(query: GetListPollingDto) {

  }

  async findListPollingByProfile(query: GetListPollingDto) {
    
  }

  async findListPollingById(query: GetPollingDto) {

  }

  async createPollingOpen(user_id, polling_id: string) {
    
  }
}
