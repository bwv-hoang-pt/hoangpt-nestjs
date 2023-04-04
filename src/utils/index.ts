import { HttpException, HttpStatus } from '@nestjs/common';
import { User } from 'src/modules/users/entities/users.entity';
import * as moment from 'moment';

/**
 * Check exist account
 */
export function checkExistAccount(user: User) {
  if (!user) {
    throw new HttpException(
      {
        status: HttpStatus.NOT_FOUND,
        error: 'Email address not found',
      },
      HttpStatus.NOT_FOUND,
      {
        cause: Error(),
      },
    );
  }
}

/**
 * Get current time
 */

export function getCurrentTime() {
  return moment().format('YYYY/MM/DD HH:mm');
}
