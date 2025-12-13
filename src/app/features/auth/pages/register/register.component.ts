import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, FormGroup } from '@angular/forms';
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

// Validador para verificar que las contraseñas coincidan
export function passwordsMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const password = control.get('password'); 
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && confirmPassword.touched && password.value !== confirmPassword.value) {
    return { 'passwordsNotMatching': true };
  }
  return null;
}

// Validador para código de verificación (6 dígitos)
export function codeValidator(group: FormGroup): { [key: string]: boolean } | null {
  const codes = ['code0', 'code1', 'code2', 'code3', 'code4', 'code5'];
  const allFilled = codes.every(code => group.get(code)?.value);
  return allFilled ? null : { 'codeRequired': true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, InputComponent],
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  // ID único para todo el componente
  public componentId = Math.random().toString(36).substring(2, 11);

  // IDs únicos para cada input
  public inputIds = {
    email: `register-email-${this.componentId}`,
    password: `register-password-${this.componentId}`,
    name: `register-name-${this.componentId}`,
    phone: `register-phone-${this.componentId}`,
    confirmPassword: `register-confirm-password-${this.componentId}`,
    acceptTerms: `register-accept-terms-${this.componentId}`
  };

  // Señales para estado
  public loading = signal(false);
  public errorMessage = signal<string | null>(null);
  
  // Señales para verificación
  public showVerificationModal = signal(false);
  public verificationEmail = signal('');
  public verifying = signal(false);
  public resending = signal(false);
  public resendTimer = signal(0);
  private timerInterval: any = null;

  // Formulario principal de registro
  public registerForm = this.fb.group({
    name: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
    acceptTerms: [false, [Validators.requiredTrue]],
  }, { validators: passwordsMatchValidator });

  // Formulario de verificación (6 dígitos)
  public verificationForm = this.fb.group({
    code0: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
    code1: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
    code2: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
    code3: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
    code4: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
    code5: ['', [Validators.required, Validators.pattern(/^[0-9]$/)]],
  }, { validators: codeValidator });

  ngOnInit(): void {
    this.loadGoogleScript();
    
    // Configurar callback global para Google
    window.handleGoogleLogin = (response: any) => {
      this.onGoogleLogin(response.credential);
    };
  }

  ngOnDestroy(): void {
    this.clearTimer();
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

  // ========== REGISTRO CON GOOGLE ==========
  async onGoogleLogin(googleToken: string): Promise<void> {
    this.errorMessage.set(null);
    this.loading.set(true);

    try {
      await this.authService.loginWithGoogle(googleToken);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al registrarse con Google';
      this.errorMessage.set(msg);
    } finally {
      this.loading.set(false);
    }
  }

  // ========== REGISTRO TRADICIONAL ==========
  async onSubmit(): Promise<void> {
    this.errorMessage.set(null);

    if (!this.registerForm.valid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    
    this.loading.set(true);
    const { email, password, name, phone } = this.registerForm.value;

    try {
      const result = await this.authService.register({
        fullName: name!,
        email: email!,
        password: password!,
        phone: phone!
      });

      // Mostrar modal de verificación
      this.openVerificationModal(email!);
      
      // Mensaje opcional
      this.errorMessage.set(result.message || 'Registro exitoso. Revisa tu email para el código de verificación.');
      
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al registrarse';
      this.errorMessage.set(msg);
    } finally {
      this.loading.set(false);
    }
  }

  // ========== MÉTODOS DE VERIFICACIÓN ==========
  
  openVerificationModal(email: string): void {
    this.verificationEmail.set(email);
    this.showVerificationModal.set(true);
    this.startResendTimer();
    this.resetVerificationForm();
  }

  closeVerificationModal(): void {
    this.showVerificationModal.set(false);
    this.clearTimer();
    this.verificationEmail.set('');
  }

  resetVerificationForm(): void {
    this.verificationForm.reset();
    // Enfocar el primer input
    setTimeout(() => {
      const firstInput = document.querySelector(`input[id="verification-code-0-${this.componentId}"]`) as HTMLInputElement;
      if (firstInput) firstInput.focus();
    }, 100);
  }

  onCodeInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[id="verification-code-${index + 1}-${this.componentId}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  }

  onCodeKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !(event.target as HTMLInputElement).value && index > 0) {
      const prevInput = document.querySelector(`input[id="verification-code-${index - 1}-${this.componentId}"]`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
    
    if (event.key === 'ArrowLeft' && index > 0) {
      const prevInput = document.querySelector(`input[id="verification-code-${index - 1}-${this.componentId}"]`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
      event.preventDefault();
    }
    
    if (event.key === 'ArrowRight' && index < 5) {
      const nextInput = document.querySelector(`input[id="verification-code-${index + 1}-${this.componentId}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
      event.preventDefault();
    }
  }

  getFullCode(): string {
    const codes = ['code0', 'code1', 'code2', 'code3', 'code4', 'code5'];
    return codes.map(code => this.verificationForm.get(code)?.value || '').join('');
  }

  async onVerifySubmit(): Promise<void> {
    this.verifying.set(true);
    this.errorMessage.set(null);

    const code = this.getFullCode();
    const email = this.verificationEmail();

    if (!code || code.length !== 6) {
      this.errorMessage.set('Ingresa un código válido de 6 dígitos');
      this.verifying.set(false);
      return;
    }

    try {
      const result = await this.authService.verifyEmail(email, code);
      
      // Verificación exitosa
      this.showVerificationModal.set(false);
      this.clearTimer();
      
      // Mostrar mensaje de éxito
      this.errorMessage.set('✓ ' + (result.message || 'Email verificado exitosamente'));
      
      // Navegar a login después de 2 segundos
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al verificar email';
      this.errorMessage.set(msg);
      this.resetVerificationForm();
    } finally {
      this.verifying.set(false);
    }
  }

  async onResendCode(): Promise<void> {
    this.resending.set(true);
    this.errorMessage.set(null);

    try {
      const email = this.verificationEmail();
      
      // Aquí deberías llamar a un método específico de reenvío en tu AuthService
      const result = await this.authService.register({
        fullName: '', 
        email: email,
        password: 'temporal123',
        phone: '999999999'
      });

      this.errorMessage.set('✓ Código reenviado. Revisa tu email.');
      this.startResendTimer();
      
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al reenviar código';
      this.errorMessage.set(msg);
    } finally {
      this.resending.set(false);
    }
  }

  private startResendTimer(): void {
    this.resendTimer.set(60);
    this.clearTimer();
    
    this.timerInterval = setInterval(() => {
      const current = this.resendTimer();
      if (current > 0) {
        this.resendTimer.set(current - 1);
      } else {
        this.clearTimer();
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // ========== NAVEGACIÓN A LOGIN ==========
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}