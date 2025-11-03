import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateUserDTO } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDTO: LoginDTO) {
    return await this.authService.login(loginDTO);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDTO: CreateUserDTO) {
    return await this.userService.registerUser(createUserDTO);
  }
}
