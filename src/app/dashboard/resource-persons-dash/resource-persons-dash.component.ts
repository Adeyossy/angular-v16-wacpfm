import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { where } from 'firebase/firestore';
import { Observable, concatMap, iif, map, of } from 'rxjs';
import { RESOURCE_PERSONS, ResourcePerson } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-resource-persons-dash',
  templateUrl: './resource-persons-dash.component.html',
  styleUrls: ['./resource-persons-dash.component.css']
})
export class ResourcePersonsDashComponent implements OnInit {
  resourcePersons$: Observable<ResourcePerson[]> = of([]);

  constructor(private authService: AuthService, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.resourcePersons$ = this.activatedRoute.paramMap.pipe(
      concatMap(p => {
        const id = p.get("updateCourseId");
        const email = p.get("email");
        return iif(
          () => id !== "" && email !== "", 
          this.authService.queriesCollections$<ResourcePerson>(RESOURCE_PERSONS, [
            where("updateCourseId", "==", id),
            where("userEmail", "==", email)
          ]),
          of([])
        )
      })
    );
  }
}
