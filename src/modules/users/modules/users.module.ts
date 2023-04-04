import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserController } from '../controllers/users.controller';
import { usersProviders } from '../providers/users.providers';
import { UsersService } from '../services/users.service';
import { User } from '../entities/users.entity';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  controllers: [UserController],
  providers: [UsersService, ...usersProviders],
  exports: [UsersService],
})
export class UsersModule {}
