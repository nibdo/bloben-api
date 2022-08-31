import { deleteTwoFactor } from './handlers/deleteTwoFactor';
import { enableTwoFactor } from './handlers/enableTwoFactor';
import { generateTwoFactorSecret } from './handlers/generateTwoFactorSecret';
import { loginWithTwoFactor } from './handlers/loginWithTwoFactor';

const Admin2FAService = {
  deleteTwoFactor,
  enableTwoFactor,
  generateTwoFactorSecret,
  loginWithTwoFactor,
};

export default Admin2FAService;
