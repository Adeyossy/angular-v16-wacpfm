export interface Examiner {
  userId: string;
  dateOfBirth: number;
  geopolitical: "North Central" | "North East" | "North West" | "South West" | "South East" | "South South";
  wacpMembershipStatus: "Life member" | "Paid-up currently" | "Paid-up last year" | "Paid-up 2 years ago";
  residentDoctorsNo: number;
  trainingCentre: string;
  currentEmploymentStatus: "Employed" | "Retired";
  wacpResponsibilities: boolean;
  yearOfFellowship: number;
  firstYearAsExaminer: number;
  timesPartakenInExam: number;
  trainerCertificationStatus: "Current" | "Lapsed" | "None";
  doctorsEducatorsTrainingStatus: "Done" | "Not done" | "Equivalent";
  dissertationsSupervised: number;
  prbSupervised: number;
  fellowshipSupervised: number;
  fellowsSupervised: number;
  publications: number;
  previousMgtExperience: boolean;
  specifyMgtExperience: string;
  trainingResponsibilities: "IRTC" | "CMEC" | "Mentor";
  referees: string[];
}
