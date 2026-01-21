export interface PortfolioSubsection {
  subsection: string,
  membership: number,
  fellowship: number
}

export interface PortfolioSection {
  section: string,
  id: string,
  description: string,
  subsections: PortfolioSubsection[]
}

export const SECTIONS: PortfolioSection[] = [
  {
    section: "Section 3",
    id: "3",
    description: "Learning Plans and Rotations",
    subsections: [
      {
        subsection: "Reflection on Posting",
        membership: 14,
        fellowship: 7
      },
      {
        subsection: "Assessment of Skills & Conduct During Posting",
        membership: 14,
        fellowship: 7
      },
      {
        subsection: "Tutelage Topics",
        membership: 0,
        fellowship: 12
      },
      {
        subsection: "Assessment of Tutelage Practice skills",
        membership: 0,
        fellowship: 6
      }
    ]
  },
  {
    section: "Section 4",
    id: "4",
    description: "Record of Education Supervision",
    subsections: [
      {
        subsection: "Case-based Discussions",
        membership: 6,
        fellowship: 6
      },
      {
        subsection: "Clinical Question Analysis",
        membership: 6,
        fellowship: 6
      },
      {
        subsection: "Personal Development Plan - PDP",
        membership: 3,
        fellowship: 3
      },
      {
        subsection: "Significant Event Analysis - SEA",
        membership: 6,
        fellowship: 6
      }
    ]
  },
  {
    section: "Section 5",
    id: "5",
    description: "Observations by Supervisors",
    subsections: [
      {
        subsection: "Presentation skills",
        membership: 6,
        fellowship: 6
      },
      {
        subsection: "Mini-CEX",
        membership: 12,
        fellowship: 6
      },
      {
        subsection: "Directly Observed Procedural Skills - DOPS",
        membership: 18,
        fellowship: 18
      },
      {
        subsection: "Multisource Feedback - MSF",
        membership: 1,
        fellowship: 1
      },
      {
        subsection: "Com Skills Obs tool",
        membership: 6,
        fellowship: 6
      }
    ]
  },
  {
    section: "Section 6",
    id: "6",
    description: "Written Assignments",
    subsections: [
      {
        subsection: "Written Assignments",
        membership: 0,
        fellowship: 10
      }
    ]
  },
  {
    section: "Section 8",
    id: "8",
    description: "Emergency Medicine Certification",
    subsections: [
      {
        subsection: "Basic Life Support (BLS)",
        membership: 1,
        fellowship: 1
      },
      {
        subsection: "Advanced Life Support (ALS)",
        membership: 1,
        fellowship: 1
      },
      {
        subsection: "Advanced Life Support - Obstetrics (ALSO)",
        membership: 1,
        fellowship: 1
      },
      {
        subsection: "Advanced Trauma Life Support (ATLS)",
        membership: 1,
        fellowship: 1
      },
      {
        subsection: "Paediatric Advanced Life Support (PALS)",
        membership: 1,
        fellowship: 1
      },
    ]
  },
  {
    section: "Section 9",
    id: "9",
    description: "Professional and Scientific Meetings",
    subsections: [
      {
        subsection: "Professional & Scientific Meetings Attended (with Certificates)",
        membership: 4,
        fellowship: 4
      },
      {
        subsection: "Certificate Course Related to Family Medicine (with Certificates)",
        membership: 6,
        fellowship: 6
      },
      {
        subsection: "Any other learning experience relevant to family medicine, that has not been captured",
        membership: 2,
        fellowship: 2
      }
    ]
  },
  {
    section: "Section 10",
    id: "10",
    description: "End of Year Assessments",
    subsections: [
      {
        subsection: "Annual & Final Membership/Fellowship Training and Recommendation Form",
        membership: 4,
        fellowship: 4
      }
    ]
  }
];
