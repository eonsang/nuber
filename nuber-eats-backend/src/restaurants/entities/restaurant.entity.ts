import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Restaurant {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  @IsNumber()
  id: number;

  @Field(() => String)
  @Column()
  @IsString()
  @Length(5)
  name: string;

  @Field(() => Boolean, {
    nullable: true,
  })
  @Column({ default: true })
  @IsOptional()
  @IsBoolean()
  isVegan?: boolean;

  @Field(() => String, {
    defaultValue: '강남',
  })
  @Column()
  @IsString()
  address: string;
}
