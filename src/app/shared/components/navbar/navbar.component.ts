import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para directivas como *ngIf si se usaran, aunque usaremos control flow nativo
import { FormsModule } from '@angular/forms'; // Necesario para el binding del input
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule], // Importamos FormsModule para manejar el input del buscador
  templateUrl: 'navbar.component.html',
  styleUrls: ['navbar.component.css'], // Archivo CSS vacío para cumplir con la estructura
})
export class NavbarComponent {

  //inyeccion del router
  constructor (private router: Router){}
  
  // Simulación del estado del menú para móviles (no implementado visualmente)
  isMenuOpen = signal(false); 
  
  // Modelo para el campo de búsqueda
  searchQuery: string = '';

  /**
   * Simula la acción de búsqueda.
   */
  performSearch(): void {
    if (this.searchQuery.trim()) {
      console.log('Buscando:', this.searchQuery);
      // Aquí iría la lógica de navegación a la página de resultados
    }
  }

  /**
   * Simula la acción de iniciar sesión.
   */
  navigateToLogin(): void {
    this.router.navigate(['/login'])
    // Aquí iría la lógica de routing
  }

  /**
   * Simula la acción de registrarse.
   */
  navigateToRegister(): void {
    console.log('Navegar a Registrarse');
    // Aquí iría la lógica de routing
  }
}