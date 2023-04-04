import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { checkExistAccount } from 'src/utils';
import { comparePassword } from 'src/utils/bcrypt';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, pass: string) {
    try {
      const user = await this.usersService.findOne(email);
      checkExistAccount(user);

      const isMatchPassword = await comparePassword(pass, user.password);

      if (!isMatchPassword) {
        throw new UnauthorizedException();
      }

      const payload = {
        name: user.name,
        userId: user.id,
        role: user.role,
      };

      return {
        access_token: await this.jwtService.signAsync(payload),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string) {
    if (!token) {
      throw new NotFoundException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('EMAIL_CONFIRMATION_SECRET'),
      });

      // Set account active = 1
      await this.usersService.setActiveUser(payload.email);
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}
