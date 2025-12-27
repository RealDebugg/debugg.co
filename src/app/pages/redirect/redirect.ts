import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-redirect',
  imports: [],
  templateUrl: './redirect.html',
  styleUrl: './redirect.scss',
})
export class RedirectComponent implements OnInit {
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  ngOnInit() {
    window.location.href = this.activatedRoute.snapshot.data['url'];
  }
}
