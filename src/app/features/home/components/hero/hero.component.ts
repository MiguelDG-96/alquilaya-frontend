import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.component.html',
})

export class HeroComponent {

  constructor(private router: Router) {}

  // Método para "Comenzar Ahora" (va a login)
  comenzarAhora(): void {
    this.router.navigate(['/login']);
  }

  // Método para "Ver Productos" (va a productos públicos)
  verProductos(): void {
    this.router.navigate(['/productos']);
  }
}