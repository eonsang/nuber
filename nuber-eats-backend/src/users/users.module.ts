import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Verification]), ConfigService],
  providers: [UsersService, UsersResolver],
  exports: [UsersService],
})
export class UsersModule {}
