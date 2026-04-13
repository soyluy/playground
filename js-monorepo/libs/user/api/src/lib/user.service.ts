import { Injectable } from '@nestjs/common';
import { User } from './types/user.interface';
import { PrismaService } from '@hub/prisma';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(user: User): Promise<User> {
    return this.prismaService.user.create({
      data: user,
    });
  }

  async findOrCreateUser(
    user: Omit<User, 'id'>,
  ): Promise<{ user: User; created: boolean }> {
    const existing = await this.prismaService.user.findUnique({
      where: { googleId: user.googleId },
    });

    if (existing) return { user: existing, created: false };

    const created = await this.prismaService.user.create({ data: user });
    return { user: created, created: true };
  }

  async findUserById(id: number): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  async findUserByGoogleId(googleId: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: { googleId },
    });
  }
}
