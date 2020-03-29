import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import 'firebase/storage';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'resumy';
  public loggedIn = false;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    public route: ActivatedRoute) {
  }

  go_to_user() {
    this.router.navigate(['user']);
  }

  logout() {
    this.afAuth.signOut();
    this.router.navigate(['signin']);
  }
}
