import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GuessService } from '../services/guess.service';
import { ResolutionService } from '../services/resolution.service';
import {
  CreateGuessDto,
  GuessResponseDto,
  UserGuessStatsResponseDto,
} from '../dtos/create-guess.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { UserId } from 'src/auth/decorators/user.decorator';

@ApiTags('Guess')
@Controller('guess')
@Auth()
export class GuessController {
  constructor(
    private readonly guessService: GuessService,
    private readonly resolutionService: ResolutionService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a guess' })
  @ApiResponse({ type: GuessResponseDto })
  async createGuess(
    @Body() body: CreateGuessDto,
    @UserId() clerkUserId: string,
  ) {
    return await this.guessService.createGuess(body, clerkUserId);
  }

  @Put(':id/resolve')
  @ApiOperation({ summary: 'Resolve a guess' })
  @ApiResponse({ type: GuessResponseDto })
  async resolveGuess(@Param('id') id: string) {
    return await this.guessService.resolveGuess(id);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get user active guess' })
  @ApiResponse({ type: GuessResponseDto })
  async getUserActiveGuess(@UserId() userId: string) {
    return await this.guessService.getUserActiveGuess(userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user guess statistics' })
  @ApiResponse({ type: UserGuessStatsResponseDto })
  async getUserGuessStats(
    @UserId() userId: string,
  ): Promise<UserGuessStatsResponseDto> {
    return await this.guessService.getUserGuessStats(userId);
  }

  @Post('resolve-all')
  @ApiOperation({
    summary: 'Manually trigger resolution of all pending guesses',
  })
  async resolveAllGuesses() {
    await this.resolutionService.resolveGuesses();
    return { success: true, message: 'Resolution process triggered' };
  }
}
