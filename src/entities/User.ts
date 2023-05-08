import { Entity, PrimaryGeneratedColumn, Column, OneToOne, Relation, JoinColumn } from 'typeorm';
import { EmailVerification } from './EmailVerification';
import { WeightLossProfile } from './WeightCalculatorInfo';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({unique: true})
  username: string;

  @Column({unique: true})
  email: string;

  @Column({unique: true})
  passwordHash: string;

  @Column({ default: false })
  verifiedEmail: boolean;

  @Column()
  joinDate: string;

  @Column({ default: false })
  isAdmin: boolean;

  @OneToOne(() => WeightLossProfile, (weightLossProfile) => weightLossProfile.user, { cascade: ['insert', 'update'] })
  @JoinColumn()
  weightLossProfile: Relation<WeightLossProfile>;

  @OneToOne(() => EmailVerification, (emailVerification) => emailVerification.user, { cascade: ['insert', 'update'] })
  @JoinColumn()
  emailVerification: Relation<EmailVerification>;
}
