import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { Repository } from 'typeorm';
import { CreateProfileDTO } from './dto/create-profile.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    private readonly userService: UsersService,
  ) {}

  async createProfile(
    userId: number,
    createProfileDTO: CreateProfileDTO,
  ): Promise<Profile> {
    const user = await this.userService.findById(userId);
    // find profile if already exist on db
    const existingProfile = await this.profileRepo.findOne({
      where: { user: { id: user.id } },
    });
    if (existingProfile)
      throw new BadRequestException(
        'You already created your profile if you want to modify it try to update',
      );
    const profile = this.profileRepo.create({
      ...createProfileDTO,
      user: user,
    });
    return await this.profileRepo.save(profile);
  }

  async getOwnProfile(id: number): Promise<Profile> {
    const profile = await this.profileRepo.findOne({
      where: { user: { id } },
      relations: ['user'],
      select: {
        user: {
          id: true,
          userName: true,
          displayName: true,
          email: true,
          role: true,
        },
      },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }
}

// to do -> update profile
//        -> delete profile
