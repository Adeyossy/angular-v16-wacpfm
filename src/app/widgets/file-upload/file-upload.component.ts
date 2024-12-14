import { Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { map, NEVER, Observable } from 'rxjs';
import { Upload, WritingType } from 'src/app/models/candidate';
import { EXAMS } from 'src/app/models/exam';
import { AuthService } from 'src/app/services/auth.service';

export interface FilePlus extends File {
  blobURL: string;
  cloudURL: string;
  uploadType: WritingType;
}

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnInit {
  @Input() formats = "";
  @Input() context: WritingType = "";
  @Input() path = EXAMS;
  @ViewChild('fileUpload') uploadFile: ElementRef = new ElementRef('input');
  @ViewChildren('fileUpload') uploadFiles!: QueryList<ElementRef>;
  @ViewChildren('animate') animators!: QueryList<ElementRef>;
  @Input() files: FilePlus[] = [];
  @Input() uploads: Upload[] = [];
  @Output() fileEmitter = new EventEmitter<FilePlus>();
  // @Output() createEmitter = new EventEmitter<FilePlus>();
  // @Output() updateEmitter = new EventEmitter<[FilePlus, number]>();
  // @Output() deleteEmitter = new EventEmitter<number>();
  @Output() uploadsEmitter = new EventEmitter<Upload[]>();
  never$ = NEVER;
  uploadStates: Observable<number>[] = [];
  deleteState$: Observable<boolean> | null = null;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.files = this.uploads.map(this.toFilePlus);
  }

  createNewFile = () => this.toFilePlus();

  toFilePlus = (upload?: Upload) => {
    const newFile = new File([], upload ? upload.description : "", {
      lastModified: upload ? upload.id : 0,
      type: upload ? upload.filetype : ""
    }) as FilePlus;
    
    newFile.blobURL = "";
    newFile.cloudURL = upload ? upload.url : "";
    newFile.uploadType = this.context;
    return newFile;
  
  }

  insertNewFile() {
    this.files.push(this.createNewFile());
  }

  deleteFromApp(index: number) {
    this.files.splice(index, 1);
    // this.deleteEmitter.emit(index);
    // this.uploadsEmitter.emit(this.files.map(this.filePlusToUpload))
  }

  deleteFromCloud$(filePlus: FilePlus, index: number) {
    this.authService.deleteFile$(filePlus.cloudURL).pipe(
      map(_v => { this.deleteFromApp(index) })
    )
  }

  onFileChosen(filePlus: FilePlus) {
    const fileElement = this.uploadFile.nativeElement as HTMLInputElement;
    if (fileElement.files && fileElement.files.length) {
      const file = fileElement.files[0];
      const filePlus: FilePlus = {
        ...file,
        blobURL: URL.createObjectURL(file),
        cloudURL: "",
        uploadType: ""
      };
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
        file.uploadType = this.context;
        console.log("file.name => ", file.name);
        this.files = this.files.map((f, i) => index === i ? file : f);
        // this.updateEmitter.emit([file, index]);
      }
    }
  }

  filePlusToUpload = (filePlus: FilePlus) => {
    const upload: Upload = {
      description: filePlus.name,
      filetype: filePlus.type,
      id: filePlus.lastModified,
      type: filePlus.uploadType,
      uploadDate: Date.now(),
      url: filePlus.cloudURL
    }
    return upload;
  }

  /**
   * Converts files in FilePlus format for storage as Upload object as part of an AcademicWriting
   * @param filesPlus files from file-upload component
   * @returns void
   */
  filesPlusToUploads(filesPlus: FilePlus[]) {
    return filesPlus.map(this.filePlusToUpload);
  }

  getUploader$(file: FilePlus, index: number) {
    return this.authService.uploadFileResumably$(file, `${this.path}/${file.name}`).pipe(
      map(output => {
        if (isNaN(parseFloat(output))) {
          console.log("url? => ", output);
          file.cloudURL = output;
          // this.updateEmitter.emit([file, index]);
          this.uploadsEmitter.emit(this.files.map(this.filePlusToUpload));
          this.uploadStates[index] = NEVER;
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
