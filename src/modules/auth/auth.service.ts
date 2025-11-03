import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDTO } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtInterface } from './types/jwtToken.types';
import { JwtResponseInterface } from './types/JwtResponse.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async login(loginDTO: LoginDTO): Promise<JwtResponseInterface> {
    const user = await this.userService.findByUserName(loginDTO.userName);

    const isPasswordMatch = await bcrypt.compare(
      loginDTO.password,
      user.password,
    );
    if (!isPasswordMatch) throw new BadRequestException('Invalid Credentials');

    const tokenPayload: JwtInterface = {
      userId: user.id,
      role: user.role,
      email: user.email,
    };

    // generate token if credentials is correct
    const accessToken = this.jwtService.sign(tokenPayload);
    return { message: 'Login successfully', accessToken };
  }
}

// to do -> add guard for protecting route

