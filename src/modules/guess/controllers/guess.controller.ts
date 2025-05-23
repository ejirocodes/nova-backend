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
import { GuessDto } from '../dtos/get-guess.dto';

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
  ): Promise<GuessResponseDto> {
    return await this.guessService.createGuess(body, clerkUserId);
  }

  @Get('status/:id')
  @ApiOperation({ summary: 'Get guess status' })
  @ApiResponse({ type: GuessResponseDto })
  async getGuessStatus(@Param('id') id: string): Promise<GuessResponseDto> {
    return await this.guessService.guessStatus(id);
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
  async getUserActiveGuess(@UserId() clerkUserId: string): Promise<GuessDto[]> {
    const user = await this.guessService.getUserByClerkId(clerkUserId);

    return await this.guessService.getUserActiveGuess(user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user guess statistics' })
  @ApiResponse({ type: UserGuessStatsResponseDto })
  async getUserGuessStats(
    @UserId() clerkUserId: string,
  ): Promise<UserGuessStatsResponseDto> {
    return await this.guessService.getUserGuessStats(clerkUserId);
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
