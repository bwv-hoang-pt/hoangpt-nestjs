import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Roles } from '../../roles/decorators/roles.decorator';
import { User } from '../entities/users.entity';
import { UsersService } from '../services/users.service';
import { Role } from 'src/modules/roles/enum/roles.enum';

@Controller('users')
export class UserController {
  constructor(private userService: UsersService) {}

  /**
   * Find All User
   */
  @Get()
  @HttpCode(HttpStatus.ACCEPTED)
  @Roles(Role.Admin, Role.User)
  async findAllUser(): Promise<User[]> {
    return await this.userService.findAllUser();
  }

  /**
   * Create user
   */
  @Post('add')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.Admin)
  async createUser(@Body() user: User): Promise<any> {
    await this.userService.createUser(user);
  }

  /**
   * Update user
   */
  @Put(':id')
  @HttpCode(HttpStatus.AMBIGUOUS)
  @Roles(Role.Admin, Role.User)
  async updateUser(@Param('id') id: string, @Body() user: User) {
    await this.userService.updateUser(id, user);
  }

  /**
   * Delete user
   */
  @Delete()
  @Roles(Role.Admin)
  async deleteUser() {
    // await this.userService.deleteUser();
  }
}
