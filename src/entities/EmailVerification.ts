import { Entity, PrimaryGeneratedColumn, Column, OneToOne, Relation } from 'typeorm';
import { User } from './User';

@Entity()
export class EmailVerification {
    @PrimaryGeneratedColumn('uuid')
    emailId: string;

    @Column()
    verificationString: string;

    @Column()
    sentDate: Date;

    @OneToOne(() => User, (user) => user.emailVerification, { cascade: ['insert', 'update'] })
    user: Relation<User>;
}
