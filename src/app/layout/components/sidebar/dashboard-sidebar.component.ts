import { Component, AfterViewInit } from '@angular/core';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,  // ← Asegúrate de tener esto
  imports: [],
  templateUrl: './dashboard-sidebar.component.html',
})
export class DashboardSidebarComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    initFlowbite();
  }
}