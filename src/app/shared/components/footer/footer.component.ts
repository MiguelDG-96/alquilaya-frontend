import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para directivas como *ngIf si se usaran, aunque usaremos control flow nativo

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule], // Importamos FormsModule para manejar el input del buscador
  templateUrl: 'footer.component.html',
})
export class FooterComponent {
}