import { NgModule, isDevMode } from '@angular/core';
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
import { LoadingUiComponent } from './widgets/loading-ui/loading-ui.component';
import { LoadingCirclesComponent } from './widgets/loading-circles/loading-circles.component';
import { UpdateCoursePaymentComponent } from './update-course/update-course-payment/update-course-payment.component';
import { CertificateComponent } from './certificate/certificate.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { InputComponent } from './widgets/input/input.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AdminComponent } from './admin/admin.component';
import { CardListComponent } from './widgets/card-list/card-list.component';
import { ComponentOverlayComponent } from './component-overlay/component-overlay.component';
import { UpdateCourseLectureComponent } from './update-course/update-course-lecture/update-course-lecture.component';
import { ResourcePersonComponent } from './update-course/resource-person/resource-person.component';
import { PaymentViewerComponent } from './widgets/payment-viewer/payment-viewer.component';
import { CourseTypeComponent } from './widgets/course-type/course-type.component';
import { ResourcePersonsDashComponent } from './dashboard/resource-persons-dash/resource-persons-dash.component';
import { ExamComponent } from './exam/exam.component';
import { EditExaminerComponent } from './exam/edit-examiner/edit-examiner.component';
import { EditExamComponent } from './exam/edit-exam/edit-exam.component';
import { EditCandidateComponent } from './exam/edit-candidate/edit-candidate.component';
import { FileUploadComponent } from './widgets/file-upload/file-upload.component';

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
    UpdateCourseDetailsComponent,
    LoadingUiComponent,
    LoadingCirclesComponent,
    UpdateCoursePaymentComponent,
    CertificateComponent,
    ResetPasswordComponent,
    InputComponent,
    AdminComponent,
    CardListComponent,
    ComponentOverlayComponent,
    UpdateCourseLectureComponent,
    ResourcePersonComponent,
    PaymentViewerComponent,
    CourseTypeComponent,
    ResourcePersonsDashComponent,
    ExamComponent,
    EditExaminerComponent,
    EditExamComponent,
    EditCandidateComponent,
    FileUploadComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
