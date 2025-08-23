import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, concatMap, map, of } from 'rxjs';
import { AppUser } from '../models/user';
import { AuthService } from '../services/auth.service';
import { UPDATE_COURSES_RECORDS, UpdateCourseRecord } from '../models/update_course_record';
import { DEFAULT_NEW_TRAINER_CERTIFICATION, TrainerCertification, UPDATE_COURSES, UpdateCourse } from '../models/update_course';
import { UpdateCourseService } from '../services/update-course.service';

@Component({
  selector: 'app-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.css']
})
export class CertificateComponent implements OnInit, AfterViewInit {
  @ViewChild('certificate') certificate: ElementRef = new ElementRef('canvas');
  @ViewChild('trainerCertificate') trainerCertificate: ElementRef = new ElementRef('canvas');
  @ViewChild('img') img: ElementRef = new ElementRef('img');
  @ViewChild('trainerImg') trainerImg: ElementRef = new ElementRef('img');
  @ViewChild('container') container: ElementRef = new ElementRef('div');
  @ViewChild('trainerContainer') trainerContainer: ElementRef = new ElementRef('div');
  user$: Observable<AppUser> = new Observable();
  certificateUrl$: Observable<string> = new Observable();
  records$: Observable<UpdateCourseRecord> = new Observable();
  downloadUrl = "";
  downloadURLs: { [index: string]: string } = {};
  url = "";
  trainerCertification$ = of(DEFAULT_NEW_TRAINER_CERTIFICATION);

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService,
    private updateCourservice: UpdateCourseService) { }

  ngOnInit(): void {
    const updateCourseId$ = this.activatedRoute.paramMap.pipe(
      map(params => params.get("updateCourseId") as string)
    );

    this.trainerCertification$ = updateCourseId$.pipe(
      concatMap(this.updateCourservice.fetchTrainerCert$),
      map(certs => certs.length > 0 ? certs[0] : DEFAULT_NEW_TRAINER_CERTIFICATION)
    );
    
    this.user$ = this.authService.getAppUser$();

    const updateCourse$ = updateCourseId$.pipe(
      concatMap(id => this.authService.getDoc$<UpdateCourse>(UPDATE_COURSES, id))
    );

    this.records$ = this.activatedRoute.paramMap.pipe(
      concatMap(params => this.authService.getDoc$<UpdateCourseRecord>(UPDATE_COURSES_RECORDS,
        params.get("recordId") as string))
    );

    this.certificateUrl$ = updateCourse$.pipe(
      concatMap(uCourse => this.records$.pipe(
        map(record => {
          if (record) {
            if (record.courseType === 'Membership') return uCourse.membershipCertificate;
            if (record.courseType === 'Fellowship') return uCourse.fellowshipCertificate;
            return uCourse.totCertificate;
          } return "-";
        }),
        map(url => url !== "" ? url : "-")
      ))
    );

    // this.certificateUrl$.subscribe({
    //   next: url => this.url = url
    // });
  }

  ngAfterViewInit(): void {
    // const cert = this.certificate.nativeElement as HTMLCanvasElement;
    // const certContext = cert.getContext("2d");
    // const img = this.img.nativeElement as HTMLImageElement;
    // // img.crossOrigin = 'Anonymous';
    // // const img = new Image();
    // if (certContext) {
    //   img.onload = () => {
    //     // cert.setAttribute("width", img.width.toString());
    //     // cert.setAttribute("height", img.height.toString());
    //     certContext.drawImage(img, 0, 0, cert.width, cert.height);
    //     const sub = this.authService.getAppUser$().subscribe({
    //       next: (appUser) => { this.generateDetails(appUser, cert, certContext) },
    //       complete: () => {
    //         console.log("unsubscribed from certificate component")
    //         sub.unsubscribe()
    //       }
    //     });
    //   }
    // }

    // const trainerCert = this.trainerCertificate.nativeElement as HTMLCanvasElement;
    // const trainerCertContext = trainerCert.getContext("2d");
    // const trainerImg = this.trainerImg.nativeElement as HTMLImageElement;
    // // img.src = "assets/artwork.png";
    // if (trainerCertContext) {
    //   trainerImg.onload = () => {
    //     // cert.setAttribute("width", img.width.toString());
    //     // cert.setAttribute("height", img.height.toString());
    //     trainerCertContext.drawImage(img, 0, 0, trainerCert.width, trainerCert.height);
    //     const sub = this.authService.getAppUser$().subscribe({
    //       next: (appUser) => { this.generateDetails(appUser, trainerCert, trainerCertContext) },
    //       complete: () => {
    //         console.log("unsubscribed from trainer certificate")
    //         sub.unsubscribe()
    //       }
    //     });
    //   }
    // }
  }

  onImgLoad = (appUser: AppUser, canvas: HTMLCanvasElement, img: HTMLImageElement) => {
    const certContext = canvas.getContext("2d")!;
    certContext.drawImage(img, 0, 0, canvas.width, canvas.height);
    this.generateDetails(appUser, canvas, certContext);
  }

  generateDetails = (appUser: AppUser, canvas: HTMLCanvasElement, 
    context: CanvasRenderingContext2D) => {
    const nil = ["nil", "none", "not applicable", "-", "_", " ", "", "."];
    const middlename = nil.find(n => appUser.middlename.toLowerCase().trim() === n.trim()) ?
      '' : ' ' + appUser.middlename;
    const name = `Dr. ${appUser.firstname}${middlename} ${appUser.lastname}`;
    context.font = `${canvas.height * 0.042}px Georgia`;
    const namePpties = context.measureText(name);
    context.fillText(name, canvas.width / 2 - (namePpties.width / 2),
      canvas.height * 0.53);
    context.textAlign = "center";
    canvas.toBlob(blob => {
      console.log("canvas.id =>", canvas.id);
      if (blob) this.downloadURLs[canvas.id] = window.URL.createObjectURL(blob);
    }, "image/png", 1);
  }

  generateDownloadURL = (blob: Blob | null) => {
    return blob !== null ? window.URL.createObjectURL : "-"
  }

  getURL$ = (type: UpdateCourse | TrainerCertification) => {
    if ("certificateURL" in type) { }
  }

  downloadCert() {
    // const cert = this.certificate.nativeElement as HTMLCanvasElement;
    // console.log("download url => ", this.downloadUrl);
  }
}
