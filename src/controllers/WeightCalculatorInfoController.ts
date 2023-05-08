import { Request, Response } from 'express';
import { calculateNecessaryCalorieIntake, calculateTargetDate, updateWeightLossCalculatorInfo } from '../models/WeightCalculatorInfoModel';
import { parseDatabaseError } from '../utils/db-utils';
import { getUserById } from '../models/UserModel';

async function getTargetDateCalculator(req: Request, res: Response): Promise<void>{
  if (!req.session.isLoggedIn) {
    res.redirect("/login")
    return;
  }

  const user = await getUserById(req.session.authenticatedUser.userId);
  const weightLossInformation = user.weightLossProfile;

  res.render("targetDateCalculator", { user, weightLossInformation });
}

async function sendTargetDate(req: Request, res: Response): Promise<void>{
  if (!req.session.isLoggedIn) {
    res.redirect("/login")
    return;
  }

  let user = await getUserById(req.session.authenticatedUser.userId);
  const weightLossInformation = req.body as WeightLossInformation;
  weightLossInformation.targetDate = calculateTargetDate(weightLossInformation);
  if (weightLossInformation.saveProfile){
    await updateWeightLossCalculatorInfo(user, weightLossInformation);
    user = await getUserById(req.session.authenticatedUser.userId);
    req.session.authenticatedUser.weightLossProfile = user.weightLossProfile;
  }
  res.render("targetDateCalculator", {user, weightLossInformation});
}

async function getCalorieCalculator(req: Request, res: Response): Promise<void>{
  if (!req.session.isLoggedIn) {
    res.redirect("/login")
    return;
  }

  const user = await getUserById(req.session.authenticatedUser.userId);
  const weightLossInformation = user.weightLossProfile;

  res.render("calorieCalculator", { user, weightLossInformation });
}

async function sendCalorieCalculator(req: Request, res: Response): Promise<void>{
  if (!req.session.isLoggedIn) {
    res.redirect("/login")
    return;
  }

  let user = await getUserById(req.session.authenticatedUser.userId);
  const weightLossInformation = req.body as WeightLossInformation;
  weightLossInformation.dailyCalorieIntake = calculateNecessaryCalorieIntake(weightLossInformation);
  if (weightLossInformation.saveProfile){
    await updateWeightLossCalculatorInfo(user, weightLossInformation);
    user = await getUserById(req.session.authenticatedUser.userId);
    req.session.authenticatedUser.weightLossProfile = user.weightLossProfile;
  }
  res.render("calorieCalculator", {user, weightLossInformation});
}

async function changeWeightLossProfile(req: Request, res: Response): Promise<void>{
  if (!(req.session.isLoggedIn)){
    res.redirect('/login');
    return;
  }

  const { userId } = req.session.authenticatedUser;
  let user = await getUserById(userId);
  
  if (!user) {
    res.redirect('/login');
    return;
  }

  if (!user.weightLossProfile) {
    res.sendStatus(401);
    return;
  }

  const weightLossInfo = req.body as WeightLossInformation;
  const targetDate = calculateTargetDate(weightLossInfo);
  weightLossInfo.targetDate = targetDate;

  try {
    await updateWeightLossCalculatorInfo(user, weightLossInfo);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

export { getTargetDateCalculator, changeWeightLossProfile, sendTargetDate, getCalorieCalculator, sendCalorieCalculator }
