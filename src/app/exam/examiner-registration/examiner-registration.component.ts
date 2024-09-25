import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Examiner, EXAMINERS } from 'src/app/models/exam';
import { AppUser } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { ExamService } from 'src/app/services/exam.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-examiner-registration',
  templateUrl: './examiner-registration.component.html',
  styleUrls: ['./examiner-registration.component.css']
})
export class ExaminerRegistrationComponent implements OnInit {
  examiner: Examiner = {
    userEmail: "",
    userId: "",
    name: "",
    contactPhoneNumber: 0,
    country: "",
    geopolitical: "",
    dateOfBirth: "",
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
  }

  examiner$: Observable<Examiner> = new Observable();
  appUser$: Observable<AppUser> = new Observable();

  geopolitical = ["North Central", "North East", "North West", "South West", "South East", 
    "South South"] as const;

  wacpMembershipStatus = ["Life member", "Paid-up currently", "Paid-up last year", 
    "Paid-up 2 years ago"] as const;

  currentEmploymentStatus = ["Employed", "Retired"] as const;

  trainerCertificationStatus = ["Current", "Lapsed", "None"];

  doctorsEducatorsTrainingStatus = ["Done", "Not done", "Equivalent"];

  trainingResponsibilities = ["IRTC", "CMEC", "Mentor"];

  constructor(private authService: AuthService, private examService: ExamService) {}

  ngOnInit(): void {
    this.appUser$ = this.authService.getAppUser$();
  }

  getExaminer$() {
    this.examiner$ = this.examService.getExamItem$<Examiner>(EXAMINERS, 
      "examiner") as Observable<Examiner>;
  }
}
