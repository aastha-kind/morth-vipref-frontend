export interface UserList {
    id: number;
    name: string;
    organization: string;
    office: string;
    designation: string;
    loginId: string;
    roles: Role[];
}

export interface Role {
  roleId: number;
  roleName: string;
}