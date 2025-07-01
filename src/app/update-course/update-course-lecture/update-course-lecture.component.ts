import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { where } from 'firebase/firestore';
import { NEVER, Observable, Subscription, catchError, forkJoin, map, of } from 'rxjs';
import { concatMap, zip } from 'rxjs/operators';
import { DEFAULT_LECTURE, UPDATE_COURSES_LECTURES, UpdateCourseLecture } from 'src/app/models/update_course';
import { UPDATE_COURSE_TYPES, UpdateCourseType } from 'src/app/models/update_course_record';
import { AppUser, RESOURCE_PERSONS, ResourcePerson, USERS } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-update-course-lecture',
  templateUrl: './update-course-lecture.component.html',
  styleUrls: ['./update-course-lecture.component.css']
})
export class UpdateCourseLectureComponent implements OnInit, OnDestroy {
  @Input() updateCourseId = "";
  @Input() lecture: UpdateCourseLecture = Object.assign({}, DEFAULT_LECTURE);
  @Input() updateState$: Observable<boolean> | null = null;
  @ViewChild('material') material: ElementRef = new ElementRef('input');
  @ViewChild('video') video: ElementRef = new ElementRef('input');
  @ViewChild('materialIndicator') materialIndicator: ElementRef = new ElementRef('div');

  materialModel: any = "";
  videoModel: any = "";

  materialFile: File | null = null;
  videoFile: File | null = null;

  materialBlobURL = "";
  videoBlobURL = "";

  resourcePerson$: Observable<ResourcePerson[]> = of([]);
  names$: Observable<string> = NEVER;
  materialUpload$: Observable<number> = NEVER;
  videoUpload$: Observable<number> = NEVER;

  materialSub = new Subscription();
  videoSub = new Subscription();
  materialProgress = 0;
  videoProgress = 0;

  courseTypes = UPDATE_COURSE_TYPES.slice();

  deleteState$: Observable<void> | null = null;

  constructor(private authService: AuthService, public helper: HelperService) { }

  ngOnInit(): void {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    // console.log("regex test => ", emailRegex.test(this.lecture.lecturerEmail));
    if (this.lecture.lecturerEmail && emailRegex.test(this.lecture.lecturerEmail)) {
      this.findResourcePerson();
      this.names$ = this.getName$();
    }
  }

  ngOnDestroy(): void {
    this.materialSub.unsubscribe();
    this.videoSub.unsubscribe();
  }

  setCourseType(value: string[]) {
    if (value.length) {
      this.lecture.courseType = value[0] as UpdateCourseType
    }
  }

  templateToDate(datetime: string, time: "startTime" | "endTime") {
    const result = Date.parse(datetime).toString();
    // console.log("calculated data => ", result);
    this.lecture[time] = result;
  }

  dateToTemplate(datetime: string) {
    const locale = "en-NG";
    const date = new Date(parseInt(datetime));
    const localeDate = date.toLocaleDateString(locale);
    const toISOString = localeDate.split("/").reverse().join("-")
    const localeTime = date.toLocaleTimeString(locale);
    const result = date.toISOString().substring(0, 16);
    return `${toISOString}T${localeTime}`;
  }

  toSelection = (item: UpdateCourseType) => {
    return item === this.lecture.courseType;
  }

  updateLecture() {
    this.updateState$ = this.authService.addDocWithID$(UPDATE_COURSES_LECTURES, this.lecture.lectureId,
      this.lecture).pipe(map(_update => true));
  }

  deleteLecture() {
    let pdfDeleters$: Observable<void>[] = [of()];
    if (this.lecture.materialLink.length) {
      pdfDeleters$ = this.lecture.materialLink.map(pdf => this.authService.deleteFile$(pdf));
    }

    let videoDeleter$: Observable<void> = of();
    if (this.lecture.videoLink) {
      videoDeleter$ = this.authService.deleteFile$(this.lecture.videoLink);
    }

    const deleteDoc$ = this.authService.deleteDoc$(
      UPDATE_COURSES_LECTURES,
      this.lecture.lectureId
    );

    this.deleteState$ = videoDeleter$.pipe(
      concatMap(_v => forkJoin(pdfDeleters$)),
      concatMap(_v => deleteDoc$),
      map(_v => this.helper.resetDialog())
    );
  }

  findResourcePerson() {
    this.resourcePerson$ = this.authService.queryCollections$(RESOURCE_PERSONS,
      where("userEmail", "==", this.lecture.lecturerEmail)
    );
  }

  getName$() {
    return this.authService.queryCollections$<AppUser>(
      USERS, where("email", "==", this.lecture.lecturerEmail)
    ).pipe(
      map(([appUser]) => `${appUser.firstname} ${appUser.lastname}`)
    )
  }

  onMaterialChange(what: any) {
    const r = this.material.nativeElement as HTMLInputElement;
    // console.log("materialModel => ", this.materialModel);
    // console.log("r => ", r);
    if (r.files && r.files.length) {
      const file = r.files[0];
      this.materialFile = file;
      this.materialBlobURL = URL.createObjectURL(file);
      // console.log('r.files => ', URL.createObjectURL(r.files[0]));
    }
  }

  onVideoChange(what: any) {
    const r = this.video.nativeElement as HTMLInputElement;
    // console.log("videoModel => ", this.videoModel);
    if (r.files && r.files.length) {
      const file = r.files[0];
      this.videoFile = file;
      this.videoBlobURL = URL.createObjectURL(file);
      // console.log('r.files => ', URL.createObjectURL(r.files[0]));
    }
  }

  uploadMaterial() {
    const path = `Materials/${this.lecture.updateCourseId}/${this.lecture.courseType}/${this.materialFile!.name}`;
    this.materialUpload$ = this.authService.uploadFileResumably$(this.materialFile!, path).pipe(
      map(output => {
        // console.log("lecturerEmail => ", this.lecture.lecturerEmail);
        if (isNaN(parseFloat(output))) {
          // console.log("url? => ", output);
          this.lecture.materialLink = [output];
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
      }),
      catchError(err => {
        // console.log("error uploading => ", err);
        return of();
      })
    )
  }

  uploadVoiceover() {
    const path = `Materials/${this.lecture.updateCourseId}/${this.lecture.courseType}/${this.videoFile!.name}`;
    this.videoUpload$ = this.authService.uploadFileResumably$(this.videoFile!, path).pipe(
      map(output => {
        console.log("lecturerEmail => ", this.lecture.lecturerEmail);
        if (isNaN(parseFloat(output))) {
          // console.log("url? => ", output);
          this.lecture.videoLink = output;
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
