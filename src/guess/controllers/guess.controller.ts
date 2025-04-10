import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GuessService } from '../services/guess.service';
import { CreateGuessDto, GuessResponseDto } from '../dtos/create-guess';

@ApiTags('Guess')
@Controller('guess')
export class GuessController {
  constructor(private readonly guessService: GuessService) {}

  @Post()
  @ApiOperation({ summary: 'Create a guess' })
  @ApiResponse({ type: GuessResponseDto })
  async createGuess(@Body() body: CreateGuessDto): Promise<GuessResponseDto> {
    return await this.guessService.createGuess(body);
  }
}
