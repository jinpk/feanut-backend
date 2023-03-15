import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PollingsService } from './pollings.service';
import { CreatePollingDto } from './dtos/create-polling.dto';
import { UpdatePollingDto } from './dtos/update-polling.dto';

@Controller('pollings')
export class PollingsController {
  constructor(private readonly pollingsService: PollingsService) {}

  @Post()
  create(@Body() createPollingDto: CreatePollingDto) {
    return this.pollingsService.create(createPollingDto);
  }

  @Get()
  findAll() {
    return this.pollingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pollingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePollingDto: UpdatePollingDto) {
    return this.pollingsService.update(+id, updatePollingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pollingsService.remove(+id);
  }
}
