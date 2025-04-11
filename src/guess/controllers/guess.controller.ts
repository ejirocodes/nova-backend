import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GuessService } from '../services/guess.service';
import { CreateGuessDto, GuessResponseDto } from '../dtos/create-guess.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@ApiTags('Guess')
@Controller('guess')
@Auth()
export class GuessController {
  constructor(private readonly guessService: GuessService) {}

  @Post()
  @ApiOperation({ summary: 'Create a guess' })
  @ApiResponse({ type: GuessResponseDto })
  async createGuess(@Body() body: CreateGuessDto) {
    return await this.guessService.createGuess(body);
  }
}
