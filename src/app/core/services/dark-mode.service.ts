// src/app/core/services/dark-mode.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  private isDarkMode = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkMode.asObservable();

  constructor() {
    this.initializeDarkMode();
  }

  private initializeDarkMode(): void {
    const savedTheme = localStorage.getItem('color-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
      this.isDarkMode.next(true);
    }
  }

  toggleDarkMode(): void {
    const isDark = document.documentElement.classList.toggle('dark');
    
    localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
    this.isDarkMode.next(isDark);
  }

  setDarkMode(isDark: boolean): void {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
    this.isDarkMode.next(isDark);
  }

  getCurrentTheme(): boolean {
    return this.isDarkMode.value;
  }
}