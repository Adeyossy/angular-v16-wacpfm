import { Component } from '@angular/core';
import { CardGrid } from 'src/app/widgets/card-grid/card-grid.component';

@Component({
  selector: 'app-admin-sections',
  templateUrl: './admin-sections.component.html',
  styleUrls: ['./admin-sections.component.css']
})
export class AdminSectionsComponent {
  sections: CardGrid[] = [
    {
      title: "Candidates",
      description: "",
      link: "candidates"
    },
    // {
    //   title: "Examiners",
    //   description: "",
    //   link: "examiners"
    // }
  ]
}
