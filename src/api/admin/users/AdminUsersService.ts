import { adminCreateUser } from './handlers/adminCreateUser';
import { adminDeleteUser } from './handlers/adminDeleteUser';
import { adminGetUsers } from './handlers/adminGetUsers';
import { adminUpdateUser } from './handlers/adminUpdateUser';

const AdminUsersService = {
  getUsers: adminGetUsers,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
};

export default AdminUsersService;
