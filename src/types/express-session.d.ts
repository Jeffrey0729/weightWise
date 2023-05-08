import 'express-session';
import { WeightLossProfile } from '../entities/WeightCalculatorInfo';
import { EmailVerification } from '../entities/EmailVerification';

declare module 'express-session' {
  export interface Session {
    clearSession(): Promise<void>; // DO NOT MODIFY THIS!

    authenticatedUser: {
      userId: string;
      username: string;
      email: string;
      verifiedEmail: boolean;
      isAdmin: boolean;
      emailVerification: EmailVerification;
      weightLossProfile: WeightLossProfile;
    };

    isLoggedIn: boolean;

  }
}
