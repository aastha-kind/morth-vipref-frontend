export interface Role {
    roleId: number;
    roleName: string;
    roleDescription:string;
  }
  
  export interface User {
    name:string;
    id: number;
    loginId: string;
    roles: Role[];
    createdAt: string;
    designation?:string;
    organization?:string;
    office?:string;
    contactNumber?:string;
    emailId?:string;
    userLocked?:boolean;
    officeType?: string; // Office type code (e.g., "MINISTRY", "SECRETARY")
    officeTypeName?: string; // Office type name (e.g., "Ministry Office", "Secretary Office")
  }