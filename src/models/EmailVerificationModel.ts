import { AppDataSource } from '../dataSource';
import { EmailVerification } from '../entities/EmailVerification';
import { User } from '../entities/User';
import { randomBytes } from 'crypto';

const emailVerificationRepository = AppDataSource.getRepository(EmailVerification);

async function createNewEmailVerification(user: User): Promise<EmailVerification | null> {
    let newEmailVerification = new EmailVerification();
    newEmailVerification.sentDate = new Date();
    newEmailVerification.user = user;
    newEmailVerification.verificationString = randomBytes(10).toString('hex');
    newEmailVerification = await emailVerificationRepository.save(newEmailVerification);

    return newEmailVerification;
}

async function updateVerificationString(emailId: string): Promise<void> {
  await emailVerificationRepository
    .createQueryBuilder('emailVerification')
    .leftJoinAndSelect('emailVerification.user', 'user')
    .update()
    .set({verificationString: randomBytes(10).toString('hex')})
    .where('emailId = :emailId', {emailId: emailId})
    .execute();
}

async function deleteEmailVerification(emailId: string): Promise<void> {
  await emailVerificationRepository
      .createQueryBuilder('emailVerification')
      .delete()
      .where({emailId})
      .execute();
}

export { createNewEmailVerification, deleteEmailVerification, updateVerificationString }
