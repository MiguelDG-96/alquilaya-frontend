import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { SidebarService } from '../../../core/services/sidebar.service';
import { LucideAngularModule, House, CirclePlus, MessageCircle, Bell, Cog, User } from "lucide-angular";
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-sidebar',
  standalone: true,
  imports: [LucideAngularModule, RouterLink, RouterModule],
  templateUrl: './dashboard-sidebar.component.html',
})
export class DashboardSidebarComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  isMobileOpen = false;
  
  private sidebarSubscription?: Subscription;
  private mobileSubscription?: Subscription;

  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {
    // Suscribirse al estado de colapso (desktop)
    this.sidebarSubscription = this.sidebarService.isCollapsed$.subscribe(
      collapsed => this.isCollapsed = collapsed
    );
    
    // Suscribirse al estado de apertura mobile
    this.mobileSubscription = this.sidebarService.isMobileOpen$.subscribe(
      open => this.isMobileOpen = open
    );
  }

  ngOnDestroy(): void {
    this.sidebarSubscription?.unsubscribe();
    this.mobileSubscription?.unsubscribe();
  }

  @HostListener('window:resize')
  onResize() {
  }

  getSidebarClasses(): string {
    const baseClasses = 'fixed top-0 left-0 z-40 h-full transition-all duration-300 ease-in-out';
    
    if (this.isMobileView()) {
      return `${baseClasses} w-64 ${this.isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`;
    }
    
    return `${baseClasses} translate-x-0 ${this.isCollapsed ? 'w-16' : 'w-64'}`;
  }

  isMobileView(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }

  closeMobileSidebar(): void {
    this.sidebarService.closeMobile();
  }

  readonly House = House;
  readonly CirclePlus = CirclePlus;
  readonly MessageCircle = MessageCircle;
  readonly Bell = Bell;
  readonly User = User;
  readonly Cog = Cog;
}