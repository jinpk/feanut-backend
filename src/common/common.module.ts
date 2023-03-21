import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import * as providers from './providers';

const services = Object.values(providers);

@Global()
@Module({
  imports: [HttpModule],
  providers: services,
  exports: services,
})
export class CommonModule {}
