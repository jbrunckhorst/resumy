import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { ImageTransform, ImageCroppedEvent, Dimensions, base64ToFile, ImageCropperComponent } from 'ngx-image-cropper';
import { MatSliderChange } from '@angular/material/slider';
import { AngularFireUploadTask, AngularFireStorage } from '@angular/fire/storage';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/firestore';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit {
  task: AngularFireUploadTask;
  imageChangedEvent: any;
  initialImage: string;
  croppedImage: any = '';
  transform: ImageTransform = {};
  scale = 1;

  constructor(
    public dialogRef: MatDialogRef<ImageUploadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {uid: string, url: string},
    private storage: AngularFireStorage,
    private db: AngularFirestore) {
      this.getBase64ImageFromUrl(this.data.url).then((result: string) => {
        this.initialImage = result;
      });
    }

  ngOnInit() {
  }

  async getBase64ImageFromUrl(imageUrl) {
    const res = await fetch(imageUrl);
    const blob = await res.blob();

    return new Promise((resolve, reject) => {
      const reader  = new FileReader();
      reader.addEventListener('load', () => {
          resolve(reader.result);
      }, false);

      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(blob);
    });
  }

onNoClick(): void {
    this.dialogRef.close();
  }

onSaveClick() {
    // Unique storage path --> easiest method
    const uniqueID = `test/${new Date().getTime()}`;

    this.task = this.storage.upload(uniqueID, base64ToFile(this.croppedImage));
    this.task.snapshotChanges().pipe(
      tap(snap => {
        if (snap.bytesTransferred === snap.totalBytes) {
          console.log('success');
          this.db.collection('users').doc(this.data.uid).update({
            photo: uniqueID
          });
          this.dialogRef.close(uniqueID);
        }
      })
    ).subscribe();
  }

uploadFile(event) {
    const file = event.target.files[0];

    if (file.type.split('/')[0] !== 'image') {
      console.error('unsupported file type :(');
      return;
    } else {
      this.imageChangedEvent = event;
    }
  }

imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }
imageLoaded() {
    console.log('Image loaded');
  }
cropperReady(sourceImageDimensions: Dimensions) {
    console.log('Cropper ready', sourceImageDimensions);
  }
loadImageFailed() {
    console.log('Load failed');
  }
zoom(event: MatSliderChange) {
    this.transform = {
      ...this.transform,
      scale: event.value
    };
  }

}
