import { Component, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { concatMap, Observable } from 'rxjs';
import { Event } from 'src/app/models/event';
import { EventRecord } from 'src/app/models/event_record';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-event-certificate',
  templateUrl: './event-certificate.component.html',
  styleUrls: ['./event-certificate.component.css']
})
export class EventCertificateComponent {
  @ViewChild('certificate') certificate: ElementRef = new ElementRef('canvas');
  @ViewChild('img') img: ElementRef = new ElementRef('img');
  @ViewChild('container') container: ElementRef = new ElementRef('div');
  event$: Observable<Event> = new Observable();
  record$: Observable<EventRecord> = new Observable();
  downloadUrl = "";
  downloadURLs: { [index: string]: string } = {};

  constructor(private activatedRoute: ActivatedRoute, private authService: AuthService,
    private eventService: EventService) { }

  ngOnInit(): void {
    this.event$ = this.eventService.getEventId$(this.activatedRoute.paramMap).pipe(
      concatMap(this.eventService.getEventById$)
    );

    this.record$ = this.eventService.getEventId$(this.activatedRoute.paramMap).pipe(
      concatMap(this.eventService.getUserEventRecord$)
    );

    // this.certificateUrl$.subscribe({
    //   next: url => this.url = url
    // });
  }

  onImgLoad = (record: EventRecord, canvas: HTMLCanvasElement,
    img: HTMLImageElement) => {
    // canvas.width = img.width;
    // canvas.height = img.height;
    // const certFont = new FontFace(
    //   "Certificate", 
    //   "url('assets/fonts/imperialscript-regular-webfont.woff2')"
    // );

    // await certFont.load();
    const certContext = canvas.getContext("2d")!;
    certContext.drawImage(img, 0, 0, canvas.width, canvas.height);
    this.generateDetails(record, canvas, certContext);
  }

  generateDetails = (record: EventRecord, canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D) => {
    const nil = ["nil", "none", "not applicable", "-", "_", " ", "", "."];
    const title = 'Dr';
    const middlename = nil.find(n => record.middlename.toLowerCase().trim() === n.trim()) ?
      '' : '  ' + record.middlename;
    const name = `${title}.  ${record.firstname}${middlename}  ${record.lastname}`;
    context.font = `bold ${canvas.height * 0.064}px 'Certifont'`;
    const namePpties = context.measureText(name);
    context.fillText(name, canvas.width / 2 - (namePpties.width / 2),
      canvas.height * 0.49);
    context.textAlign = "center";
    canvas.toBlob(blob => {
      console.log("canvas.id =>", canvas.id);
      if (blob) this.downloadURLs[canvas.id] = window.URL.createObjectURL(blob);
    }, "image/png", 1);
  }

  generateDownloadURL = (blob: Blob | null) => {
    return blob !== null ? window.URL.createObjectURL : "-"
  }

  getURL$ = (type: Event) => {
    if ("certificateURL" in type) { }
  }

  downloadCert() {
    // const cert = this.certificate.nativeElement as HTMLCanvasElement;
    // console.log("download url => ", this.downloadUrl);
  }
}
