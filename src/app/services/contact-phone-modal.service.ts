import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContactPhoneModalService {
  private readonly openRequestsSubject = new Subject<void>();

  readonly openRequests$ = this.openRequestsSubject.asObservable();

  requestOpen(): void {
    this.openRequestsSubject.next();
  }
}
