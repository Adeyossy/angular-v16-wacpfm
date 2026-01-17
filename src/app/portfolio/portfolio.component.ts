import { Component, OnInit } from '@angular/core';
import { CardList } from '../widgets/card-list/card-list.component';
import { PortfolioService } from '../services/portfolio.service';
import { PortfolioSection, SECTIONS } from '../models/portfolio-section';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  sections: CardList[] = [
    {
      title: "Section 3",
      subtitle: "Learning Plans and Rotations",
      text: ""
    },
    {
      title: "Section 4",
      subtitle: "Record of Education Supervision",
      text: ""
    },
    {
      title: "Section 5",
      subtitle: "Observations by Supervisors",
      text: ""
    },
    {
      title: "Section 6",
      subtitle: "Written Assignments",
      text: ""
    },
    {
      title: "Section 8",
      subtitle: "Emergency Medicine Certification",
      text: ""
    },
    {
      title: "Section 9",
      subtitle: "Professional and Scientific Meetings",
      text: ""
    },
    {
      title: "Section 10",
      subtitle: "End of Year Assessments",
      text: ""
    }
  ];

  constructor (private portfolioService: PortfolioService) {}

  ngOnInit(): void {
    this.sections = SECTIONS.map(this.toCardList)
  }

  toCardList = (section: PortfolioSection): CardList => {
    return {
      title: section.section,
      subtitle: section.description,
      text: "-"
    }
  }
}
