import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isNil } from 'lodash';
import { Sequelize } from 'sequelize-typescript';
import { getCurrentTime } from 'src/utils';
import { hassPassword } from 'src/utils/bcrypt';
import { usersConstants } from '../../../constants';
import { User } from '../entities/users.entity';
import * as sgMail from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    @Inject(usersConstants.USERS_REPOSITORY)
    private usersRepository: typeof User,
    private sequelize: Sequelize,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    sgMail.setApiKey(this.configService.get('SENDGRID_API_KEY'));
  }

  /**
   * Find one user
   */
  async findOne(email: string): Promise<User> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  /**
   * Find all user
   */
  async findAllUser(): Promise<User[]> {
    return await this.usersRepository.findAll<User>();
  }

  /**
   * Create user
   */

  async createUser(user: User) {
    await this.checkDuplicateEmail(user.email);
    const password = await hassPassword(user.password);

    try {
      await this.sequelize.transaction(async (t) => {
        await this.usersRepository.create(
          {
            email: user.email,
            name: user.name,
            password: password,
            role: user.role,
            imageUrl: user.imageUrl,
          },
          { transaction: t },
        );
      });

      const payload = { email: user.email };
      const token = this.jwtService.sign(payload, {
        secret: this.configService.get('EMAIL_CONFIRMATION_SECRET'),
        expiresIn: `${this.configService.get(
          'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME',
        )}s`,
      });

      const url = `${this.configService.get(
        'EMAIL_CONFIRMATION_URL',
      )}?token=${token}`;

      const text = `Welcome to the application. To confirm the email address, <a href="${url}">click here</a>`;
      const html = `Welcome to the application. To confirm the email address, <a href="${url}">click here</a>`;

      const mailContent = {
        to: user.email,
        from: 'hoangphandev98@gmail.com', // Use the email address or domain you verified above
        subject: 'Please Verify Your Account',
        text: text,
        html: html,
      };

      await sgMail.send(mailContent);
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: User) {
    const user = await this.usersRepository.findByPk(userId);

    // checkExistAccount(user);

    try {
      await this.sequelize.transaction(async (t) => {
        let updateContent: IUserUpdate = {
          email: user.email,
          name: user.name,
          password: user.password,
          role: user.role,
          imageUrl: user.imageUrl,
          createdAt: user.createdAt,
          updatedAt: getCurrentTime(),
        };

        if (!isNil(data.email)) {
          this.checkDuplicateEmail(data.email);
          updateContent = {
            ...updateContent,
            email: data.email,
          };
        }

        if (!isNil(data.name)) {
          updateContent = {
            ...updateContent,
            name: data.name,
          };
        }

        if (!isNil(data.password)) {
          updateContent = {
            ...updateContent,
            password: await hassPassword(data.password),
          };
        }

        if (!isNil(data.role)) {
          updateContent = {
            ...updateContent,
            role: data.role,
          };
        }

        if (!isNil(data.imageUrl)) {
          updateContent = {
            ...updateContent,
            imageUrl: data.imageUrl,
          };
        }

        await this.usersRepository.update(updateContent, {
          where: { id: userId },
          transaction: t,
        });
      });
    } catch (err) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
  }

  /**
   * Check duplicate email
   */
  async checkDuplicateEmail(email: string) {
    const isDuplicateEmail = await this.usersRepository.findOne({
      where: {
        email,
      },
    });

    if (isDuplicateEmail) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Email is duplicate',
        },
        HttpStatus.FORBIDDEN,
        {
          cause: Error(),
        },
      );
    }
  }

  /**
   * Set active user
   */
  async setActiveUser(email: string) {
    if (isNil(email)) {
      throw new NotFoundException();
    }

    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException();
    }

    if (user.isActive !== 0) {
      throw new BadRequestException('Account is active', {
        cause: new Error(),
        description: 'Account is active',
      });
    }

    // Update account
    await this.usersRepository.update(
      {
        isActive: 1,
        updatedAt: getCurrentTime(),
      },
      { where: { id: user.id } },
    );
  }
}
