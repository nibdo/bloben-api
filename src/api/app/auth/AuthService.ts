import { changePassword } from './handlers/changePassword';
import { deleteUser } from './handlers/deleteUser';
import { getSession } from './handlers/getSession';
import { login } from './handlers/login';
import { loginDemo } from './handlers/loginDemo';
import { logout } from './handlers/logout';

const AuthService = {
  login,
  loginDemo,
  changePassword,
  deleteUser,
  logout,
  getSession,
};

export default AuthService;
