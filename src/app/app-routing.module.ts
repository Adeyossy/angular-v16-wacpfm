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

const routes: Routes = [
  { path: "", component: HomeComponent, title: "Faculty of Family Medicine App, West African College of Physicians" },
  {
    path: "access", component: AccessComponent, title: "Gain Access | Faculty of Family Medicine App",
    children: [
      { path: "register", component: RegisterComponent },
      { path: "register/verifyemail", component: VerifyEmailComponent },
      { path: "login", component: LoginComponent }
    ]
  },
  {
    path: "dashboard", component: DashboardComponent, title: "Dashboard | Faculty of Family Medicine App",
    children: [
      { path: "updatecourse", component: UpdateCourseComponent },
      { path: "updatecourse/new", component: NewCourseComponent },
      { path: "updatecourse/:courseId/details", component: UpdateCourseDetailsComponent },
      { path: "updatecourse/:courseId/details/edit", component: NewCourseComponent }
    ]
  },
  {
    path: "profile/registration", component: RegistrationComponent,
    title: "Update Your Profile | Faculty of Family Medicine App"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
