import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { compare, hash } from 'bcrypt';

import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { TokenService } from './token.service';

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  private readonly _emailVerificationCodes = new Map<string, string>();
  private readonly _passwordResetTokens = new Map<string, string>();
  private readonly _failedLogins = new Map<string, { count: number; lockedUntil: number | null }>();

  constructor(
    private readonly _userRepository: UserRepository,
    private readonly _tokenService: TokenService,
    private readonly _configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: User; tokens: AuthTokens }> {
    const existingUser = await this._userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email is already registered');
    }

    const user = this._userRepository.create({
      email: dto.email.toLowerCase().trim(),
      passwordHash: await hash(dto.password, 10),
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      phone: dto.phone ?? null,
      role: dto.role ?? UserRole.BUYER,
      isVerified: false,
      isBanned: false,
      balance: 0,
    });

    const savedUser = await this._userRepository.save(user);
    await this.generateAndStoreVerificationCode(savedUser.id);

    const tokens = await this.issueTokens(savedUser);
    return { user: savedUser, tokens };
  }

  async login(dto: LoginDto): Promise<{ user: User; tokens: AuthTokens }> {
    const email = dto.email.toLowerCase().trim();
    const user = await this._userRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    this.ensureNotLocked(user.id);

    const passwordMatches = await compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      this.recordFailedAttempt(user.id);
      throw new BadRequestException('Invalid email or password');
    }

    if (user.isBanned) {
      throw new ForbiddenException('Account is banned');
    }

    this._failedLogins.delete(user.id);
    const tokens = await this.issueTokens(user);
    return { user, tokens };
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      await this._tokenService.revokeAllUserTokens(userId);
      return;
    }

    void this._tokenService.revokeRefreshToken(userId, refreshToken);
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const payload = await this._tokenService.validateRefreshToken(refreshToken);
    const user = await this._userRepository.findById(payload.sub);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isBanned) {
      throw new ForbiddenException('Account is banned');
    }

    return this.issueTokens(user);
  }

  async verifyEmail(userId: string, code: string): Promise<boolean> {
    const expectedCode = this._emailVerificationCodes.get(userId);
    if (!expectedCode || expectedCode !== code) {
      return false;
    }

    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isVerified = true;
    await this._userRepository.save(user);
    this._emailVerificationCodes.delete(userId);
    return true;
  }

  async resendVerification(userId: string): Promise<void> {
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      return;
    }

    await this.generateAndStoreVerificationCode(userId);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this._userRepository.findByEmail(email.toLowerCase().trim());
    if (!user) {
      return;
    }

    const token = randomBytes(24).toString('hex');
    this._passwordResetTokens.set(token, user.id);
  }

  async resetPassword(token: string, nextPassword: string): Promise<boolean> {
    const userId = this._passwordResetTokens.get(token);
    if (!userId) {
      return false;
    }

    const user = await this._userRepository.findById(userId);
    if (!user) {
      return false;
    }

    user.passwordHash = await hash(nextPassword, 10);
    await this._userRepository.save(user);
    this._passwordResetTokens.delete(token);
    await this._tokenService.revokeAllUserTokens(user.id);

    return true;
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const accessToken = await this._tokenService.generateAccessToken(user);
    const refreshToken = await this._tokenService.generateRefreshToken(user);
    return { accessToken, refreshToken };
  }

  private ensureNotLocked(userId: string): void {
    const lockInfo = this._failedLogins.get(userId);
    if (!lockInfo?.lockedUntil) {
      return;
    }

    if (Date.now() < lockInfo.lockedUntil) {
      throw new ForbiddenException('Account temporarily locked');
    }

    this._failedLogins.delete(userId);
  }

  private recordFailedAttempt(userId: string): void {
    const maxAttempts = this._configService.get<number>('AUTH_MAX_FAILED_ATTEMPTS', 5);
    const lockMinutes = this._configService.get<number>('AUTH_LOCK_MINUTES', 15);
    const lockMs = lockMinutes * 60 * 1000;

    const lockInfo = this._failedLogins.get(userId) ?? { count: 0, lockedUntil: null };
    const nextCount = lockInfo.count + 1;

    if (nextCount >= maxAttempts) {
      this._failedLogins.set(userId, {
        count: 0,
        lockedUntil: Date.now() + lockMs,
      });
      return;
    }

    this._failedLogins.set(userId, {
      count: nextCount,
      lockedUntil: null,
    });
  }

  private async generateAndStoreVerificationCode(userId: string): Promise<string> {
    const length = this._configService.get<number>('AUTH_VERIFICATION_CODE_LENGTH', 6);
    const code = randomBytes(length).toString('hex').slice(0, length).toUpperCase();
    this._emailVerificationCodes.set(userId, code);
    return code;
  }
}
