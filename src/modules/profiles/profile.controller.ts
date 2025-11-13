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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Profile } from './entities/profile.entity';
import { CreateProfileDTO } from './dto/create-profile.dto';
import { UpdateProfileDTO } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { multerConfig } from 'src/config/multer.config';

@Controller('profile')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RoleGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('avatar', multerConfig))
  async createProfile(
    @Req() req,
    @Body() createProfileDTO: CreateProfileDTO,
    @UploadedFile() avatar: Express.Multer.File,
  ): Promise<Profile> {
    const { userId } = req.user;
    return this.profileService.createProfile(userId, createProfileDTO, avatar);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getOwnProfile(@Req() req): Promise<Profile> {
    const { userId } = req.user;
    return await this.profileService.getOwnProfile(userId);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatar', multerConfig))
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() updateProfileDTO: UpdateProfileDTO,
    @UploadedFile() avatar: Express.Multer.File,
  ): Promise<Profile> {
    const { userId } = req.user;
    return await this.profileService.updateProfile(
      id,
      userId,
      updateProfileDTO,
      avatar,
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

