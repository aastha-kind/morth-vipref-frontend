import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DesktopComponent } from './pages/desktop/desktop.component';
import { MaterialModule } from '../material.module';
import { HeaderComponent } from './pages/header/header.component';
import { LayoutComponent } from './pages/layout/layout.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './pages/home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { VipInitiatorComponent } from './pages/vip-initiator/vip-initiator.component';
import { VipAssignerComponent } from './pages/vip-assigner/vip-assigner.component';
import { VipAssigneeComponent } from './pages/vip-assignee/vip-assignee.component';
import { VipFinalReplyComponent } from './pages/vip-final-reply/vip-final-reply.component';
import { InitiatorFormComponent } from './pages/initiator-form/initiator-form.component';
import { UploadInitiatorDocsComponent } from './pages/upload-initiator-docs/upload-initiator-docs.component';
import { ViewReferenceComponent } from './pages/view-reference/view-reference.component';
import { NgxUiLoaderModule } from "ngx-ui-loader";
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';

import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { ReplyEditorComponent } from './pages/reply-editor/reply-editor.component';
import { UploadReplyComponent } from './pages/upload-reply/upload-reply.component';
import { NavbarComponent } from './pages/navbar/navbar.component';
import { FooterComponent } from './pages/footer/footer.component';
import { AdminPanelDashboardComponent } from './pages/admin/admin-panel-dashboard/admin-panel-dashboard.component';
import { AdminPanelHeaderComponent } from './pages/admin/admin-panel-header/admin-panel-header.component';
import { AdminPanelFooterComponent } from './pages/admin/admin-panel-footer/admin-panel-footer.component';
import { AdminPanelSidebarComponent } from './pages/admin/admin-panel-sidebar/admin-panel-sidebar.component';
import { NgChartsModule } from 'ng2-charts';
import { RecaptchaModule } from 'ng-recaptcha';
import { AdminLayoutComponent } from './pages/admin/admin-layout/admin-layout.component';
import { MasterDataEntryComponent } from './pages/admin/master-data-entry/master-data-entry.component';
import { MasterReportsComponent } from './pages/admin/master-reports/master-reports.component';
import { SettingsComponent } from './pages/admin/settings/settings.component';
import { OrganizationMasterFormComponent } from './pages/admin/organization-master-form/organization-master-form.component';
import { OfficesMasterFormComponent } from './pages/admin/offices-master-form/offices-master-form.component';
import { OfficeTypeMasterFormComponent } from './pages/admin/office-type-master-form/office-type-master-form.component';
import { OrganizationMasterDialogComponent } from './pages/admin/organization-master-form/organization-master-dialog/organization-master-dialog.component';
import { OfficesMasterDialogComponent } from './pages/admin/offices-master-form/offices-master-dialog/offices-master-dialog.component';
import { OfficeTypeMasterDialogComponent } from './pages/admin/office-type-master-form/office-type-master-dialog/office-type-master-dialog.component';
import { CategoryMasterComponent } from './pages/admin/category-master/category-master.component';
import { CategoryMasterDialogComponent } from './pages/admin/category-master/category-master-dialog/category-master-dialog.component';
import { SubCategoryMasterComponent } from './pages/admin/sub-category-master/sub-category-master.component';
import { SubCategoryMasterDialogComponent } from './pages/admin/sub-category-master/sub-category-master-dialog/sub-category-master-dialog.component';
import { UserDesignationMasterComponent } from './pages/admin/user-designation-master/user-designation-master.component';
import { UserDesignationMasterDialogComponent } from './pages/admin/user-designation-master/user-designation-master-dialog/user-designation-master-dialog.component';
import { RoleMasterComponent } from './pages/admin/role-master/role-master.component';
import { RoleMasterDialogComponent } from './pages/admin/role-master/role-master-dialog/role-master-dialog.component';
import { UserMasterComponent } from './pages/admin/user-master/user-master.component';
import { UserMasterDialogComponent } from './pages/admin/user-master/user-master-dialog/user-master-dialog.component';
import { ChangePasswordDialogComponent } from './pages/admin/user-master/change-password-dialog/change-password-dialog.component';
import { SideNavComponent } from './pages/side-nav/side-nav.component';
import { ViewEditorComponent } from './pages/view-editor/view-editor.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ClosedReferencesComponent } from './pages/closed-references/closed-references.component';
import { DiscardReferencesComponent } from './pages/discard-references/discard-references.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { UserReportsComponent } from './pages/user-reports/user-reports.component';

@NgModule({
  declarations: [
    LoginComponent,
    DashboardComponent,
    DesktopComponent,
    HeaderComponent,
    LayoutComponent,
    HomeComponent,
    VipInitiatorComponent,
    VipAssignerComponent,
    VipAssigneeComponent,
    VipFinalReplyComponent,
    InitiatorFormComponent,
    UploadInitiatorDocsComponent,
    ViewReferenceComponent,
    ReplyEditorComponent,
    UploadReplyComponent,
    NavbarComponent,
    FooterComponent,
    AdminPanelDashboardComponent,
    AdminPanelHeaderComponent,
    AdminPanelFooterComponent,
    AdminPanelSidebarComponent,
    AdminLayoutComponent,
    MasterDataEntryComponent,
    MasterReportsComponent,
    SettingsComponent,
    OrganizationMasterFormComponent,
    OfficesMasterFormComponent,
    OfficeTypeMasterFormComponent,
    OrganizationMasterDialogComponent,
    OfficesMasterDialogComponent,
    OfficeTypeMasterDialogComponent,
    CategoryMasterComponent,
    CategoryMasterDialogComponent,
    SubCategoryMasterComponent,
    SubCategoryMasterDialogComponent,
    UserDesignationMasterComponent,
    UserDesignationMasterDialogComponent,
    RoleMasterComponent,
    RoleMasterDialogComponent,
    UserMasterComponent,
    UserMasterDialogComponent,
    ChangePasswordDialogComponent,
    SideNavComponent,
    ViewEditorComponent,
    ForgotPasswordComponent,
    ClosedReferencesComponent,
    DiscardReferencesComponent,
    UserProfileComponent,
    UserReportsComponent,
  ],
  imports: [
    CommonModule,
    SharedRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    HttpClientModule,
    NgxUiLoaderModule,
    NgxExtendedPdfViewerModule,
    EditorModule,
    NgChartsModule,
    RecaptchaModule
  ],
  providers: [
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' }
  ]
})
export class SharedModule { }
