import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { map, NEVER, Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

interface FilePlus extends File {
  blobURL: string;
  cloudURL: string;
}

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {
  @Input() formats = "";
  @Input() path = "test";
  @ViewChild('file') uploadFile: ElementRef = new ElementRef('input');
  @ViewChildren('file') uploadFiles!: QueryList<ElementRef>;
  @ViewChildren('animate') animators!: QueryList<ElementRef>;
  @Input() files: FilePlus[] = [];
  @Output() fileEmitter = new EventEmitter<FilePlus>();
  @Output() createEmitter = new EventEmitter<FilePlus>();
  @Output() deleteEmitter = new EventEmitter<FilePlus>();
  @Output() linkEmitter = new EventEmitter<string>();
  uploadState$: Observable<number> = NEVER;
  uploadStates: Observable<number>[] = [];
  deleteState$: Observable<boolean> | null = null;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    // if (this.files.length === 0) {
    //   this.files = [ this.createNewFile() ];
    // }
  }

  createNewFile() {
    const file = new File([], "");
    return {
      ...file,
      blobURL: "",
      cloudURL: ""
    }
  }

  insertNewFile() {
    this.files.unshift(this.createNewFile());
  }

  deleteFromApp(filePlus: FilePlus) {
    this.deleteEmitter.emit(filePlus);
  }

  deleteFromCloud$(filePlus: FilePlus) {
    this.authService.deleteFile$(filePlus.cloudURL).pipe(
      map(_v => { this.deleteFromApp(filePlus) })
    )
  }

  onFileChosen(filePlus: FilePlus) {
    const fileElement = this.uploadFile.nativeElement as HTMLInputElement;
    if (fileElement.files && fileElement.files.length) {
      const file = fileElement.files[0];
      const filePlus: FilePlus = {
        ...file,
        blobURL: URL.createObjectURL(file),
        cloudURL: ""
      };
      this.createEmitter.emit(filePlus);
    }
  }

  onFileChosenInList(target: EventTarget | null, index: number) {
    console.log("onFileChosenInList called");
    const view = this.uploadFiles.get(index);
    console.log("this.uploadFiles.get(index) => ", this.uploadFiles.get(index));
    console.log("view => ", view);
    if (view !== undefined) {
      const fileElement = view.nativeElement as HTMLInputElement;
      if (fileElement.files && fileElement.files.length) {
        const file = fileElement.files[0] as FilePlus;
        file.blobURL = URL.createObjectURL(file);
        file.cloudURL = "";
        const filePlus: FilePlus = {
          ...file,
          blobURL: URL.createObjectURL(file),
          cloudURL: ""
        };
        this.createEmitter.emit(filePlus);
        console.log("file.name => ", file.name);
        console.log("filePlus.name => ", filePlus.name);
        this.files = this.files.map((f, i) => index === i ? file : f);
      }
    }
  }

  getUploader$(file: FilePlus, index: number) {
    return this.authService.uploadFileResumably$(file, `${this.path}/${file.name}`).pipe(
      map(output => {
        if (isNaN(parseFloat(output))) {
          console.log("url? => ", output);
          file.cloudURL = output;
          this.linkEmitter.emit(output);
          return 100;
        } else {
          const percent = 100 * parseFloat(output);
          const query = this.animators.get(index);
          if (query !== undefined) {
            const div = query.nativeElement as HTMLDivElement;

            const interval = setInterval(() => {
              const divHeight = parseInt(div.style.height.substring(0, div.style.height.length - 1));
              if (divHeight < Math.floor(percent)) div.style.height = `${divHeight + 1}%`;
              if (divHeight === Math.floor(percent)) clearInterval(interval);
            }, 17);
          }
          return percent;
        }
      })
    )
  }

  upload(file: FilePlus, index: number) {
    this.uploadStates = this.files.map((f, i) => index === i ? this.getUploader$(file, index) : NEVER)
  }
}
