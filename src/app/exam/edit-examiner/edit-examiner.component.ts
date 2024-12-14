import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { serverTimestamp, where } from 'firebase/firestore';
import { catchError, concatMap, map, Observable, of } from 'rxjs';
import { EXAMINERS, EXAMS } from 'src/app/models/exam';
import { Examiner, Geopolitical, NEW_EXAMINER, Referee } from "src/app/models/examiner";
import { AppUser } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ExamService } from 'src/app/services/exam.service';

@Component({
  selector: 'app-edit-examiner',
  templateUrl: './edit-examiner.component.html',
  styleUrls: ['./edit-examiner.component.css']
})
export class EditExaminerComponent implements OnInit {
  examiner$: Observable<Examiner> = new Observable();
  updateTracker$: Observable<boolean> | null = null;
  user$: Observable<AppUser> = new Observable();

  geopolitical = ["North Central", "North East", "North West", "South West", "South East",
    "South South"] as const;

  wacpMembershipStatus = ["Life member", "Paid up", "Not paid up"] as const;

  currentEmploymentStatus = ["Visiting", "Full time"] as const;

  trainerCertificationStatus = ["Current", "Lapsed", "None"];

  doctorsEducatorsTrainingStatus = ["Yes", "Equivalent", "No"];

  trainingResponsibilities = ["Institutional Residency TC", "Head of Department", "None"];

  accreditation = [
    "44 NAR, Hosp., Kaduna", "ABUTH, Zaria", "AKTH, Kano", "Askoro District Hospital, FCT",
    "ATBUTH, Bauchi", "BMC, Saki", "BUTH(ECWA Hospital), Jos", "BUTH (Baptist MC) Ogbomoso",
    "BMSH, Port Harcourt", "BSUTH, Makurdi", "OLA Catholic Hosp, Oluyuro,Ibadan",
    "Central Hospital, Benin City", "DASH, Lafia,  Jos", "ECWA Hospital, Egbe,Kogi State",
    "EKO Hospital, Ikeja, Lagos", "Eku Baptist Hospital, Eku", "EKSUTH, Ado-Ekiti",
    "Faith Mediplex Hosp, Edo State", "FMC, Keffi, Nassarawa State", "Fed Teach Hosp, Abakaliki",
    "FMC, Makurdi", "FMC, Abeokuta", "FMC, Asaba", "FMC, Bida, Niger State", "FMC, Ebute-Metta",
    "FMC, Lokoja", "FMC, Owerri", "Fed Teaching Hosp, Ido-Ekiti", "FMC, Owo", "FMC,( QEH),Umuahia",
    "Garki  Hospital, Abuja", "General Hospital, Marina, Lagos", "IMSUTH, Imo State",
    "ISTH, Irrua, Edo State", "Jericho Specialist Hosp, Oyo", "JUTH, Jos", "KSSH, Lokoja",
    "LASUTH, Ikeja, Lagos", "LAUTECH TH, Osogbo", "LAUTECH TH, Ogbomoso", "LUTH, Lagos",
    "Maitama District Hopsital, Abuja", "MMS Hosp., Kano", "NAUTH, Nnewi", "NHA, Abuja, FCT",
    "OAUTHC, Ile-Ife", "OOUTH, Sagamu", "OLA Catholic Hospital, Jos", "PSSH, Jos",
    "Sacred Heart  Hospital, Lantoro", "SDA, Hosp, Ile-Ife", "St. Gerard's Cath Hosp, Kaduna",
    "St. Mary's Catholic Hosp. Eleta, Ibadan", "St. Nicholas Hospital, Lagos",
    "State Specialist Hosp, Sekonu", "UATH, FCT, Abuja", "UBTH, Benin City",
    "UCH, Ibadan", "UCTH, Calabar", "UDUTH, Sokoto", "UITH, Ilorin",
    "UNILAG Medical Centre, Lagos", "UNTH (Ituku-Ozalla) Enugu", "UPTH, Port Harcourt",
    "UUTH, Uyo", "Blue Cross Hospital, Sierra Leone", "Liberia"
  ].sort();

  constructor(private authService: AuthService, private examService: ExamService,
    private activatedRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.examiner$ = this.activatedRoute.paramMap.pipe(
      concatMap(this.paramsToExaminer),
      concatMap(examiner => this.authService.getAppUser$().pipe(map(appUser => {
        if (!examiner.userEmail) examiner.userEmail = appUser.email;
        if (!examiner.name) examiner.name = `${appUser.firstname} ${appUser.lastname}`;
        if (!examiner.country) examiner.country = appUser.country;
        if (!examiner.contactPhoneNumber) examiner.contactPhoneNumber = appUser.phoneNumber;
        return examiner;
      })))
    );
  }

  paramsToExaminer = (params: ParamMap) => {
    const examAlias = params.get("examAlias");
    const userId = params.get("userId");
    const defaultExaminer = Object.assign({}, NEW_EXAMINER);

    if (userId !== null && examAlias !== null) {
      defaultExaminer.examAlias = examAlias;
      defaultExaminer.userId = userId;
      return this.examService.queryItem$<Examiner>(EXAMINERS, [
        where("examAlias", "==", examAlias),
        where("userId", "==", userId)
      ]).pipe(
        map(examiners => examiners.length === 0 ? defaultExaminer : examiners[0])
      );
    }
    return of(defaultExaminer);
  }

  getExaminer$() {
    // this.examiner$ = this.examService.queryItem$<Examiner>(EXAMINERS, [
    //   where()
    // ]) as Observable<Examiner>;
  }

  geopoliticise(zones: string[]) {
    return zones[0] as Geopolitical;
  }

  toBoolean(dichot: string[]) {
    if (dichot.includes("Yes")) return true;
    return false;
  }

  fetchUploadPath(examiner: Examiner) {
    return `${EXAMS}/${examiner.examAlias}/${examiner.userId}`
  }

  update$(examiner: Examiner) {
    this.updateTracker$ = this.authService.addDocWithID$(EXAMINERS,
      this.examService.parseExaminerExamId(examiner),
      examiner, true).pipe(
        concatMap(_void => this.router.navigateByUrl('/dashboard/exam')),
        catchError(err => {
          console.log("error => ", err);
          this.updateTracker$ = null;
          return of(false);
        })
      );
  }

  newReferee() {
    console.log("newReferee");
    const referee: Referee = {
      id: "",
      email: "",
      name: "",
      institution: "",
      phoneNumber: "",
      examinerEmail: "",
      examinerId: "",
      response: "",
      reasonIfIncorrect: ""
    }
    return referee;
  }

  deleteReferee = (referees: Referee[], i: number) => {
    return referees.filter((_ref, index) => index !== i)
  }
}
