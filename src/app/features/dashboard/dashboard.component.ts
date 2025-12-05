import { Component } from '@angular/core';

import { DasboardNavbarComponent } from '../../layout/components/navbar/dashboard-navbar.component';
import { DashboardSidebarComponent } from '../../layout/components/sidebar/dashboard-sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DasboardNavbarComponent, DashboardSidebarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

}
