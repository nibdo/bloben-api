import { changePasswordAdmin } from './handlers/changePasswordAdmin';
import { getAdminAccount } from './handlers/getAdminAccount';
import { loginAdmin } from './handlers/loginAdmin';
import { logoutAdmin } from './handlers/logoutAdmin';

const AdminService = {
  loginAdmin,
  changePasswordAdmin,
  getAdminAccount,
  logoutAdmin,
};

export default AdminService;
