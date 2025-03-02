import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Exam, EXAMINERS, EXAMS } from '../models/exam';
import { CurrentEmploymentStatus, DAETrainingStatus, Examiner, NEW_EXAMINER, TrainerCertificationStatus, TrainingResponsibilities, WACPMembershipStatus } from "../models/examiner";
import { concatMap, map, Observable, of } from 'rxjs';
import { QueryFieldFilterConstraint, where } from 'firebase/firestore';
import { Candidate, CANDIDATES, FellowshipExamRecord, MembershipExamRecord } from '../models/candidate';
import { HelperService } from './helper.service';
import { CacheService } from './cache.service';

type Cache = {
  [collection: string]: unknown[];
}

@Injectable({
  providedIn: 'root'
})
export class ExamService extends CacheService {
  // exam registration
  // exam information
  // exam progress
  examinerCache: Examiner | null = null;

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

  examVenues = ["Ibadan", "Abuja", "Accra"];

  /**
   * Fetch exam-related item from collection either from the cloud or from cache
   * @param collection name of the Firebase collection
   * @returns Observable of the Type based on the collection
   */
  getItem$<Type>(collection: string) {
    if (this.cache[collection] && this.cache[collection].length)
      return of(this.cache[collection]) as Observable<Type[]>;
    return this.authService.getDocByUserId$<Type>(collection).pipe(
      map(data => {
        this.cache[collection] = [data];
        return this.cache[collection];
      })
    )
  }

  refineQuery<Type>(exams: Exam[]) {}

  queryCandidate$<Type>(examAlias: string, candidateId: string, instance: Type) {
    return this.queryItem$<Type>(CANDIDATES, [
      where("examAlias", "==", examAlias),
      where("candidateId", "==", candidateId)
    ]).pipe(
      map(records => {
        if (records.length === 0) return Object.assign({}, instance);
        return records[0];
      })
    )
  }

  queryCandidates$(examAlias: string) {
    return this.queryItem$<Candidate>(CANDIDATES, [where("examAlias", "==", examAlias)]);
  }

  queryExaminer$(examAlias: string, examinerId: string) {
    return this.queryItem$<Examiner>(EXAMINERS, [
      where("examAlias", "==", examAlias),
      where("userId", "==", examinerId)
    ]).pipe(
      map(records => {
        if (records.length === 0) return JSON.parse(JSON.stringify(NEW_EXAMINER)) as Examiner;
        return records[0];
      })
    )
  }

  queryExaminers$(examAlias: string): Observable<Examiner[]> {
    return this.queryItem$<Examiner>(EXAMINERS, [where("examAlias", "==", examAlias)])
  }

  queryExam$(examAlias: string): Observable<Exam[]> {
    return this.queryCacheFirst$<Exam & {[key: string]: number}>(EXAMS, "examAlias", "==", examAlias);
  }

  parseCandidateExamId(candidate: Candidate) {
    return candidate.candidateId.concat("_", candidate.examAlias);
  }

  parseExaminerExamId(examiner: Examiner) {
    return examiner.userId.concat("_", examiner.examAlias);
  }

  showDoneMessage() {
    this.helper.setDialog({
      title: "Registration Complete",
      message: "Your registration is complete. Click the button below to continue.",
      buttonText: "Continue",
      navUrl: "/dashboard/exam"
    });
    this.helper.toggleDialog(0);
  }

  alert() {
    this.helper.setDialog({
      title: "Missing Upload",
      message: "It seems you have not uploaded a required file. Maybe you picked a file but forgot to upload it?",
      buttonText: "Upload"
    });
    this.helper.toggleDialog(0);
  }

  scoreJuniors(juniors: number, trainers: number) {
    if (juniors > 0 && (juniors/trainers) <= 4) {
      return 2;
    } else return 0;
  }

  scoreSeniors(seniors: number, trainers: number) {
    if (seniors > 0 && (seniors/trainers) <= 2) return 2;
    return 0;
  }

  scoreCurrentEmploymentStatus(status: CurrentEmploymentStatus) {
    switch (status) {
      case "Full time":
        return 2;

      case "Visiting":
      default:
        return 1;
    }
  }

  scorePostFellowship(years: number) {
    if (years >= 5 && years <= 14) return 2;
    else {
      if (years >= 15 && years <= 24) return 4;
      else {
        if (years >= 25 && years <= 34) return 3;
        else {
          if (years >= 35 && years <= 40) return 2;
          else {
            if (years >= 41) return 1;
            else return 0;
          }
        }
      }
    }
  }

