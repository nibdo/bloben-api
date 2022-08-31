import { deleteTwoFactor } from './handlers/deleteTwoFactor';
import { enableTwoFactor } from './handlers/enableTwoFactor';
import { generateTwoFactorSecret } from './handlers/generateTwoFactorSecret';
import { loginWithTwoFactor } from './handlers/loginWithTwoFactor';

const AdminTwoFactorService = {
  deleteTwoFactor,
  enableTwoFactor,
  generateTwoFactorSecret,
  loginWithTwoFactor,
};

export default AdminTwoFactorService;
