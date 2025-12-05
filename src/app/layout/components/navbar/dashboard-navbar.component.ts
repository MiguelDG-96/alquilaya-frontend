import { DashboardComponent } from './../../../features/dashboard/dashboard.component';
import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { Subscription } from 'rxjs';
import { DarkModeService } from '../../../core/services/dark-mode.service';

@Component({
  selector: 'app-dashboard-navbar',
  standalone: true,  // ← Asegúrate de tener esto
  imports: [],
  templateUrl: './dashboard-navbar.component.html',
})
export class DasboardNavbarComponent implements AfterViewInit, OnDestroy {
  
  private darkModeSubscription?: Subscription;
  
  constructor(public DarkModeService: DarkModeService) {}

  ngAfterViewInit(): void {
    initFlowbite();
    this.setupDarkModeButton();
  }

  ngOnDestroy(): void {
    this.darkModeSubscription?.unsubscribe();
  }

  private setupDarkModeButton(): void {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
    const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

    this.darkModeSubscription = this.DarkModeService.isDarkMode$.subscribe(isDark => {
      if (isDark) {
        themeToggleLightIcon?.classList.remove('hidden');
        themeToggleDarkIcon?.classList.add('hidden');
      } else {
        themeToggleDarkIcon?.classList.remove('hidden');
        themeToggleLightIcon?.classList.add('hidden');
      }
    });

    themeToggleBtn?.addEventListener('click', () => {
      this.DarkModeService.toggleDarkMode();
    });
  }
}