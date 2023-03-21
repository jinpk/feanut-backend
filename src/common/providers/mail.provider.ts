import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class MailService {
  constructor(private httpService: HttpService) {}

  send() {}
}
