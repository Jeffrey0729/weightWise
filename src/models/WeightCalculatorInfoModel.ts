import { AppDataSource } from '../dataSource';
import { WeightLossProfile } from '../entities/WeightCalculatorInfo';
import { User } from '../entities/User';

const weightLossProfileRepository = AppDataSource.getRepository(WeightLossProfile);

async function createWeightLossProfile(user: User): Promise<void>{
  let newWeightLossProfile = new WeightLossProfile();
  newWeightLossProfile.user = user;
  newWeightLossProfile = await weightLossProfileRepository.save(newWeightLossProfile);
}

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

function convertWeightLossInformation(weightlossInformation: WeightLossInformation): WeightLossInformation{
  weightlossInformation.age = Number(weightlossInformation.age)
  weightlossInformation.heightInFeet = Number(weightlossInformation.heightInFeet)
  weightlossInformation.heightInInches = Number(weightlossInformation.heightInInches)
  weightlossInformation.currentWeightInPounds = Number(weightlossInformation.currentWeightInPounds)
  weightlossInformation.targetWeightInPounds = Number(weightlossInformation.targetWeightInPounds)
  weightlossInformation.dailyCalorieIntake = Number(weightlossInformation.dailyCalorieIntake)
  return weightlossInformation;
}

// 1 pound = ~0.453592 Kg
function convertPoundsToKilograms(pounds: number): number{
  return pounds * 0.453592;
}

// 1 kg = ~2.20462 pounds
function convertKilogramsToPounds(kilograms: number): number{
  return kilograms * 2.20462;
}

// 1 inch = ~2.54 centimeters
function convertInchesToCentimeters(feet: number, inches: number): number{
  const totalInches: number = feet * 12 + inches;
  return totalInches * 2.54;
}

// Calculates calories burned at rest
// Based on the Mifflin-St Jeor Equation
function calculateBaseCalorieBurn(sex: string, age: number, heightInCentimeters: number, weightInKilograms: number): number{
  const baseEquation = (10 * weightInKilograms) + (6.25 * heightInCentimeters) - (5 * age);
  
  if (sex === "male"){
    return baseEquation + 5;
  }
  else{
    return baseEquation - 161;
  }
}

function calculateTotalCaloriesToBurn(targetWeightInPounds: number, currentWeightInPounds: number){
  const poundsToLose = currentWeightInPounds - targetWeightInPounds;
  return poundsToLose * 3500;
}

function getCaloriesBurnedByActivityLevel(activityLevel: string): number{
  if (activityLevel == "light"){
    return 1.375;
  }
  else if (activityLevel == "moderate"){
    return 1.55;
  }
  else if (activityLevel == "heavy"){
    return 1.725;
  }
  else if (activityLevel == "extra heavy"){
    return 1.9;
  }
  else {
    return 1.2;
  }
}

function calculateDaysUntilTargetDate(targetDate: Date){
  const differenceInMilliseconds = targetDate.getTime() - new Date().getTime();
  return differenceInMilliseconds / (1000*60*60*24);
}

function calculateTargetDate(weightLossInformation: WeightLossInformation): Date{
  weightLossInformation = convertWeightLossInformation(weightLossInformation);

  let {
    age, 
    sex, 
    heightInFeet, 
    heightInInches, 
    currentWeightInPounds, 
    targetWeightInPounds, 
    dailyCalorieIntake, 
    activityLevel
  } = weightLossInformation;

  const baseCaloriesBurnedPerDay = calculateBaseCalorieBurn(sex, age, convertInchesToCentimeters(heightInFeet, heightInInches), convertPoundsToKilograms(currentWeightInPounds));

  const totalCaloriesBurnedPerDay = baseCaloriesBurnedPerDay * getCaloriesBurnedByActivityLevel(activityLevel);

  const netCaloriesBurnedPerDay = totalCaloriesBurnedPerDay - dailyCalorieIntake;

  const weightLossPeriodInDays = calculateTotalCaloriesToBurn(targetWeightInPounds, currentWeightInPounds) / netCaloriesBurnedPerDay;

  const weightLossPeriodInMilliseconds = weightLossPeriodInDays * 1000*60*60*24;

  const targetDate = new Date(new Date().getTime() + weightLossPeriodInMilliseconds)

  return targetDate;
}

function calculateNecessaryCalorieIntake(weightLossInformation: WeightLossInformation): number{
  weightLossInformation = convertWeightLossInformation(weightLossInformation);

  let {
    age, 
    sex, 
    heightInFeet, 
    heightInInches, 
    currentWeightInPounds, 
    targetWeightInPounds, 
    targetDate, 
    activityLevel
  } = weightLossInformation;

  targetDate = new Date(targetDate)

  const weightLossPeriodInDays = calculateDaysUntilTargetDate(targetDate);

  const baseCaloriesBurnedPerDay = calculateBaseCalorieBurn(sex, age, convertInchesToCentimeters(heightInFeet, heightInInches), convertPoundsToKilograms(currentWeightInPounds));

  const totalCaloriesBurnedPerDay = baseCaloriesBurnedPerDay * getCaloriesBurnedByActivityLevel(activityLevel);

  return (totalCaloriesBurnedPerDay - calculateTotalCaloriesToBurn(targetWeightInPounds, currentWeightInPounds) / weightLossPeriodInDays);

}

export { createWeightLossProfile, updateWeightLossCalculatorInfo, convertKilogramsToPounds, calculateTargetDate, calculateNecessaryCalorieIntake, getWeightLossProfileByUserId };
