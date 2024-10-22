import { Component, OnInit } from '@angular/core';
import { serverTimestamp, where } from 'firebase/firestore';
import { concatMap, map, Observable, of } from 'rxjs';
import { EXAMINERS } from 'src/app/models/exam';
import { Examiner, Geopolitical, Referee } from "src/app/models/examiner";
import { AuthService } from 'src/app/services/auth.service';
import { ExamService } from 'src/app/services/exam.service';

@Component({
  selector: 'app-edit-examiner',
  templateUrl: './edit-examiner.component.html',
  styleUrls: ['./edit-examiner.component.css']
})
export class EditExaminerComponent implements OnInit {
  examiner: Examiner = {
    userEmail: "",
    userId: "",
    name: "",
    contactPhoneNumber: "",
    country: "",
    geopolitical: "",
    dateOfBirth: "",
    dateOfRegistration: serverTimestamp(),
    nameOfInstitution: "",
    wacpMembershipStatus: "",
    residentDoctorsNo: 0,
    trainingCentre: "",
    currentEmploymentStatus: "",
    wacpResponsibilities: false,
    yearOfFellowship: 0,
    firstYearAsExaminer: 0,
    timesPartakenInExam: 0,
    trainerCertificationStatus: "None",
    doctorsEducatorsTrainingStatus: "Not done",
    dissertationsSupervised: 0,
    prbSupervised: 0,
    fellowshipSupervised: 0,
    fellowsSupervised: 0,
    publications: 0,
    previousMgtExperience: false,
    specifyMgtExperience: "",
    trainingResponsibilities: "",
    residentsMentored: 0,
    referees: []
  };

  examiner$: Observable<Examiner> = of(this.examiner);
  updateTracker$: Observable<boolean> | null = null;

  geopolitical = ["North Central", "North East", "North West", "South West", "South East",
    "South South"] as const;

  wacpMembershipStatus = ["Life member", "Paid-up currently", "Paid-up last year",
    "Paid-up 2 years ago"] as const;

  currentEmploymentStatus = ["Employed", "Retired"] as const;

  trainerCertificationStatus = ["Current", "Lapsed", "None"];

  doctorsEducatorsTrainingStatus = ["Done", "Not done", "Equivalent"];

  trainingResponsibilities = ["Institutional Residency TC", "CME Coordinator", "Mentor to Residents"];

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

  constructor(private authService: AuthService, private examService: ExamService) { }

  ngOnInit(): void {
    this.examiner$.pipe(
      concatMap(examiner => this.authService.getAppUser$().pipe(map(appUser => {
        examiner.userId = appUser.userId;
        examiner.userEmail = appUser.email;
        examiner.name = `${appUser.firstname} ${appUser.lastname}`;
        examiner.country = appUser.country;
        examiner.contactPhoneNumber = appUser.phoneNumber;
        return examiner;
      })))
    )
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

  update$() {
    this.updateTracker$ = this.examiner$.pipe(
      concatMap(examiner => this.authService.addDocWithID$(EXAMINERS, examiner.userId, 
        examiner, true)),
      map(_void => true)
    )
  }

  newReferee() {
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
