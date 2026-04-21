import { User, UserService } from '@hub/user-api';
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

@Injectable()
export class SessionSerializerService extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super();
  }

  serializeUser(user: User, done: (err: any, id?: any) => void) {
    done(null, user.id);
  }

  async deserializeUser(id: any, done: (err: any, user?: any) => void) {
    const user = await this.userService.findUserById(id);
    if (!user) {
      done(null, false);
    } else {
      done(null, user);
    }
  }
}
