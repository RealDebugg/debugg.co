import {Component, inject} from '@angular/core';
import {MouseService} from '../../services/mouse.service';

@Component({
  selector: 'app-links',
  imports: [],
  templateUrl: './links.html',
  styleUrl: './links.scss',
})
export class Links {
  private mouseService = inject(MouseService);

  public links = [
    { name: 'Elias Detlefsen', technology: 'Friend', link: 'https://eliasdetlefsen.se/', tooltip: "Visit Elias" },
    { name: 'My Trello', technology: 'Documentation', link: 'https://trello.com/b/x5JgYTzD/volvo-install-backlog-parts-backlog', tooltip: "Previous retrofits and documentation" },
    { name: 'DiCE and more', technology: 'Documentation', link: 'https://www.volvotechinfo.com/vida#diagnostic-tools', tooltip: "Volvo tools part numbers" },
    { name: 'SVDNS (EU & UK)', technology: 'Documentation', link: 'https://svdns.info/links-downloads/', tooltip: "Unofficial Volvo tools and documentation" },
    { name: 'Diag Laptops (US)', technology: 'Documentation', link: 'https://diaglaptops.com/wp/', tooltip: "US version of SVDNS" },
    { name: 'EWD Install Guide', technology: 'Documentation', link: 'https://svdns.info/2024/12/29/ewd-some-models-show-blank-pages-install-guide/', tooltip: "Installing EWD locally" },
    { name: 'Mongoose + Drivers (EU & UK)', technology: 'Shop', link: 'https://svdns.info/sales-page/', tooltip: "Buy a mongoose" },
    { name: 'VIDA (US)', technology: 'Software', link: 'https://www.volvotechinfo.com/vida#purchasing-a-vida-subscription', tooltip: "Purchase official VIDA" },
    { name: 'VDASH', technology: 'Software', link: 'https://d5t5.com/sw/vdash.exe', tooltip: "Download VDASH" },
    { name: 'P3Tool', technology: 'Software', link: 'https://p3tool.xyz', tooltip: "Get P3Tool" },
    { name: 'DiCE Drivers', technology: 'Software', link: 'https://d5t5.com/sw/SetupDiCE.exe', tooltip: "Download DiCE drivers" },
    { name: 'VIDA 2014D + EWD + EWD Online', technology: 'Software', link: 'https://volvodiag.com/', tooltip: "Full cracked Volvo software stack" },
    { name: 'Vehicle Spy', technology: 'Software', link: 'https://intrepidcs.com/products/software/vehicle-spy/', tooltip: "Get Vehicle Spy" },


  ];

  onHoverEnter(text: string): void {
    this.mouseService.setHoverText(text);
  }

  onHoverLeave(): void {
    this.mouseService.resetCursor();
  }
}
