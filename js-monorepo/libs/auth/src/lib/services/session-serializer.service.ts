import { UserService } from '@hub/user-api';
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

@Injectable()
export class SessionSerializerService extends PassportSerializer {
  constructor(private readonly userService: UserService) {
    super();
  }

  serializeUser(user: any, done: (err: any, id?: any) => void) {
    done(null, user.id);
  }

  async deserializeUser(id: any, done: (err: any, user?: any) => void) {
    const user = await this.userService.findUser({ id });
    if (!user) {
      done(new Error('User not found'), undefined);
    } else {
      done(null, user);
    }
  }
}
