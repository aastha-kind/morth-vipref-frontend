export interface ReferenceAssignment {
    fromUserId: number;
    toUserId: number;
    fromRoleId: number;
    toRoleId: number;
    dateOfLetter: string; // ISO date string format e.g., "2025-04-22T00:00:00"
    dateOfReceiving: string;
    dateOfEntry: string;
    nameOfDignitary: string;
    emailId: string;
    designation: string;
    state: string;
    constituency: string;
    priority: string;
    categoryOfSubject: string;
    subCategoryOfSubject: string;
    subject: string;
  }
  