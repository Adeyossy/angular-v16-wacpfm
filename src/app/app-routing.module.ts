import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { AccessComponent } from './access/access.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RegistrationComponent } from './registration/registration.component';
import { UpdateCourseComponent } from './update-course/update-course.component';
import { NewCourseComponent } from './update-course/new-course/new-course.component';
import { UpdateCourseDetailsComponent } from './update-course/update-course-details/update-course-details.component';
import { UpdateCoursePaymentComponent } from './update-course/update-course-payment/update-course-payment.component';
import { accessGuard } from './access.guard';
import { profileGuard } from './profile.guard';
import { emailGuard } from './email.guard';
import { CertificateComponent } from './certificate/certificate.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AdminComponent } from './admin/admin.component';
import { adminGuard } from './admin/admin.guard';
import { ResourcePersonsDashComponent } from './dashboard/resource-persons-dash/resource-persons-dash.component';
import { ExamComponent } from './exam/exam.component';
import { ExaminerRegistrationComponent } from './exam/examiner-registration/examiner-registration.component';

const routes: Routes = [
  { path: "", component: HomeComponent, title: "Faculty of Family Medicine App, West African College of Physicians" },
  {
    path: "access", component: AccessComponent, title: "Gain Access | Faculty of Family Medicine App",
    children: [
      { path: "register", component: RegisterComponent },
      { path: "register/verifyemail", component: VerifyEmailComponent, canActivate: [accessGuard] },
      { path: "login", component: LoginComponent },
      { path: "login/reset-password", component: ResetPasswordComponent }
    ]
  },
  {
    path: "dashboard", component: DashboardComponent, title: "Dashboard | Faculty of Family Medicine App",
    canActivate: [profileGuard], canActivateChild: [profileGuard],
    children: [
      { path: "updatecourse", component: UpdateCourseComponent },
      { path: "updatecourse/new", component: NewCourseComponent },
      { path: "updatecourse/:updateCourseId/details", component: UpdateCourseDetailsComponent },
      { path: "updatecourse/:updateCourseId/details/payment/:category", component: UpdateCoursePaymentComponent },
      { path: "updatecourse/:updateCourseId/details/edit", component: NewCourseComponent },
      { path: "updatecourse/:updateCourseId/resourcepersons", component: ResourcePersonsDashComponent },
      { path: "updatecourse/:updateCourseId/details/certificate/:recordId", component: CertificateComponent },
      { path: "admin", component: AdminComponent, canActivate: [adminGuard] },
      { path: "exam", component: ExamComponent, title: "Examination | Faculty of Family Medicine App" },
      { path: "exam/profile", component: ExaminerRegistrationComponent, title: "Examiner Profile" }
    ]
  },
  {
    path: "profile/registration", component: RegistrationComponent,
    title: "Update Your Profile | Faculty of Family Medicine App", canActivate: [emailGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
