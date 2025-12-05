import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <!-- 1. BARRA DE NAVEGACIÓN: Publica (app-navbar) -->
    <app-navbar></app-navbar>

    <!-- 2. CONTENIDO DE LA PÁGINA con overflow-x permitido -->
    <main class="min-h-[calc(100vh-80px)] overflow-x-clip"> 
      <router-outlet></router-outlet>
    </main>
  
  `,
  styles: [`
    main {
      padding-top: 0;
      /* Permitir scroll horizontal solo en componentes hijos */
      overflow-x: visible;
    }
  `]
})
export class PublicLayoutComponent {
  currentYear = new Date().getFullYear();
}