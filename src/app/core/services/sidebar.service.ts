// src/app/core/services/sidebar.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private isCollapsed = new BehaviorSubject<boolean>(false);
  public isCollapsed$ = this.isCollapsed.asObservable();

  private isMobileOpen = new BehaviorSubject<boolean>(false);
  public isMobileOpen$ = this.isMobileOpen.asObservable();

  constructor() {
    this.initializeSidebar();
    this.handleResize();
  }

  private initializeSidebar(): void {
    // Solo cargar estado guardado en desktop
    if (this.isDesktopView()) {
      const savedState = localStorage.getItem('sidebar-state');
      const shouldBeCollapsed = savedState === 'collapsed';
      this.isCollapsed.next(shouldBeCollapsed);
    } else {
      // En mobile siempre empieza cerrado
      this.isMobileOpen.next(false);
      this.isCollapsed.next(false); // En mobile no usar colapsado
    }
  }

  private handleResize(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        // Al cambiar de tamaño, ajustar estados
        if (this.isMobileView()) {
          // Cambió a mobile: cerrar overlay si estaba abierto
          if (this.isMobileOpen.value) {
            this.isMobileOpen.next(false);
          }
          // En mobile siempre mostrar expandido (no colapsado)
          if (this.isCollapsed.value) {
            this.isCollapsed.next(false);
          }
        } else {
          // Cambió a desktop: cerrar overlay mobile si estaba abierto
          this.isMobileOpen.next(false);
        }
      });
    }
  }

  // Método principal toggle - ya lo tienes bien
  toggle(): void {
    if (this.isDesktopView()) {
      const newState = !this.isCollapsed.value;
      this.isCollapsed.next(newState);
      localStorage.setItem('sidebar-state', newState ? 'collapsed' : 'expanded');
    } else {
      const newState = !this.isMobileOpen.value;
      this.isMobileOpen.next(newState);
    }
  }

  // Métodos específicos para desktop
  toggleCollapsed(): void {
    if (this.isDesktopView()) {
      const newState = !this.isCollapsed.value;
      this.isCollapsed.next(newState);
      localStorage.setItem('sidebar-state', newState ? 'collapsed' : 'expanded');
    }
  }

  setCollapsed(collapsed: boolean): void {
    if (this.isDesktopView()) {
      this.isCollapsed.next(collapsed);
      localStorage.setItem('sidebar-state', collapsed ? 'collapsed' : 'expanded');
    }
  }

  // Métodos específicos para mobile
  toggleMobile(): void {
    if (this.isMobileView()) {
      const newState = !this.isMobileOpen.value;
      this.isMobileOpen.next(newState);
    }
  }

  openMobile(): void {
    if (this.isMobileView()) {
      this.isMobileOpen.next(true);
    }
  }

  closeMobile(): void {
    this.isMobileOpen.next(false);
  }

  // Métodos de utilidad para verificar el tipo de vista
  isDesktopView(): boolean {
    return typeof window !== 'undefined' && window.innerWidth >= 768;
  }

  isMobileView(): boolean {
    return typeof window !== 'undefined' && window.innerWidth < 768;
  }

  // Obtener estado actual
  getCurrentState(): boolean {
    return this.isCollapsed.value;
  }

  // Método para cerrar sidebar en mobile cuando se hace clic en contenido
  closeIfMobileOpen(): void {
    if (this.isMobileView() && this.isMobileOpen.value) {
      this.isMobileOpen.next(false);
    }
  }
}