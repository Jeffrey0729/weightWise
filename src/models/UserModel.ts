import { AppDataSource } from '../dataSource';
import { User } from '../entities/User';

const userRepository = AppDataSource.getRepository(User);

async function addUser(username: string, email: string, passwordHash: string): Promise<User> {
  let newUser = new User();
  newUser.username = username;
  newUser.email = email;
  newUser.passwordHash = passwordHash;
  newUser.joinDate = Date();

  newUser = await userRepository.save(newUser);

  return newUser;
}

async function getUserByUsername(username: string): Promise<User | null> {
  const user = await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.weightLossProfile', 'weightLossProfile')
    .leftJoinAndSelect('user.emailVerification', 'emailVerification')
    .where('user.username = :username', { username })
    .getOne();

  return user;
}

async function getUserById(userId: string): Promise<User | null> {
  const user = await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.weightLossProfile', 'weightLossProfile')
    .leftJoinAndSelect('user.emailVerification', 'emailVerification')
    .where('user.userId = :userId', { userId })
    .getOne();
  return user;

}

async function updateEmailVerification(userId: string): Promise<void>{
  await userRepository
  .createQueryBuilder()
  .update(User)
  .set({verifiedEmail: true})
  .where({userId})
  .execute();

}

export { addUser, getUserByUsername, getUserById, updateEmailVerification };
