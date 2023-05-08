import { Entity, PrimaryGeneratedColumn, Column, OneToOne, Relation } from 'typeorm';
import { User } from './User';

@Entity()
export class WeightLossProfile {
  @PrimaryGeneratedColumn('uuid')
  profileId: string;

  @Column({nullable: true, default: null})
  age: number | null;

  @Column({nullable: true, default: null})
  sex: string | null;

  @Column({nullable: true, default: null})
  heightInFeet: number | null;

  @Column({nullable: true, default: null})
  heightInInches: number | null;

  @Column({nullable: true, default: null})
  currentWeightInPounds: number | null;

  @Column({nullable: true, default: null})
  targetWeightInPounds: number | null;

  @Column({nullable: true, default: null})
  activityLevel: string | null;

  @Column({nullable: true, default: null})
  dailyCalorieIntake: number | null;

  @Column({nullable: true, default: null})
  targetDate: Date | null;

  @OneToOne(() => User, (user) => user.weightLossProfile, { cascade: ['insert', 'update'] })
  user: Relation<User>;
}
