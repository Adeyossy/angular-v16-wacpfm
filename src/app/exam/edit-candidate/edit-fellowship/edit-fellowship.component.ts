import { Component, Input } from '@angular/core';
import { AcademicWriting, Dissertation } from 'src/app/models/candidate';

@Component({
  selector: 'app-edit-fellowship',
  templateUrl: './edit-fellowship.component.html',
  styleUrls: ['./edit-fellowship.component.css']
})
export class EditFellowshipComponent {
  @Input() dissertations: Dissertation[] = [];
  @Input() casebooks: AcademicWriting[] = [];

  toCardList = (upload: AcademicWriting, index: number) => {
    return { title: upload.title, subtitle: upload.type, text: `${index}` }
  }
}
