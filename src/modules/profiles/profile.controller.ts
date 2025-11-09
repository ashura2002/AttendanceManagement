import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
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
import { UpdateProfileDTO } from './dto/update-profile.dto';

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

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() updateProfileDTO: UpdateProfileDTO,
  ): Promise<Profile> {
    const { userId } = req.user;
    return await this.profileService.updateProfile(
      id,
      userId,
      updateProfileDTO,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ): Promise<void> {
    const { userId } = req.user;
    return await this.profileService.deleteProfile(id, userId);
  }
}
