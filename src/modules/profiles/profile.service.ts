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
import { UpdateProfileDTO } from './dto/update-profile.dto';

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
    avatar?: Express.Multer.File,
  ): Promise<Profile> {
    console.log(avatar);
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
      avatar: avatar ? `uploads/${avatar.filename}` : undefined,
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
    if (!profile)
      throw new NotFoundException(
        `Seems like you haven't created your profile yet.`,
      );
    return profile;
  }

  async updateProfile(
    id: number,
    userId: number,
    updateProfileDTO: UpdateProfileDTO,
  ): Promise<Profile> {
    const profile = await this.profileRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!profile) throw new NotFoundException('Profile not found');
    if (profile.user.id !== userId)
      throw new BadRequestException('You can only modify your own profile');
    Object.assign(profile, updateProfileDTO);
    return await this.profileRepo.save(profile);
  }

  async deleteProfile(id: number, userId: number): Promise<void> {
    const profile = await this.profileRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!profile) throw new NotFoundException('Profile not found');

    if (profile.user.id !== userId)
      throw new BadRequestException('You can only delete your own profile');
    await this.profileRepo.remove(profile);
  }
}
