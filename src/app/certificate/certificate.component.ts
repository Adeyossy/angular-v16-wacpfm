import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, concatMap, map } from 'rxjs';
import { AppUser } from '../models/user';
import { AuthService } from '../services/auth.service';
import { UPDATE_COURSES_RECORDS, UpdateCourseRecord } from '../models/update_course_record';
import { UPDATE_COURSES, UpdateCourse } from '../models/update_course';

@Component({
  selector: 'app-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.css']
})
export class CertificateComponent implements OnInit, AfterViewInit {
  @ViewChild('certificate') certificate: ElementRef = new ElementRef('canvas');
  @ViewChild('img') img: ElementRef = new ElementRef('img');
  @ViewChild('container') container: ElementRef = new ElementRef('div');
  user$: Observable<AppUser> = new Observable();
  certificateUrl$: Observable<string> = new Observable();
  records$: Observable<UpdateCourseRecord> = new Observable();
  downloadUrl = "";
  url = "";

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
    const updateCourseId$ = this.activatedRoute.paramMap.pipe(
      map(params => params.get("updateCourseId") as string)
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
          } return "";
        })
      ))
    );

    this.certificateUrl$.subscribe({
      next: url => this.url = url
    });
  }

  ngAfterViewInit(): void {
    const cert = this.certificate.nativeElement as HTMLCanvasElement;
    const certContext = cert.getContext("2d");
    const img = this.img.nativeElement as HTMLImageElement;
    // img.crossOrigin = 'Anonymous';
    // const img = new Image();
    if (certContext) {
      img.onload = () => {
        // cert.setAttribute("width", img.width.toString());
        // cert.setAttribute("height", img.height.toString());
        certContext.drawImage(img, 0, 0, cert.width, cert.height);
        const sub = this.authService.getAppUser$().subscribe({
          next: (appUser) => {
            const nil = ["nil", "none", "not applicable", "-", "_", " ", "", "."];
            const middlename = nil.find(n => appUser.middlename.toLowerCase().trim() === n.trim()) ? 
            '' : ' '+appUser.middlename;
            const name = `Dr. ${appUser.firstname}${middlename} ${appUser.lastname}`;
            certContext.font = `${cert.height * 0.042}px Georgia`;
            const namePpties = certContext.measureText(name);
            certContext.fillText(name, cert.width / 2 - (namePpties.width / 2),
              cert.height * 0.53);
            certContext.textAlign = "center";
            cert.toBlob(blob => {
              if (blob) this.downloadUrl = window.URL.createObjectURL(blob);
            }, "image/png", 1);
          },
          complete: () => { 
            console.log("unsubscribed from certificate component")
            sub.unsubscribe() 
          }
        });
      }
    }
    // img.src = "assets/artwork.png";

  }

  downloadCert() {
    // const cert = this.certificate.nativeElement as HTMLCanvasElement;
    // console.log("download url => ", this.downloadUrl);
  }
}
