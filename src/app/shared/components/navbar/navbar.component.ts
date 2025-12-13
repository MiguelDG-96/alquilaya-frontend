import { Component, signal, HostListener, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  
  @Output() menuStateChanged = new EventEmitter<boolean>();
  
  constructor(private router: Router) {}
  
  // Estado del menú móvil
  isMenuOpen = signal(false);
  
  // Modelo para el campo de búsqueda
  searchQuery: string = '';

  /**
   * Alterna el estado del menú móvil
   */
  toggleMenu(): void {
    this.isMenuOpen.update(value => !value);
    this.emitMenuState();
    
    // Bloquear/desbloquear scroll del body
    this.toggleBodyScroll();
  }

  /**
   * Cierra el menú móvil
   */
  closeMenu(): void {
    this.isMenuOpen.set(false);
    this.emitMenuState();
    this.restoreBodyScroll();
  }

  /**
   * Emite el estado del menú para que otros componentes lo sepan
   */
  private emitMenuState(): void {
    this.menuStateChanged.emit(this.isMenuOpen());
  }

  /**
   * Bloquea/restaura el scroll del body
   */
  private toggleBodyScroll(): void {
    if (typeof document !== 'undefined') {
      if (this.isMenuOpen()) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  private restoreBodyScroll(): void {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  /**
   * Escucha tecla Escape para cerrar el menú
   */
@HostListener('document:keydown.escape', ['$event'])
handleEscapeKey(event: Event): void {
  // Ahora es Event, no KeyboardEvent específicamente
  if (this.isMenuOpen()) {
    this.closeMenu();
    event.preventDefault(); // Opcional: previene comportamiento por defecto
  }
}

  /**
   * Realiza la búsqueda
   */
  performSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Buscando:', this.searchQuery);
      this.closeMenu();
      // Lógica de búsqueda aquí
    }
  }

  irAlInicio(): void {
    this.router.navigate(['/']);
  }

  /**
   * Navega a la página de login
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
    this.closeMenu();
  }

  /**
   * Navega a la página de registro
   */
  navigateToRegister(): void {
    this.router.navigate(['/register']);
    this.closeMenu();
  }
}