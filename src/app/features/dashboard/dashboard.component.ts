import { Component, HostListener } from '@angular/core';

import { DashboardNavbarComponent } from '../../layout/components/navbar/dashboard-navbar.component';
import { DashboardSidebarComponent } from '../../layout/components/sidebar/dashboard-sidebar.component';
import { RouterModule } from "@angular/router";
import { SidebarService } from '../../core/services/sidebar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DashboardNavbarComponent, DashboardSidebarComponent, RouterModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  isCollapsed = false;
  isMobileOpen = false;
  private sidebarSubscription?: Subscription;
  private mobileSubscription?: Subscription;

  constructor(public sidebarService: SidebarService) {}

  ngOnInit(): void {
    // Suscribirse al estado del sidebar
    this.sidebarSubscription = this.sidebarService.isCollapsed$.subscribe(
      collapsed => this.isCollapsed = collapsed
    );
    
    this.mobileSubscription = this.sidebarService.isMobileOpen$.subscribe(
      open => this.isMobileOpen = open
    );
  }

  ngOnDestroy(): void {
    this.sidebarSubscription?.unsubscribe();
    this.mobileSubscription?.unsubscribe();
  }

  getMainClasses(): string {
    const baseClasses = 'min-h-screen pt-16 transition-all duration-300 ease-in-out';
    
    // Para móviles
    if (this.isMobileView()) {
      return `${baseClasses}`; // En móvil el sidebar se superpone
    }
    
    // Para desktop
    if (this.isCollapsed) {
      return `${baseClasses} md:pl-16`; // Sidebar colapsado (64px = w-16)
    }
    
    return `${baseClasses} md:pl-64`; // Sidebar expandido (256px = w-64)
  }

  isMobileView(): boolean {
    return this.sidebarService.isMobileView();
  }

  closeMobileSidebar(): void {
        this.sidebarService.closeIfMobileOpen();
  }

    // Escuchar cambios de tamaño de ventana
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (this.sidebarService.isMobileView() && this.isCollapsed) {
      this.sidebarService.setCollapsed(false);
  }
  }
}
