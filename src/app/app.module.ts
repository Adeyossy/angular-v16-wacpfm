import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { LoginComponent } from './login/login.component';
import { FormsModule } from '@angular/forms';
import { OverlayComponent } from './overlay/overlay.component';
import { HttpClientModule } from '@angular/common/http';
import { AccessComponent } from './access/access.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NavComponent } from './nav/nav.component';
import { RegistrationComponent } from './registration/registration.component';
import { SelectComponent } from './widgets/select/select.component';
import { LeftbarComponent } from './widgets/leftbar/leftbar.component';
import { UpdateCourseComponent } from './update-course/update-course.component';
import { NewCourseComponent } from './update-course/new-course/new-course.component';
import { UpdateCourseDetailsComponent } from './update-course/update-course-details/update-course-details.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RegisterComponent,
    VerifyEmailComponent,
    LoginComponent,
    OverlayComponent,
    AccessComponent,
    DashboardComponent,
    NavComponent,
    RegistrationComponent,
    SelectComponent,
    LeftbarComponent,
    UpdateCourseComponent,
    NewCourseComponent,
    UpdateCourseDetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
