import { Component, ElementRef, Input, ViewChild } from '@angular/core';

interface FilePlus extends File {
  blobURL: string;
  cloudURL: string;
  title: string;
}

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
  @Input() formats: string = "";
  @ViewChild('file') uploadFile: ElementRef = new ElementRef('input');
  files: FilePlus[] = [];

  onFileChosen() {
    const fileElement = this.uploadFile.nativeElement as HTMLInputElement;
    if (fileElement.files && fileElement.files.length) {
      const file = fileElement.files[0];
      const filePlus: FilePlus = {
        ...file, 
        blobURL: URL.createObjectURL(file), 
        cloudURL: "",
        title: ""
      };
      this.files.unshift(filePlus);
    }
  }
}
