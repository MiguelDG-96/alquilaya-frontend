import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, FormGroup, FormArray, FormControl } from '@angular/forms';
import { NgClass, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { AuthService } from '../../../../core/services/auth.service';

declare global {
  interface Window {
    handleGoogleLogin: (response: any) => void;
    google: any;
  }
}

export function passwordsMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
  const password = control.get('password'); 
  const confirmPassword = control.get('registerConfirmPassword');

  if (password && confirmPassword && confirmPassword.touched && password.value !== confirmPassword.value) {
    return { 'passwordsNotMatching': true };
  }
  return null;
}

// Validador para código de verificación
export function codeValidator(group: FormGroup): { [key: string]: boolean } | null {
  const codes = ['code0', 'code1', 'code2', 'code3', 'code4', 'code5'];
  const allFilled = codes.every(code => group.get(code)?.value);
  return allFilled ? null : { 'codeRequired': true };
}

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, NgFor, InputComponent],
  templateUrl: 'auth-page.component.html',
})
export class AuthPageComponent implements OnInit, OnDestroy { 
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  // ID único para todo el componente (evita duplicados)
  public componentId = Math.random().toString(36).substring(2, 11);

  // IDs únicos para cada input
  public inputIds = {
    email: `auth-email-${this.componentId}`,
    password: `auth-password-${this.componentId}`,
    name: `auth-name-${this.componentId}`,
    phone: `auth-phone-${this.componentId}`,
    confirmPassword: `auth-confirm-password-${this.componentId}`,
    rememberMe: `auth-remember-me-${this.componentId}`,
    acceptTerms: `auth-accept-terms-${this.componentId}`
  };

  // Señales para estado
  public isLogin = signal(true);
  public submitted = signal(false); 
  public loading = signal(false);
  public errorMessage = signal<string | null>(null);
  
  // Señales para verificación
  public showVerificationModal = signal(false);
  public verificationEmail = signal('');
  public verifying = signal(false);
  public resending = signal(false);
  public resendTimer = signal(0);
  private timerInterval: any = null;

  // Formulario principal
  public authForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],

    // Campos de Registro
    registerName: [''],
    registerPhone: [''],
    registerConfirmPassword: [''],
    acceptTerms: [false],
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
    this.setValidatorsBasedOnMode(true);
    
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

  // ========== MÉTODOS DE VERIFICACIÓN ==========
  
  // Mostrar modal de verificación
  openVerificationModal(email: string): void {
    this.verificationEmail.set(email);
    this.showVerificationModal.set(true);
    this.startResendTimer();
    this.resetVerificationForm();
  }

  // Cerrar modal
  closeVerificationModal(): void {
    this.showVerificationModal.set(false);
    this.clearTimer();
    this.verificationEmail.set('');
  }

  // Reiniciar formulario de verificación
  resetVerificationForm(): void {
    this.verificationForm.reset();
    // Enfocar el primer input
    setTimeout(() => {
      const firstInput = document.querySelector(`input[id="verification-code-0-${this.componentId}"]`) as HTMLInputElement;
      if (firstInput) firstInput.focus();
    }, 100);
  }

  // Manejar entrada de código (auto-focus al siguiente)
  onCodeInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    
    if (value && index < 5) {
      const nextInput = document.querySelector(`input[id="verification-code-${index + 1}-${this.componentId}"]`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  }

  // Manejar teclas en código (backspace, flechas)
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

  // Obtener código completo
  getFullCode(): string {
    const codes = ['code0', 'code1', 'code2', 'code3', 'code4', 'code5'];
    return codes.map(code => this.verificationForm.get(code)?.value || '').join('');
  }

  // Enviar verificación
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
      
      // Cambiar a modo login después de 2 segundos
      setTimeout(() => {
        this.toggleAuthMode(true);
        this.errorMessage.set(null);
      }, 2000);
      
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Error al verificar email';
      this.errorMessage.set(msg);
      
      // Resetear el formulario si hay error
      this.resetVerificationForm();
    } finally {
      this.verifying.set(false);
    }
  }

  // Reenviar código
  async onResendCode(): Promise<void> {
    this.resending.set(true);
    this.errorMessage.set(null);

    try {
      // Usar el endpoint de registro nuevamente para reenviar
      const email = this.verificationEmail();
      
      // O usar un endpoint específico de reenvío si existe
      // Por ahora, simulamos reenviando el registro
      const result = await this.authService.register({
        fullName: '', // Estos campos no son necesarios para reenviar
        email: email,
        password: 'temporal123', // Contraseña temporal
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

  // Temporizador para reenviar
  private startResendTimer(): void {
    this.resendTimer.set(60); // 60 segundos
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

  // ========== MÉTODOS EXISTENTES ==========
  
  toggleAuthMode(isLoginMode: boolean): void {
    this.isLogin.set(isLoginMode);
    this.submitted.set(false); 
    this.errorMessage.set(null);
    this.authForm.reset();
    this.setValidatorsBasedOnMode(isLoginMode);
  }

  private setValidatorsBasedOnMode(isLoginMode: boolean): void {
    const controls = this.authForm.controls;
    const registerFields: AbstractControl[] = [
      controls.registerName, 
      controls.registerPhone,
      controls.registerConfirmPassword
    ];
    
    if (isLoginMode) {
      registerFields.forEach(control => {
        control.clearValidators();
        control.setValue('');
        control.markAsUntouched();
      });
      controls.acceptTerms.clearValidators();
      controls.acceptTerms.setValue(false);
    } else {
      controls.registerName.setValidators([Validators.required]);
      controls.registerPhone.setValidators([Validators.required, Validators.pattern(/^[0-9]{9}$/)]);
      controls.registerConfirmPassword.setValidators([Validators.required]);
      controls.acceptTerms.setValidators([Validators.requiredTrue]);
    }
    
    this.authForm.updateValueAndValidity();
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
    this.submitted.set(true);
    this.errorMessage.set(null);

    if (!this.authForm.valid) {
      this.authForm.markAllAsTouched();
      return;
    }
    
    if (this.isLogin()) {
      await this.handleLogin();
    } else {
      await this.handleRegister();
    }
  }

  private async handleLogin(): Promise<void> {
    this.loading.set(true);
    const { email, password } = this.authForm.value;

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

  // MODIFICADO: Ahora abre el modal después del registro
  private async handleRegister(): Promise<void> {
    this.loading.set(true);
    const { email, password, registerName, registerPhone } = this.authForm.value;

    try {
      const result = await this.authService.register({
        fullName: registerName!,
        email: email!,
        password: password!,
        phone: registerPhone!
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

  // ========== RECUPERAR CONTRASEÑA ==========
  async onForgotPassword(): Promise<void> {
    const email = this.authForm.get('email')?.value;
    
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
}