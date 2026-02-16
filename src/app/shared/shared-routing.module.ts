import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DesktopComponent } from './pages/desktop/desktop.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { InitiatorFormComponent } from './pages/initiator-form/initiator-form.component';
import { AdminPanelDashboardComponent } from './pages/admin/admin-panel-dashboard/admin-panel-dashboard.component';
import { AdminLayoutComponent } from './pages/admin/admin-layout/admin-layout.component';
import { MasterDataEntryComponent } from './pages/admin/master-data-entry/master-data-entry.component';
import { MasterReportsComponent } from './pages/admin/master-reports/master-reports.component';
import { SettingsComponent } from './pages/admin/settings/settings.component';
import { OrganizationMasterFormComponent } from './pages/admin/organization-master-form/organization-master-form.component';
import { OfficesMasterFormComponent } from './pages/admin/offices-master-form/offices-master-form.component';
import { OfficeTypeMasterFormComponent } from './pages/admin/office-type-master-form/office-type-master-form.component';
import { authGuard } from './authguard/auth.guard';
import { CategoryMasterComponent } from './pages/admin/category-master/category-master.component';
import { SubCategoryMasterComponent } from './pages/admin/sub-category-master/sub-category-master.component';
import { UserDesignationMasterComponent } from './pages/admin/user-designation-master/user-designation-master.component';
import { RoleMasterComponent } from './pages/admin/role-master/role-master.component';
import { UserMasterComponent } from './pages/admin/user-master/user-master.component';
import { VipInitiatorComponent } from './pages/vip-initiator/vip-initiator.component';
import { VipAssignerComponent } from './pages/vip-assigner/vip-assigner.component';
import { VipAssigneeComponent } from './pages/vip-assignee/vip-assignee.component';
import { VipFinalReplyComponent } from './pages/vip-final-reply/vip-final-reply.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ClosedReferencesComponent } from './pages/closed-references/closed-references.component';
import { DiscardReferencesComponent } from './pages/discard-references/discard-references.component';

const routes: Routes = [
  {
    path: "",
    component: HomeComponent
  },
  {
    path: "login",
    canActivate: [authGuard],
    component: LoginComponent
  },
  {
    path: "forget-password",
    canActivate: [authGuard],
    component: ForgotPasswordComponent
  },
  {
    path: "dashboard",
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'desktop', component: DesktopComponent },
      { path: 'add-reference', component: InitiatorFormComponent },
      { path: 'add-reference/:referenceNo', component: InitiatorFormComponent },
      {path:'vip-initiator', component:VipInitiatorComponent},
      {path:'vip-assigner', component:VipAssignerComponent},
      {path:'vip-assignee', component:VipAssigneeComponent},
      {path:'vip-final-reply',component:VipFinalReplyComponent},
      {path:'vip-closed-references',component:ClosedReferencesComponent},
      {path:'vip-discard-references',component:DiscardReferencesComponent}
    ]
  },
  {
    path: "administrator",
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: AdminPanelDashboardComponent },
      { path: 'master-data',
         children: [
          { path: '', redirectTo: 'organization', pathMatch: 'full' },
          { path: 'organization', component: OrganizationMasterFormComponent },
          { path: 'offices', component: OfficesMasterFormComponent },
          { path: 'office-type', component: OfficeTypeMasterFormComponent },
          { path: 'designation', component: UserDesignationMasterComponent },
          { path: 'category', component: CategoryMasterComponent },
          { path: 'sub-category', component: SubCategoryMasterComponent },
          { path: 'role', component: RoleMasterComponent },
          { path:'manage-user', component:UserMasterComponent }
        ],
      },
      { path: 'master-report', component: MasterReportsComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SharedRoutingModule { }
