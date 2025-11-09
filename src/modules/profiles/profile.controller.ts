import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Profile } from './entities/profile.entity';
import { CreateProfileDTO } from './dto/create-profile.dto';

@Controller('profile')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RoleGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProfile(
    @Req() req,
    @Body() createProfileDTO: CreateProfileDTO,
  ): Promise<Profile> {
    const { userId } = req.user;
    return this.profileService.createProfile(userId, createProfileDTO);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getOwnProfile(@Req() req): Promise<Profile> {
    const { userId } = req.user;
    return await this.profileService.getOwnProfile(userId);
  }
}
