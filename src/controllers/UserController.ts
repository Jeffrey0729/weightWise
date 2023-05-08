import { Request, Response } from 'express';
import argon2 from 'argon2';
import { addUser, getUserByUsername } from '../models/UserModel';
import { parseDatabaseError } from '../utils/db-utils';
import { createWeightLossProfile } from '../models/WeightCalculatorInfoModel';

async function registerUser(req: Request, res: Response): Promise<void> {
  if (req.session.isLoggedIn){
    res.redirect('/api/logout')
  }
  
  const { username, email, password } = req.body as RegisterRequest;

  if (username === "" || email === "" || password === "") {
    res.sendStatus(406);
    return;
  }

  const passwordHash = await argon2.hash(password);

  try {
    const user = await addUser(username, email, passwordHash);
    await createWeightLossProfile(user);
    res.redirect('/user/profile');
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function logIn(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as AuthRequest;

  const user = await getUserByUsername(username);

  if (!user) {
    res.redirect("/login");
    return;
  }

  const { passwordHash } = user;
  if (!(await argon2.verify(passwordHash, password))) {
    res.redirect("/login");
    return;
  }

  try {
    await req.session.clearSession();
    req.session.authenticatedUser = {
      userId: user.userId,
      username: user.username,
      verifiedEmail: user.verifiedEmail,
      email: user.email,
      isAdmin: user.isAdmin,
      weightLossProfile: user.weightLossProfile,
      emailVerification: user.emailVerification
    }
    req.session.isLoggedIn = true;
    res.redirect("/user/profile");
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function logOut(req: Request, res: Response): Promise<void> {
  try {
    await req.session.clearSession();
    res.redirect('/login')
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

export { registerUser, logIn, logOut };
