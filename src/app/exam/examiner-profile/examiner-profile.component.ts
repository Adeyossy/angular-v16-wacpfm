import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { Examiner, NEW_EXAMINER } from 'src/app/models/examiner';
import { CardList } from 'src/app/widgets/card-list/card-list.component';

@Component({
  selector: 'app-examiner-profile',
  templateUrl: './examiner-profile.component.html',
  styleUrls: ['./examiner-profile.component.css']
})
export class ExaminerProfileComponent implements OnInit {
  examiner: Examiner = Object.assign({}, NEW_EXAMINER);
  list: CardList[] = [];

  ngOnInit(): void {
    this.list.push({
      title: "Name and Institution",
      subtitle: this.examiner.name,
      text: this.examiner.trainingCentre
    });

    this.list.push({
      title: "Email and Phone Number",
      subtitle: this.examiner.userEmail,
      text: this.examiner.contactPhoneNumber
    });

    const country = this.examiner.country;
    this.list.push({
      title: "Country",
      subtitle: country === "Nigeria" ? `${country} (${this.examiner.geopolitical})` : country,
      text: ""
    });

    this.list.push({
      title: "Fellowship Details",
      subtitle: `Year of Fellowship (${this.examiner.yearOfFellowship})`,
      text: `${this.examiner.numberOfYearsAsFellow} years as fellow`
    });

    this.list.push({
      title: "WACP Membership Status",
      subtitle: this.examiner.wacpMembershipStatus,
      text: ""
    });

    this.list.push({
      title: "Current Employment Status",
      subtitle: this.examiner.currentEmploymentStatus,
      text: ""
    });

    this.list.push({
      title: "Doctors as Educators Training Status",
      subtitle: `${this.examiner.daeTrainingStatus}`,
      text: ``
    });

    this.list.push({
      title: "Trainer Certification Status",
      subtitle: this.examiner.trainerCertificationStatus,
      text: ""
    });

    this.list.push({
      title: "Number of Trainers at Institution",
      subtitle: this.examiner.noOfTrainers.toString(),
      text: ""
    });

    this.list.push({
      title: "Number of Resident Doctors at Institution",
      subtitle: `${this.examiner.noOfMembershipResidents} Membership Residents`,
      text: `${this.examiner.noOfFellowshipResidents} Fellowship Residents`
    });

    this.list.push({
      title: "Number of Publications",
      subtitle: this.examiner.publications.toString(),
      text: ""
    });

    this.list.push({
      title: "Invitations as Examiner Within the Last 3 Exams",
      subtitle: `${this.examiner.invitationsInLast3Exams}`,
      text: ""
    });

    this.list.push({
      title: "Dissertations/Casebooks Supervised",
      subtitle: `${this.examiner.dissertationsSupervised} dissertations`,
      text: `${this.examiner.casebooksSupervised} casebooks`
    });

    this.list.push({
      title: "Attendance History",
      subtitle: `College AGSM (${this.examiner.collegeAGSMAttendance10})`,
      text: `Faculty ToT (${this.examiner.attendanceAtFacultyTOT5})`
    });

    this.list.push({
      title: "Institutions Worked",
      subtitle: this.examiner.institutionsWorked,
      text: ""
    });

    this.list.push({
      title: "Institution Responsibilities",
      subtitle: this.examiner.trainingResponsibilities,
      text: ""
    });
  }
}
