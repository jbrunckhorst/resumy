import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { MaterialModule } from './material-module';
import { ImageCropperModule } from 'ngx-image-cropper';
import { AgmCoreModule } from '@agm/core';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { UserProfileComponent, DialogAddResumeDialog } from './user-profile/user-profile.component';
import { SigninComponent } from './signin/signin.component';
import { ExperienceComponent } from './experience/experience.component';
import { BulletBoxDirective } from './bullet-box.directive';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { HttpClientModule } from '@angular/common/http';
import { NotFoundComponent } from './not-found/not-found.component';
import { ResumeComponent, DialogAddSectionDialog, DialogEditSectionDialog } from './resume/resume.component';
import { UserService } from './user.service';
import { TermsOfServicesComponent } from './terms-of-services/terms-of-services.component';
import { PrivacPolicyComponent } from './privac-policy/privac-policy.component';

const config = {
  apiKey: 'xxxxxxxxxxxxxxxxxxxxxxxx',
  authDomain: 'xxxxxxxxxxxxxxxxxxxxxxxx',
  databaseURL: 'xxxxxxxxxxxxxxxxxxxxxxxx',
  projectId: 'xxxxxxxxxxxxxxxxxxxxxxxx',
  storageBucket: 'xxxxxxxxxxxxxxxxxxxxxxxx',
  messagingSenderId: 'xxxxxxxxxxxxxxxxxxxxxxxx',
  appId: 'xxxxxxxxxxxxxxxxxxxxxxxx',
  measurementId: 'xxxxxxxxxxxxxxxxxxxxxxxx'
};

const agmConfig = {
  apiKey: 'xxxxxxxxxxxxxxxxxxxxxxxx',
  libraries: ['places']
};

export function userProfileFactory(provider: UserService) {
  return () => provider.load();
}

@NgModule({
  declarations: [
    AppComponent,
    UserProfileComponent,
    SigninComponent,
    ExperienceComponent,
    ResumeComponent,
    DialogAddResumeDialog,
    DialogAddSectionDialog,
    DialogEditSectionDialog,
    BulletBoxDirective,
    ImageUploadComponent,
    NotFoundComponent,
    TermsOfServicesComponent,
    PrivacPolicyComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(config),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    HttpClientModule,
    MaterialModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    ImageCropperModule,
    AgmCoreModule.forRoot(agmConfig),
    MatGoogleMapsAutocompleteModule,
    FontAwesomeModule
  ],
  providers: [
    UserService,
    { provide: APP_INITIALIZER, useFactory: userProfileFactory, deps: [UserService], multi: true }
  ],
  bootstrap: [AppComponent],
  entryComponents: [DialogAddResumeDialog, DialogAddSectionDialog, DialogEditSectionDialog, ExperienceComponent, ImageUploadComponent]
})
export class AppModule { }


