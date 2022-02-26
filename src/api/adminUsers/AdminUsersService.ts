import { adminCreateUser } from './handlers/adminCreateUser';
import { adminGetUsers } from './handlers/adminGetUsers';
import { adminUpdateUser } from './handlers/adminUpdateUser';

const AdminUsersService = {
  getUsers: adminGetUsers,
  adminCreateUser,
  adminUpdateUser,
};

export default AdminUsersService;
