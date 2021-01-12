import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import {
  CreateAccountInput,
  CreateAccountOutPut,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { AuthUser } from '../auth/auth-user.decorator';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Mutation(() => CreateAccountOutPut)
  async createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutPut> {
    try {
      const { ok, error } = await this.usersService.createAccount(
        createAccountInput,
      );

      return {
        ok,
        error,
      };
    } catch (error) {
      console.error(error);
      return {
        ok: false,
        error,
      };
    }
  }

  @Mutation(() => LoginOutput)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    try {
      return this.usersService.login(loginInput);
    } catch (error) {
      console.error(error);
      return {
        ok: false,
        error,
      };
    }
  }

  @Query(() => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser: User) {
    return authUser;
  }

  @Query(() => UserProfileOutput)
  @UseGuards(AuthGuard)
  async userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    try {
      const user = await this.usersService.findById(userProfileInput.userId);
      if (!user) throw Error('NOT FOUND USER');
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  @UseGuards(AuthGuard)
  @Mutation(() => EditProfileOutput)
  async editProfile(
    @AuthUser() authUser: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.usersService.editProfile(
        authUser.id,
        editProfileInput,
      );
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  @Mutation(() => VerifyEmailOutput)
  async verifyEmail(@Args('input') { code }: VerifyEmailInput) {
    try {
      await this.usersService.verifyEmail(code);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
