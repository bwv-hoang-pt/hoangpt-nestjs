import { usersConstants } from '../../../constants';
import { User } from '../entities/users.entity';

export const usersProviders = [
  {
    provide: usersConstants.USERS_REPOSITORY,
    useValue: User,
  },
];
