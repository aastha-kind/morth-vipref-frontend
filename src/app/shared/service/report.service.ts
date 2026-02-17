import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../utilities/api_endpoints';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private http: HttpClient) { }

  // VIP Customize Report
  getVipCustomizeReport(filters: any): Observable<any> {
    let params = new HttpParams();
    if (filters.category) params = params.set('category', filters.category);
    if (filters.state) params = params.set('state', filters.state);
    if (filters.designation) params = params.set('designation', filters.designation);
    if (filters.priority) params = params.set('priority', filters.priority);
    if (filters.requestNumber) params = params.set('requestNumber', filters.requestNumber);
    if (filters.subCategory) params = params.set('subCategory', filters.subCategory);
    if (filters.dignitaryName) params = params.set('dignitaryName', filters.dignitaryName);
    if (filters.receivingFromDate) params = params.set('receivingFromDate', filters.receivingFromDate);
    if (filters.receivingToDate) params = params.set('receivingToDate', filters.receivingToDate);
    if (filters.subject) params = params.set('subject', filters.subject);

    return this.http.get<any>(`${API_ENDPOINTS.reports}/vip-customize/by-user`, { params });
  }

  // VIP Pendency Report
  getVipPendencyReport(filters: any): Observable<any> {
    let params = new HttpParams();
    if (filters.pendencyType) params = params.set('pendencyType', filters.pendencyType);

    return this.http.get<any>(`${API_ENDPOINTS.reports}/vip-pendency/by-user`, { params });
  }

  // MIS Report
  getMISReport(): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.reports}/mis/by-user`);
  }

  // NHAI MIS Report
  getNHAIMISReport(): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.reports}/mis/nhai/by-user`);
  }

  // NHIDCL MIS Report
  getNHIDCLMISReport(): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.reports}/mis/nhidcl/by-user`);
  }

  // State-Org Report
  getStateOrgReport(filters: any): Observable<any> {
    let params = new HttpParams();
    if (filters.organisation) params = params.set('organisation', filters.organisation);
    if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
    if (filters.toDate) params = params.set('toDate', filters.toDate);

    return this.http.get<any>(`${API_ENDPOINTS.reports}/state-org/by-user`, { params });
  }

  // Officer-Wise Report
  getOfficerWiseReport(filters: any): Observable<any> {
    let params = new HttpParams();
    if (filters.organisation) params = params.set('organisation', filters.organisation);

    return this.http.get<any>(`${API_ENDPOINTS.reports}/officer-wise/by-user`, { params });
  }

  // User Login Report
  getUserLoginReport(): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.reports}/user-login/by-user`);
  }

  // Get Reference Detail
  getReferenceDetail(referenceNo: string): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.reports}/reference-detail/${referenceNo}`);
  }
}
