export interface VipReferenceDocumentResponse {
    id?: number;
    fileName: string;
    fileOriginalName?: string;
    filePath: string; // Optional if needed
    documentType: string;
    comments: string;
    createdAt?: string;
    createdBy?: string;
  }
  
  export interface VipReferenceDetailsResponse {
    referenceId: number;
    referenceNo: string;
    subject: string;
    receivedDate: string; // Use string or Date depending on how you handle it
    dateOfLetter: string; // Use string or Date depending on how you handle it
    dateOfEntry: string; // Use string or Date depending on how you handle it
    nameOfDignitary: string;
    emailId: string;
    designation: string;
    state: string;
    constituency: string;
    priority: string;
    categoryOfSubject: string;
    subCategoryOfSubject: string;
    currentQueue: string;
    toLoginId?: string; // Assigned assigner's login ID (optional)
    documents: VipReferenceDocumentResponse[]; // List of documents
    initiatorOfficeType?: string; // MINISTRY or SECRETARY
  }