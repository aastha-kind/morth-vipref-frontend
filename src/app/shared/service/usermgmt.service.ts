import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../interface/user.model';
import { ReferenceAssignment } from '../interface/reference-assignement.model';
import { API_ENDPOINTS } from '../utilities/api_endpoints';
import { VipReferenceDetailsResponse } from '../interface/reference-details-response.model';
import { UserList } from '../interface/user-list.model';
import { userInfo } from 'os';
import { State } from '../interface/state.model';
import { VipReference } from '../pages/dashboard/dashboard.component';
import { PagedResponse } from '../interface/paged-response.model';


@Injectable({
  providedIn: 'root'
})
export class UsermgmtService {
  private readonly STORAGE_KEY = 'vip_reference_details';
  private referenceDetails = new BehaviorSubject<VipReference | null>(this.loadFromStorage());
  referenceDetails$ = this.referenceDetails.asObservable();

  setReferenceDetails(refDetails: VipReference) {
    this.referenceDetails.next(refDetails);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(refDetails));
  }

  clearReferenceDetails() {
    this.referenceDetails.next(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private loadFromStorage(): VipReference | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  constructor(private http: HttpClient) { }


  loginVipUser(userLoginData: any): Observable<User> {
    return this.http.post<User>(`${API_ENDPOINTS.authenticate}/login`, userLoginData)
  }

  getDashboardStats(userName: string): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.reference}/dashboard-stats/${userName}`)
  }
  getInitiatorDashboardStats(userName: string): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.reference}/dashboard-stats-initator/${userName}`)
  }
  getAssigneeDashboardStats(userName: string): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.reference}/dashboard-stats-assignee/${userName}`)
  }


  getVipReferenceList(userName: string): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.reference}/reference-list/${userName}`)
  }

  getVipReferenceListPaginated(userName: string, page: number, size: number, search?: string, sortBy?: string, sortDir?: string): Observable<PagedResponse<any>> {
    let url = `${API_ENDPOINTS.reference}/reference-list/${userName}/paginated?page=${page}&size=${size}`;
    if (search && search.trim() !== '') {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (sortBy && sortBy.trim() !== '') {
      url += `&sortBy=${encodeURIComponent(sortBy)}`;
    }
    if (sortDir && sortDir.trim() !== '') {
      url += `&sortDir=${encodeURIComponent(sortDir)}`;
    }
    console.log('API URL:', url);
    return this.http.get<PagedResponse<any>>(url);
  }

  //head-of organization
  getHeadOfOrganization(organizationId: number): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.reference}/get-head-of-organization/${organizationId}`)
  }

  // queue api
  getUserQueueList(userName: string): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.reference}/user/${userName}/queues`)
  }
  getQueueReferencesList(queueData: any): Observable<any> {
    return this.http.post<any>(`${API_ENDPOINTS.reference}/user/queue/references`, queueData)
  }
  getQueueReferencesListPaginated(queueData: any): Observable<any> {
    console.log('Queue API Request:', queueData);
    return this.http.post<any>(`${API_ENDPOINTS.reference}/user/queue/references/paginated`, queueData)
  }

  getReferenceListByQueueAndStatus(userData: any): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.reference}/reference-list/${userData.loginId}/${userData.status}`)
  }

  // action allowed api
  getUserActionAllowed(userDetails: any): Observable<any> {
    return this.http.post<any>(`${API_ENDPOINTS.referenceWorkFlow}/actions/get-allowed`, userDetails);
  }

  addVipReferenceDetails(formData: FormData): Observable<any> {
    return this.http.post<any>(`${API_ENDPOINTS.referenceWorkFlow}/action/submit-to-assigner`, formData)
  }

  updateReference(formData: any): Observable<string> {
    return this.http.post(`${API_ENDPOINTS.reference}/updateReference`, formData,
      { responseType: 'text', headers: {} }
    )
  }

  getReferenceDetails(referenceNumber: any): Observable<VipReferenceDetailsResponse> {
    return this.http.get<VipReferenceDetailsResponse>(`${API_ENDPOINTS.reference}/reference-details/${referenceNumber}`)
  }

  forwardReference(referenceData: any): Observable<any> {
    return this.http.post(`${API_ENDPOINTS.referenceWorkFlow}/action/forward-to-assignee`, referenceData,
      { responseType: 'text', headers: {} })
  }



  // master data api

  getOrganizationList(): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.referencemaster}/organization`)
  }

  getOfficeList(selectedOrganization: string): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.referencemaster}/get-office-types/${selectedOrganization}`);
  }

  getDesignationList(selectedOrganization: string): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.referencemaster}/get-designations/${selectedOrganization}`);
  }

  getDesignationListByOffice(officeId: number): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.referencemaster}/get-designations-by-office/${officeId}`);
  }

  getDesignationListByOfficeName(officeName: string): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.referencemaster}/get-designations-by-office-name/${officeName}`);
  }

  getVipDesignationList(): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.referencemaster}/vip-designations`)
  }

  getUserList(userInfo: any): Observable<UserList> {
    console.log(userInfo);
    return this.http.post<UserList>(`${API_ENDPOINTS.referencemaster}/get-users`, userInfo);
  }

  getStateList(): Observable<State> {
    return this.http.get<State>(`${API_ENDPOINTS.referencemaster}/states`);
  }

  getFinalAssigneeList(): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.referencemaster}/get-final-assignee`);
  }

  getActiveAssigners(): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.referencemaster}/get-active-assigners`);
  }

  // get action history
  getActionHistory(referenceData: any): Observable<any> {
    return this.http.post<any>(`${API_ENDPOINTS.referenceWorkFlow}/action-history/get`, referenceData);
  }

  // Download document by ID (returns blob for viewing/downloading)
  downloadDocumentById(documentId: number, userId: number): Observable<Blob> {
    return this.http.post(`${API_ENDPOINTS.referenceWorkFlow}/download-document-by-id`,
      { documentId, userId },
      { responseType: 'blob' }
    )
  }

  //upload documents api
  uploadReferenceDocuments(uploadDocsData: FormData, referenceId: number): Observable<string> {
    return this.http.post(`${API_ENDPOINTS.reference}/upload-document/${referenceId}`, uploadDocsData,
      {
        responseType: 'text'
      }
    )
  }


  // save draft reply
  saveDraftReply(draftReplyForm: FormData) {
    return this.http.post(`${API_ENDPOINTS.draftReply}/save`, draftReplyForm);
  }

  getAllDraftReply(referenceId: number) {
    return this.http.get(`${API_ENDPOINTS.draftReply}/all/${referenceId}`);
  }

  uploadDraftReply(draftReferenceId: number) {
    return this.http.post(`${API_ENDPOINTS.draftReply}/upload/${draftReferenceId}`,{});
  }

  getActiveReferenceId(referenceId: number) {
    return this.http.get(`${API_ENDPOINTS.draftReply}/active/${referenceId}`);
  }

  forgotPassword(data: { loginId: string, email: string }): Observable<any> {
    return this.http.post<any>(`${API_ENDPOINTS.authenticate}/forgot-password`, data);
  }

  resetPassword(data: { loginId: string, temporaryPassword: string, newPassword: string, confirmPassword: string }): Observable<any> {
    return this.http.post<any>(`${API_ENDPOINTS.authenticate}/reset-password`, data);
  }

  // ========== Linked References Methods ==========

  // Search references for linking
  searchReferencesForLinking(criteria: any): Observable<any> {
    return this.http.post(`${API_ENDPOINTS.linkedReferences}/search`, criteria);
  }

  // Link two references
  linkReferences(request: any): Observable<any> {
    return this.http.post(`${API_ENDPOINTS.linkedReferences}/link`, request);
  }

  // Get linked references
  getLinkedReferences(referenceId: number): Observable<any> {
    return this.http.get(`${API_ENDPOINTS.linkedReferences}/${referenceId}`);
  }

  // Delink references
  delinkReferences(linkId: number): Observable<any> {
    return this.http.delete(`${API_ENDPOINTS.linkedReferences}/${linkId}`);
  }

  // ========== Knowledge Base Methods ==========

  // Search knowledge base with criteria
  searchKnowledgeBase(criteria: any): Observable<VipReference[]> {
    return this.http.post<VipReference[]>(`${API_ENDPOINTS.reference}/knowledge-base/search`, criteria);
  }

  // ========== Document Types Methods ==========

  // Get all active document types
  getActiveDocumentTypes(): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.documentTypes}/active`);
  }

  // Get all document types
  getAllDocumentTypes(): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.documentTypes}`);
  }

  // ========== Draft References Methods ==========

  // Get draft references for a user
  getDraftReferences(loginId: string): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.reference}/drafts/${loginId}`);
  }
}
