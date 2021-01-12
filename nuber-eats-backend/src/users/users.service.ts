import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { CreateAccountInput } from './dtos/create-account.dto';
import { LoginInput } from './dtos/login.dto';
import { JwtService } from '../jwt/jwt.service';
import { EditProfileInput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{
    ok: boolean;
    error?: string;
  }> {
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return {
          ok: false,
          error: 'there is a user with that email alreay',
        };
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );
      return {
        ok: true,
      };
    } catch (error) {
      console.error(error);
      return {
        ok: false,
        error: "Couldn't create accrount",
      };
    }
    // create new user & hash the password
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<{
    ok: boolean;
    error?: string;
    token?: string;
  }> {
    try {
      const user = await this.users.findOne(
        { email },
        {
          select: ['id', 'password'],
        },
      );
      if (!user) {
        return {
          ok: false,
          error: 'User Not Found',
        };
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }

      const token: string = this.jwtService.sign({ id: user.id });
      return {
        ok: true,
        token,
      };
    } catch (error) {
      console.error(error);
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<User> {
    return await this.users.findOne({ id });
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<User> {
    const user = await this.users.findOne(userId);
    if (email) {
      user.email = email;
      user.verified = false;
      await this.verifications.save(this.verifications.create({ user }));
    }
    if (password) {
      user.password = password;
    }
    return await this.users.save(user);
  }

  async verifyEmail(code: string): Promise<boolean> {
    try {
      const verification = await this.verifications.findOne(
        { code },
        {
          relations: ['user'],
        },
      );

      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verifications.delete(verification.id);
        return true;
      }
      throw new Error();
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
