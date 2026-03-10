import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../utilities/api_endpoints';
import { Observable } from 'rxjs';
import { User } from '../interface/user.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  getOrganizationMaster(): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.referencemaster}/organization`)
  }

  addOrganization(organizationData: any): Observable<any> {
    return this.http.post<any>(`${API_ENDPOINTS.referencemaster}/organization`, organizationData)
  }

  updateOrganization(organizationId: number, organizationData: any): Observable<any> {
    return this.http.put<any>(`${API_ENDPOINTS.referencemaster}/organization/${organizationId}`, organizationData)
  }

  deleteOrganization(organizationId: number): Observable<any> {
    return this.http.delete<any>(`${API_ENDPOINTS.referencemaster}/organization/${organizationId}`);
  }


  getOfficeMaster(): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.referencemaster}/office`)
  }

  addOffice(officeData: any): Observable<any> {
    return this.http.post<any>(`${API_ENDPOINTS.referencemaster}/office`, officeData);
  }

  updateOffice(officeId: number, officeData: any): Observable<any> {
    return this.http.put<any>(`${API_ENDPOINTS.referencemaster}/office/${officeId}`, officeData)
  }

  deleteOffice(officeId: number): Observable<any> {
    return this.http.delete<any>(`${API_ENDPOINTS.referencemaster}/office/${officeId}`);
  }

  getOfficeTypeMaster() {
    return this.http.get<any[]>(`${API_ENDPOINTS.referencemaster}/officetype`);
  }

  addOfficeType(data: any) {
    return this.http.post(`${API_ENDPOINTS.referencemaster}/officetype`, data);
  }

  updateOfficeType(id: number, data: any) {
    return this.http.put(`${API_ENDPOINTS.referencemaster}/officetype/${id}`, data);
  }

  deleteOfficeType(id: number) {
    return this.http.delete(`${API_ENDPOINTS.referencemaster}/officetype/${id}`);
  }

  getCategoryMaster(): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.referencemaster}/category`);
  }

  addCategory(categoryData: any): Observable<any> {
    return this.http.post<any>(`${API_ENDPOINTS.referencemaster}/category`, categoryData);
  }

  updateCategory(categoryId: number, categoryData: any): Observable<any> {
    return this.http.put<any>(`${API_ENDPOINTS.referencemaster}/category/${categoryId}`, categoryData)
  }

  deleteCategory(categoryId: number): Observable<any> {
    return this.http.delete<any>(`${API_ENDPOINTS.referencemaster}/category/${categoryId}`);
  }

  getSubCategoryMaster(): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.referencemaster}/sub-category`);
  }

  addSubCategory(categoryData: any): Observable<any> {
    return this.http.post<any>(`${API_ENDPOINTS.referencemaster}/sub-category`, categoryData);
  }

  updateSubCategory(categoryId: number, categoryData: any): Observable<any> {
    return this.http.put<any>(`${API_ENDPOINTS.referencemaster}/sub-category/${categoryId}`, categoryData)
  }

  deleteSubCategory(categoryId: number): Observable<any> {
    return this.http.delete<any>(`${API_ENDPOINTS.referencemaster}/sub-category/${categoryId}`);
  }

  // New API methods for category and subcategory dropdowns
  getAllCategories(): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.categories}`);
  }

  getSubCategoriesByCategoryId(categoryId: number): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.subcategories}/category/${categoryId}`);
  }


  // 🔹 Get all user designations
  getUserDesignations() {
    return this.http.get(`${API_ENDPOINTS.referencemaster}/user-designation`);
  }

  // 🔹 Add new user designation
  addUserDesignation(data: any) {
    return this.http.post(`${API_ENDPOINTS.referencemaster}/user-designation`, data);
  }

  // 🔹 Update user designation
  updateUserDesignation(id: number, data: any) {
    return this.http.put(`${API_ENDPOINTS.referencemaster}/user-designation/${id}`, data);
  }

  // 🔹 Delete user designation
  deleteUserDesignation(id: number) {
    return this.http.delete(`${API_ENDPOINTS.referencemaster}/user-designation/${id}`);
  }

  getRoleMaster(): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.referencemaster}/user-roles`);
  }

  addRole(newRoleData: any): Observable<any> {
    return this.http.post<any>(`${API_ENDPOINTS.referencemaster}/user-roles`, newRoleData);
  }

  updateRole(roleId: number, newRoleData: any): Observable<any> {
    return this.http.put<any>(`${API_ENDPOINTS.referencemaster}/user-roles/${roleId}`, newRoleData);
  }

  deleteRole(roleId: number): Observable<any> {
    return this.http.delete<any>(`${API_ENDPOINTS.referencemaster}/user-roles/${roleId}`);
  }

  getAllUsers(page: number = 0, size: number = 10, search: string = ''): Observable<any> {
    let params = `?page=${page}&size=${size}`;
    if (search && search.trim()) {
      params += `&search=${encodeURIComponent(search)}`;
    }
    return this.http.get<any>(`${API_ENDPOINTS.users}${params}`);
  }

  addUser(user: User): Observable<any> {
    return this.http.put(`${API_ENDPOINTS.users}/0/create`, user);
  }

  updateUser(id: number, user: User): Observable<any> {
    return this.http.put(`${API_ENDPOINTS.users}/${id}/update`, user);
  }


  getUserListByRoleId(roleId:string){
    return this.http.get(`${API_ENDPOINTS.userMgmt}/user-list/${roleId}`);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${API_ENDPOINTS.users}/${id}`);
  }

  changePassword(userId: number, newPassword: string): Observable<any> {
    return this.http.put(`${API_ENDPOINTS.users}/${userId}/change-password`, { newPassword });
  }

  toggleUserLock(userId: number, lockStatus: boolean): Observable<any> {
    return this.http.put(`${API_ENDPOINTS.users}/${userId}/lock`, { lockStatus });
  }

  // Admin Dashboard Stats
  getAdminDashboardStats(): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.reference}/admin-dashboard-stats`);
  }
}
