import { AppDataSource } from '../dataSource';
import { WeightLossProfile } from '../entities/WeightCalculatorInfo';
import { User } from '../entities/User';

const weightLossProfileRepository = AppDataSource.getRepository(WeightLossProfile);

// Create user profile for weight calculator
async function createWeightLossProfile(user: User): Promise<void>{
  let newWeightLossProfile = new WeightLossProfile();
  newWeightLossProfile.user = user;
  newWeightLossProfile = await weightLossProfileRepository.save(newWeightLossProfile);
}

// Update user information
async function updateWeightLossCalculatorInfo(user: User, weightLossInformation: WeightLossInformation): Promise<void>{
  weightLossInformation = convertWeightLossInformation(weightLossInformation);
  let { age, sex, heightInFeet, heightInInches, currentWeightInPounds, targetWeightInPounds, dailyCalorieIntake, activityLevel, targetDate } = weightLossInformation;
  await weightLossProfileRepository
    .createQueryBuilder('weightLossProfile')
    .leftJoinAndSelect('weightLossProfile.user', 'user')
    .update()
    .set({age: age, 
      sex: sex, 
      heightInFeet: heightInFeet, 
      heightInInches: heightInInches,
      currentWeightInPounds: currentWeightInPounds,
      targetWeightInPounds: targetWeightInPounds,
      dailyCalorieIntake: dailyCalorieIntake,
      activityLevel: activityLevel,
      targetDate: targetDate
    })
    .where('profileId = :profileId', {profileId: user.weightLossProfile.profileId})
    .execute();

}

// Get user profile using userId
async function getWeightLossProfileByUserId(userId: string): Promise<WeightLossProfile | null>{
  const weightLossProfile = await weightLossProfileRepository
        .createQueryBuilder('weightLossProfile')
        .leftJoinAndSelect('weightLossProfile.user', 'user')
        .where('userId = :userId', {userId})
        .select(['weightLossProfile.age', 
                 'weightLossProfile.sex', 
                 'weightLossProfile.heightInCentimeters',
                 'weightLossProfile.startingWeightInKilograms',
                 'weightLossProfile.activityLevel',
                 'weightLossProfile.dailyCalorieIntake',
                 'weightLossProfile.targetDate',
                ])
        .getOne();

    return weightLossProfile;
}

// Turn information into string
function convertWeightLossInformation(weightlossInformation: WeightLossInformation): WeightLossInformation{
  weightlossInformation.age = Number(weightlossInformation.age)
  weightlossInformation.heightInFeet = Number(weightlossInformation.heightInFeet)
  weightlossInformation.heightInInches = Number(weightlossInformation.heightInInches)
  weightlossInformation.currentWeightInPounds = Number(weightlossInformation.currentWeightInPounds)
  weightlossInformation.targetWeightInPounds = Number(weightlossInformation.targetWeightInPounds)
  weightlossInformation.dailyCalorieIntake = Number(weightlossInformation.dailyCalorieIntake)
  return weightlossInformation;
}

// Kilogram Conversion
function convertPoundsToKilograms(pounds: number): number{
  return pounds * 0.453592;
}

// Pound Conversion
function convertKilogramsToPounds(kilograms: number): number{
  return kilograms * 2.20462;
}

// Inch Conversion
function convertInchesToCentimeters(feet: number, inches: number): number{
  const totalInches: number = feet * 12 + inches;
  return totalInches * 2.54;
}

// Calculates calorie burn rate based on personal information
function calculateBaseCalorieBurn(sex: string, age: number, heightInCentimeters: number, weightInKilograms: number): number{
  const calorieBurnEquation = (10 * weightInKilograms) + (6.25 * heightInCentimeters) - (5 * age);
  
  if (sex === "male"){
    return calorieBurnEquation + 5;
  }
  else{
    return calorieBurnEquation - 161;
  }
}

// Calculator for calories needed to be burned to reach weight goal
function calculateTotalCaloriesToBurn(targetWeight: number, currentWeight: number){
  const poundLoss = currentWeight - targetWeight;
  return poundLoss * 3500;
}

// 
function getCaloriesBurnedByActivityLevel(activityLevel: string): number{
  if (activityLevel == "light"){
    return 1.375;
  } else if (activityLevel == "moderate"){
    return 1.55;
  } else if (activityLevel == "heavy"){
    return 1.725;
  } else if (activityLevel == "extra heavy"){
    return 1.9;
  } else {
    return 1.2;
  }
}

// Day calculations to target day
function calculateDaysUntilTargetDate(targetDate: Date){
  const differenceInMilliseconds = targetDate.getTime() - new Date().getTime();
  return differenceInMilliseconds / (1000*60*60*24);
}

// Get total days until weight goal is reached using recommended calorie intake
function calculateTargetDate(weightLossUserInfo: WeightLossInformation): Date{
  weightLossUserInfo = convertWeightLossInformation(weightLossUserInfo);

  let {
    age, 
    sex, 
    heightInFeet, 
    heightInInches, 
    currentWeightInPounds, 
    targetWeightInPounds, 
    dailyCalorieIntake, 
    activityLevel
  } = weightLossUserInfo;

  const baseCaloriesBurnedPerDay = calculateBaseCalorieBurn(sex, age, convertInchesToCentimeters(heightInFeet, heightInInches), convertPoundsToKilograms(currentWeightInPounds));

  const totalCaloriesBurnedPerDay = baseCaloriesBurnedPerDay * getCaloriesBurnedByActivityLevel(activityLevel);

  const netCaloriesBurnedPerDay = totalCaloriesBurnedPerDay - dailyCalorieIntake;

  const weightLossPeriodInDays = calculateTotalCaloriesToBurn(targetWeightInPounds, currentWeightInPounds) / netCaloriesBurnedPerDay;

  const weightLossPeriodInMilliseconds = weightLossPeriodInDays * 1000*60*60*24;

  const targetDate = new Date(new Date().getTime() + weightLossPeriodInMilliseconds)

  return targetDate;
}

/* 
Calculate recommened calorie intake based on user info and how many days they
have set to lose the weight by
*/
function calculateCalorieIntake(weightLossUserInfo: WeightLossInformation): number{
  weightLossUserInfo = convertWeightLossInformation(weightLossUserInfo);

  let {
    age, 
    sex, 
    heightInFeet, 
    heightInInches, 
    currentWeightInPounds, 
    targetWeightInPounds, 
    targetDate, 
    activityLevel
  } = weightLossUserInfo;

  targetDate = new Date(targetDate)

  const weightLossPeriodInDays = calculateDaysUntilTargetDate(targetDate);

  const baseCaloriesBurnedPerDay = calculateBaseCalorieBurn(sex, age, convertInchesToCentimeters(heightInFeet, heightInInches), convertPoundsToKilograms(currentWeightInPounds));

  const totalCaloriesBurnedPerDay = baseCaloriesBurnedPerDay * getCaloriesBurnedByActivityLevel(activityLevel);

  return calculateTotalCaloriesToBurn(targetWeightInPounds, currentWeightInPounds) / weightLossPeriodInDays - totalCaloriesBurnedPerDay;

}

export { createWeightLossProfile, updateWeightLossCalculatorInfo, convertKilogramsToPounds, calculateTargetDate, calculateCalorieIntake, getWeightLossProfileByUserId };
