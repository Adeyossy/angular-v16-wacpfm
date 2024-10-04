import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { Exam } from 'src/app/models/exam';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-edit-exam',
  templateUrl: './edit-exam.component.html',
  styleUrls: ['./edit-exam.component.css']
})
export class EditExamComponent {
  @Input() exam$: Observable<Exam> = new Observable();
}
