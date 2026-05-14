import { UserRole } from '../../../domain/enums/user-role.enum';

export class UserResponseDto {
  id!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  phone!: string | null;
  role!: UserRole;
  isVerified!: boolean;
  isBanned!: boolean;
  balance!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
