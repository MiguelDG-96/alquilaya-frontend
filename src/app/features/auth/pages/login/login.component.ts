import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { AuthService } from '../../../../core/services/auth.service';

declare global {
  interface Window {
    handleGoogleLogin: (response: any) => void;
    google: any;
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, InputComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  // ID único para todo el componente
  public componentId = Math.random().toString(36).substring(2, 11);

  // IDs únicos para cada input
  public inputIds = {
    email: `login-email-${this.componentId}`,
    password: `login-password-${this.componentId}`,
    rememberMe: `login-remember-me-${this.componentId}`,
  };

  // Señales para estado
  public loading = signal(false);
  public errorMessage = signal<string | null>(null);

  // Formulario de login
  public loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  ngOnInit(): void {
    this.loadGoogleScript();
    
    // Configurar callback global para Google
    window.handleGoogleLogin = (response: any) => {
      this.onGoogleLogin(response.credential);
    };
  }

  private loadGoogleScript(): void {
    if (!document.querySelector('script[src*="accounts.google.com"]')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }

  // ========== LOGIN CON GOOGLE ==========
  async onGoogleLogin(googleToken: string): Promise<void> {
    this.errorMessage.set(null);
    this.loading.set(true);

    try {
      await this.authService.loginWithGoogle(googleToken);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al iniciar sesión con Google';
      this.errorMessage.set(msg);
    } finally {
      this.loading.set(false);
    }
  }

  // ========== LOGIN TRADICIONAL ==========
  async onSubmit(): Promise<void> {
    this.errorMessage.set(null);

    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    
    this.loading.set(true);
    const { email, password } = this.loginForm.value;

    try {
      await this.authService.login(email!, password!);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al iniciar sesión';
      this.errorMessage.set(msg);
    } finally {
      this.loading.set(false);
    }
  }

  // ========== RECUPERAR CONTRASEÑA ==========
  async onForgotPassword(): Promise<void> {
    const email = this.loginForm.get('email')?.value;
    
    if (!email) {
      this.errorMessage.set('Ingresa tu email para recuperar la contraseña');
      return;
    }

    this.loading.set(true);
    try {
      const result = await this.authService.forgotPassword(email);
      this.errorMessage.set(result.message || 'Revisa tu email para recuperar tu contraseña');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al recuperar contraseña';
      this.errorMessage.set(msg);
    } finally {
      this.loading.set(false);
    }
  }

  // ========== NAVEGACIÓN A REGISTRO ==========
  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }

}