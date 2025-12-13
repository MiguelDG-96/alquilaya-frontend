import { Component, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { Subscription } from 'rxjs';
import { DarkModeService } from '../../../core/services/dark-mode.service';
import { SidebarService } from '../../../core/services/sidebar.service';
import { Cog, DoorOpen, LucideAngularModule, User, Menu, X, ChevronLeft, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-dashboard-navbar',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './dashboard-navbar.component.html',
})
export class DashboardNavbarComponent implements OnInit, AfterViewInit, OnDestroy {
  
  // Estados del sidebar
  isCollapsed = false;
  isMobileOpen = false;
  
  // Suscripciones
  private darkModeSubscription?: Subscription;
  private sidebarCollapsedSubscription?: Subscription;
  private sidebarMobileSubscription?: Subscription;
  
  constructor(
    public darkModeService: DarkModeService,
    public sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    // Suscribirse a los estados del sidebar
    this.sidebarCollapsedSubscription = this.sidebarService.isCollapsed$.subscribe(
      collapsed => {
        this.isCollapsed = collapsed;
      }
    );
    
    this.sidebarMobileSubscription = this.sidebarService.isMobileOpen$.subscribe(
      open => {
        this.isMobileOpen = open;
      }
    );
  }

  ngAfterViewInit(): void {
    initFlowbite();
    this.setupDarkModeButton();
  }

  ngOnDestroy(): void {
    // Limpiar todas las suscripciones
    this.darkModeSubscription?.unsubscribe();
    this.sidebarCollapsedSubscription?.unsubscribe();
    this.sidebarMobileSubscription?.unsubscribe();
  }

  // Método para alternar el sidebar
  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  // Método para obtener el título del botón según el estado
  getMenuIconTitle(): string {
    if (this.sidebarService.isMobileView()) {
      return this.isMobileOpen ? 'Cerrar menú' : 'Abrir menú';
    }
    return this.isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar';
  }

  // Verificar si es vista móvil
  isMobileView(): boolean {
    return this.sidebarService.isMobileView();
  }

  // Verificar si es vista desktop
  isDesktopView(): boolean {
    return this.sidebarService.isDesktopView();
  }

  private setupDarkModeButton(): void {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    this.darkModeSubscription = this.darkModeService.isDarkMode$.subscribe(isDark => {
      if (isDark) {
        themeToggleLightIcon?.classList.remove('hidden');
        themeToggleDarkIcon?.classList.add('hidden');
      } else {
        themeToggleDarkIcon?.classList.remove('hidden');
        themeToggleLightIcon?.classList.add('hidden');
      }
    });

    themeToggleBtn?.addEventListener('click', () => {
      this.darkModeService.toggleDarkMode();
    });
  }

  // Iconos de Lucide para el botón del sidebar
  readonly DoorOpen = DoorOpen;
  readonly User = User;
  readonly Cog = Cog;
  readonly Menu = Menu;
  readonly X = X;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
}