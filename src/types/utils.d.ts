type DatabaseConstraintError = {
  type: 'unique' | 'check' | 'not null' | 'foreign key' | 'unknown';
  columnName?: string;
  message?: string;
};

type AuthRequest = {
  username: string;
  password: string;
};

type RegisterRequest = {
  username: string;
  email: string;
  password: string;
};

type WeightLossInformation = {
  age: number;
  sex: string;
  heightInFeet: number;
  heightInInches: number;
  startingWeightInPounds: number;
  currentWeightInPounds: number;
  targetWeightInPounds: number;
  dailyCalorieIntake: number;
  activityLevel: string;
  targetDate: Date;
  saveProfile: string;
}