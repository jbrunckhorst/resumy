import { PrivacPolicyComponent } from './privac-policy/privac-policy.component';
import { TermsOfServicesComponent } from './terms-of-services/terms-of-services.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SigninComponent } from './signin/signin.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ResumeComponent } from './resume/resume.component';


const routes: Routes = [
  { path: '', redirectTo: 'signin', pathMatch: 'full' },
  { path: 'terms-of-services', component: TermsOfServicesComponent },
  { path: 'privacy-policy', component: PrivacPolicyComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'user', component: UserProfileComponent },
  { path: 'resume/:rid', component: ResumeComponent },

  { path: '**', component: NotFoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
