import { UserService } from './../user.service';
import { Inject, Component, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import * as firebase from 'firebase/app';
import * as firebaseui from 'firebaseui';
import 'firebase/firestore';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {

  constructor(
    private router: Router,
    private user: UserService,
    private afAuth: AngularFireAuth,
    @Inject(DOCUMENT) private document: Document) {}

  ngOnInit() {
    const firebaseUiAuthConfig = {
      signInFlow: 'popup',
      signInSuccessUrl: 'user',
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        {
          requireDisplayName: false,
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID
        }
      ],
      tosUrl: 'terms-of-services',
      privacyPolicyUrl: 'privacy-policy',
      credentialHelper: firebaseui.auth.CredentialHelper.NONE
    };
    this.user.ui.start(this.document.getElementById('firebaseuiAuthContainer'), firebaseUiAuthConfig);
    this.afAuth.authState.subscribe(user => {
      if (user != null) {
        this.router.navigateByUrl('/user');
      }
    });
  }

}
