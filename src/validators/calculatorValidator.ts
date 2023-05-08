import Joi from 'joi';
import { makeValidator } from '../utils/makeValidator';

const targetDateSchema = Joi.object({
    age: Joi.number()
        .integer()
        .min(1)
        .required(),

    sex: Joi.string()
        .valid('male','female')
        .required(),
        
    heightInFeet: Joi.number()
        .integer()
        .min(0)
        .required(),
    
    heightInInches: Joi.number()
        .integer()
        .min(0)
        .max(11)
        .required(),
    
    currentWeightInPounds: Joi.number()
        .integer()
        .min(0)
        .required(),
    
    targetWeightInPounds: Joi.number()
        .integer()
        .min(0)
        .required(),
    
    dailyCalorieIntake: Joi.number()
        .integer()
        .min(0)
        .required(),
    
    activityLevel: Joi.string()
        .valid('sedentary','light','moderate','heavy','extra heavy')
        .required(),
    
    saveProfile: Joi.string()
});

const validateTargetDateBody = makeValidator(targetDateSchema, 'body');

const CalorieSchema = Joi.object({
    age: Joi.number()
        .integer()
        .min(1)
        .required(),

    sex: Joi.string()
        .valid('male','female')
        .required(),
        
    heightInFeet: Joi.number()
        .integer()
        .min(0)
        .required(),
    
    heightInInches: Joi.number()
        .integer()
        .min(0)
        .max(11)
        .required(),
    
    currentWeightInPounds: Joi.number()
        .integer()
        .min(0)
        .required(),
    
    targetWeightInPounds: Joi.number()
        .integer()
        .min(0)
        .required(),
    
    activityLevel: Joi.string()
        .valid('sedentary','light','moderate','heavy','extra heavy')
        .required(),
    
    targetDate: Joi.date()
        .greater('now')
        .required(),
    
    saveProfile: Joi.string()
});

const validateCalorieBody = makeValidator(CalorieSchema, 'body');

export { validateTargetDateBody, validateCalorieBody };