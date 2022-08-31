import { deleteTwoFactor } from './handlers/deleteTwoFactor';
import { enableTwoFactor } from './handlers/enableTwoFactor';
import { generateTwoFactorSecret } from './handlers/generateTwoFactorSecret';
import { loginWithTwoFactor } from './handlers/loginWithTwoFactor';

const TwoFactorService = {
  loginWithTwoFactor,
  generateTwoFactorSecret,
  deleteTwoFactor,
  enableTwoFactor,
};

export default TwoFactorService;
