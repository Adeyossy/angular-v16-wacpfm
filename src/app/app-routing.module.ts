import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

const routes: Routes = [
  { path: "", component: HomeComponent, title:"Faculty of Family Medicine App, West African College of Physicians" },
  { path: "access/register", component: RegisterComponent },
  { path: "access/register/verifyemail", component: VerifyEmailComponent },
  { path: "access/login", component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