  scoreDAEStatus(status: DAETrainingStatus) {
    switch (status) {
      case "Yes":
        return 5;

      case "Equivalent":
        return 3;

      case "No":
      default:
        return 0;
    }
  }

  scoreTrainingCertificationStatus(status: TrainerCertificationStatus) {
    switch(status) {
      case "Current":
        return 5;

      case "Lapsed":
        return 2;

      case "None":
      default:
        return 0;
    }
  }

  scoreInvitations(invitations: number) {
    switch(invitations) {
      case 0:
        return 3;

      case 1:
        return 2;

      case 2:
        return 1;

      case 3:
      default:
        return 0;
    }
  }

  /**
   * Takes the total number of casebooks or dissertations an examiner has supervised.
   * @param supervisions type: number. The number of casebooks or dissertations supervised
   * @returns score (type: number) based on exam committee's algorithm.
   */
  scoreSupervisions(supervisions: number) {
    if (supervisions >= 1 && supervisions <= 3) return 2;
    else {
      if (supervisions >= 4 && supervisions <= 6) return 4;
      else {
        if (supervisions >= 7 && supervisions <= 9) return 6;
        else {
          if (supervisions >= 10) return 8;
          else return 0;
        }
      }
    }
  }

  scorePublications(publications: number) {
    if (publications >= 1 && publications <= 3) return 1;
    else {
      if (publications >= 4 && publications <= 6) return 2;
      else {
        if (publications >= 7 && publications <= 9) return 3;
        else {
          if (publications >= 10) return 4;
          else return 0;
        }
      }
    }
  }

  scoreResponsibilities(roles: TrainingResponsibilities) {
    switch(roles) {
      case "Institutional Residency TC":
        return 4;

      case "Head of Department":
        return 2;

      case "None":
      default:
        return 0;
    }
  }

  /**
   * Takes the attendance at College/Chapter AGSM or ToT and returns a score respectively.
   * @param attendance type: number. Total number of times attended college events in last 10 years
   * Attendance could be (1) College AGSM. (2) Chapter AGSM. (3) Faculty ToT.
   * @returns score
   */
  scoreAttendance(attendance: number) {
    if (attendance >= 1 && attendance <= 3) return 2;
    else {
      if (attendance >= 4 && attendance <= 6) return 4;
      else {
        if (attendance >= 7) return 6;
        else return 0;
      }
    }
  }

  scoreWACPMembershipStatus(status: WACPMembershipStatus) {
    switch(status as "Life member" | "Paid up" | "Not paid up") {
      case "Life member":
        return 5;

      case "Paid up":
        return 3;

      case "Not paid up":
      default:
        return 0;
    }
  }

  scoreExaminer(examiner: Examiner) {
    let score = 0;

    // 1. score wacp membership status
    score += this.scoreWACPMembershipStatus(examiner.wacpMembershipStatus as WACPMembershipStatus);
    
    // 2. Number of trainers does not need independent scoring but used as a threshold.

    // 3. score juniors
    score += this.scoreJuniors(examiner.noOfMembershipResidents, examiner.noOfTrainers);

    // 4. Score seniors
    score += this.scoreSeniors(examiner.noOfFellowshipResidents, examiner.noOfTrainers);

    // 5. Score current employment status
    score += this.scoreCurrentEmploymentStatus(
      examiner.currentEmploymentStatus as CurrentEmploymentStatus
    );

    // 6. Score years as fellow
    score += this.scorePostFellowship(examiner.numberOfYearsAsFellow);

    // 7. Score DAE training status
    score += this.scoreDAEStatus(examiner.daeTrainingStatus as DAETrainingStatus);

    // 8. Score training certification status
    score += this.scoreTrainingCertificationStatus(
      examiner.trainerCertificationStatus as TrainerCertificationStatus
    );

    // 9. Score invitations as examiner
    score += this.scoreInvitations(examiner.invitationsInLast3Exams);

    // 10. Score number of dissertations supervised
    score += this.scoreSupervisions(examiner.dissertationsSupervised);

    // 11. Was scraped.
    // 12. Score number of casebooks supervised
    score += this.scoreSupervisions(examiner.casebooksSupervised); // for casebooks

    // 13. Was scraped.
    // 14. Score number of publications
    score += this.scorePublications(examiner.publications);

    // 15. Score responsibilities
    score += this.scoreResponsibilities(
      examiner.trainingResponsibilities as TrainingResponsibilities
    );

    // 16. Score college AGSM attendance
    score += this.scoreAttendance(examiner.collegeAGSMAttendance10);

    // Attendance at chapter AGSM was not captured.

    // 17. Score faculty ToT attendance
    score += this.scoreAttendance(examiner.attendanceAtFacultyTOT5);
  }
}
