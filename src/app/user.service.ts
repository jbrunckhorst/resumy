import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import * as firebaseui from 'firebaseui';
import 'firebase/firestore';

@Injectable()
export class UserService {
    private user: firebase.User;
    private userData: any;
    public ui: firebaseui.auth.AuthUI;

    constructor(
        private afAuth: AngularFireAuth,
        private db: AngularFirestore
    ) {
        this.ui = new firebaseui.auth.AuthUI(firebase.auth());
    }

    public getUID(): string {
        return this.user.uid;
    }

    public getData(): any {
        return this.userData;
    }

    public getImageURL(): string {
        return this.userData.photo;
    }

    public getResumes(): string[] {
        return this.userData.resumes;
    }

    public getReferences(): any {
        return this.userData.references;
    }

    load() {
        return new Promise((resolve, reject) => {
            this.afAuth.authState.subscribe(user => {
                if (user != null) {
                    this.user = user;
                    this.db.firestore.collection('users').doc(user.uid).get().then((snapshot) => {
                        if (!snapshot.exists) {
                            this.userData = {
                                name: '',
                                email: '',
                                phone: '',
                                adress: '',
                                photo: 'profile.png',
                                references: [],
                                resumes: [],
                                languages: []
                            };
                            snapshot.ref.set(this.userData);
                        }
                        this.db.collection('users').doc(user.uid).valueChanges().subscribe(data => {
                            this.userData = data;
                            resolve(true);
                        });
                    });
                } else {
                    console.log('User not logged in');
                    resolve(true);
                }
            });
        });
    }

}
