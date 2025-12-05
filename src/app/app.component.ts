import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DarkModeService } from './core/services/dark-mode.service';

@Component({
  selector: 'app-root',
  standalone: true,  // ← Asegúrate de tener esto
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  constructor(private darkModeService: DarkModeService) {}

  ngOnInit(): void {
    // El servicio se inicializa automáticamente
  }
}