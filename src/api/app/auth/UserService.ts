import { changePassword } from './handlers/changePassword';
import { deleteTwoFactor } from './handlers/deleteTwoFactor';
import { deleteUser } from './handlers/deleteUser';
import { enableTwoFactor } from './handlers/enableTwoFactor';
import { generateTwoFactorSecret } from './handlers/generateTwoFactorSecret';
import { getAccount } from './handlers/getAccount';
import { getSession } from './handlers/getSession';
import { getTwoFactor } from './handlers/getTwoFactor';
import { login } from './handlers/login';
import { loginDemo } from './handlers/loginDemo';
import { loginWithTwoFactor } from './handlers/loginWithTwoFactor';
import { logout } from './handlers/logout';

const UserService = {
  login,
  loginDemo,
  getAccount,
  loginWithTwoFactor,
  changePassword,
  deleteUser,
  logout,
  generateTwoFactorSecret,
  getTwoFactor,
  deleteTwoFactor,
  enableTwoFactor,
  getSession,
};

export default UserService;
