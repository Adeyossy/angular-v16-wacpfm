import { Component } from '@angular/core';
import { CardList } from '../widgets/card-list/card-list.component';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent {
  sections: CardList[] = [
    {
      title: "Section 3",
      subtitle: "",
      text: ""
    },
    {
      title: "Section 4",
      subtitle: "",
      text: ""
    },
    {
      title: "Section 5",
      subtitle: "",
      text: ""
    },
    {
      title: "Section 6",
      subtitle: "",
      text: ""
    },
    {
      title: "Section 7",
      subtitle: "",
      text: ""
    },
    {
      title: "Section 8",
      subtitle: "",
      text: ""
    },
    {
      title: "Section 9",
      subtitle: "",
      text: ""
    },
    {
      title: "Section 10",
      subtitle: "",
      text: ""
    }
  ]
}
