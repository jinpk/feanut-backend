import { ApiProperty } from '@nestjs/swagger';
import { Emotion } from '../enums/emotion.enum';

export class QuestionDto {
  @ApiProperty({ description: 'questionId' })
  id: string;

  @ApiProperty({ description: 'question emotion' })
  emotion: Emotion;

  @ApiProperty({ description: 'question emotion' })
  contentText: string;
}
