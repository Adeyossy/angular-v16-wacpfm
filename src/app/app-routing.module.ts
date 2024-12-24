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
import { EditExaminerComponent } from './exam/edit-examiner/edit-examiner.component';
import { EditExamComponent } from './exam/edit-exam/edit-exam.component';
import { EditCandidateComponent } from './exam/edit-candidate/edit-candidate.component';
import { EditFellowshipComponent } from './exam/edit-candidate/edit-fellowship/edit-fellowship.component';
import { EditMembershipComponent } from './exam/edit-candidate/edit-membership/edit-membership.component';
import { DashboardHomeComponent } from './dashboard/dashboard-home/dashboard-home.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { PreviousCoursesComponent } from './update-course/previous-courses/previous-courses.component';

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
      { path: "home", component: DashboardHomeComponent },
      { path: "updatecourse", component: UpdateCourseComponent },
      { path: "updatecourse/new", component: NewCourseComponent },
      { path: "updatecourse/previous", component: PreviousCoursesComponent },
      { path: "updatecourse/:updateCourseId/details", component: UpdateCourseDetailsComponent },
      { path: "updatecourse/previous/:updateCourseId/details", component: UpdateCourseDetailsComponent },
      { path: "updatecourse/:updateCourseId/details/payment/:category", component: UpdateCoursePaymentComponent },
      { path: "updatecourse/:updateCourseId/details/edit", component: NewCourseComponent },
      { path: "updatecourse/:updateCourseId/resourcepersons", component: ResourcePersonsDashComponent },
      { path: "updatecourse/:updateCourseId/details/certificate/:recordId", component: CertificateComponent },
      { path: "admin", component: AdminComponent, canActivate: [adminGuard] },
      { path: "exam", component: ExamComponent, title: "Examination | Faculty of Family Medicine App" },
      { path: "exam/:examAlias/edit", component: EditExamComponent, title: "Edit Exam Details | FM App" },
      { path: "exam/:examAlias/examiner/:examinerId/edit", component: EditExaminerComponent, title: "Examiner Profile" },
      { path: "exam/:examAlias/candidate/:category/:candidateId/edit", component: EditCandidateComponent, title: "Edit Candidate Profile" },
      { path: "exam/:examAlias/candidate/membership/:candidateId/edit/upload", component: EditMembershipComponent, title: "Edit Fellowship Details" },
      { path: "exam/:examAlias/candidate/fellowship/:candidateId/edit/upload", component: EditFellowshipComponent, title: "Edit Fellowship Details" },
      { path: "exam/:examAlias/candidate/:category/:candidateId/home", component: ExamComponent },
      {
        path: "**", component: NotFoundComponent, title: "Not found | Faculty of Family Medicine App"
      }
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
