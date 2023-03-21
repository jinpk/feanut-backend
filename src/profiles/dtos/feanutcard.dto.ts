import { ApiProperty } from '@nestjs/swagger';

export class FeanutCardDto {
    @ApiProperty({ default: 0})
    joy: number;
  
    @ApiProperty({ default: 0})
    gratitude: number;
  
    @ApiProperty({ default: 0})
    serenity: number;
  
    @ApiProperty({ default: 0})
    interest: number;
  
    @ApiProperty({ default: 0})
    hope: number;
  
    @ApiProperty({ default: 0})
    pride: number;
  
    @ApiProperty({ default: 0})
    amusement: number;
  
    @ApiProperty({ default: 0})
    inspiration: number;
  
    @ApiProperty({ default: 0})
    awe: number
  
    @ApiProperty({ default: 0})
    love: number;
  }
  