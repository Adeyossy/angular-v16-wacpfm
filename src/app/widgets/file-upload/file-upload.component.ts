import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { map, NEVER, Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

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
  @Input() formats = "";
  @Input() path = "";
  @ViewChild('file') uploadFile: ElementRef = new ElementRef('input');
  @Input() files: FilePlus[] = [];
  @Output() fileEmitter = new EventEmitter<FilePlus>();
  @Output() linkEmitter = new EventEmitter<string>();
  uploadState$: Observable<number> = NEVER;

  constructor(private authService: AuthService) {}

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
      this.fileEmitter.emit(filePlus);
    }
  }

  upload(file: FilePlus) {
    this.uploadState$ = this.authService.uploadFileResumably$(file, `${this.path}/${file.name}`)
    .pipe(
        map(output => {
          if (isNaN(parseFloat(output))) {
            console.log("url? => ", output);
            this.linkEmitter.emit(output);
            return 100;
          } else {
            const percent = parseFloat(output);
            // const div = this.materialIndicator.nativeElement as HTMLDivElement;
            // setInterval(() => {
            //   const totalWidth = div.parentElement!.style.width;
            //   console.log("totalWidth => ", totalWidth);
            //   const computed = percent * parseInt(totalWidth);
            // }, 17);
            // div.style.width = `${output}%`;
            return percent * 100;
          }
        })
      )
  }
}
