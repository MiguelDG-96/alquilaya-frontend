import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, lastValueFrom } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface UserData {
  uid?: string;
  email: string;
  fullName?: string;
  picture?: string;
  phone?: string;
  token?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  message?: string;
}

export interface RegisterResponse {
  message: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  listingType: 'SALE' | 'RENT';
  stockQuantity?: number;
  location: string;
  productImageUrl?: string;
  status?: 'ACTIVE' | 'PENDING_PAYMENT';
  seller?: {
    email: string;
    fullName: string;
  };
  categoryId?: number;
}

export interface VerifyResponse {
  message: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ProfileImageResponse {
  message: string;
  profileImageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = 'https://pseudoaggressive-crescentic-obdulia.ngrok-free.dev/api/v1';
  private readonly BASE_URL = 'https://pseudoaggressive-crescentic-obdulia.ngrok-free.dev';

  // Señales para estado
  public currentUser = signal<UserData | null>(null);
  public isLoading = signal(false);

  private accessToken = localStorage.getItem('access_token');
  private refreshToken = localStorage.getItem('refresh_token');

  constructor() {
    // Restaurar sesión si hay token
    if (this.accessToken) {
      this.loadUserFromToken();
    }
  }

  // ========== LOGIN TRADICIONAL ==========
  async login(email: string, password: string): Promise<UserData> {
    this.isLoading.set(true);
    try {
      const response$ = this.http.post<LoginResponse>(
        `${this.API_URL}/auth/login`,
        { email, password },
        { headers: this.getHeaders(false) }
      );

      const response = await lastValueFrom(response$);
      this.saveTokens(response.access_token, response.refresh_token);
      const userData = this.loadUserFromToken();
      
      return userData;
    } catch (error: any) {
      const errorMessage = this.getErrorMessage(error);
      throw new Error(errorMessage);
    } finally {
      this.isLoading.set(false);
    }
  }

  // ========== LOGIN CON GOOGLE ==========
  async loginWithGoogle(googleToken: string): Promise<UserData> {
    this.isLoading.set(true);
    try {
      const response$ = this.http.post<LoginResponse>(
        `${this.API_URL}/auth/login/google`,
        { token: googleToken },
        { headers: this.getHeaders(false) }
      );

      const response = await lastValueFrom(response$);
      this.saveTokens(response.access_token, response.refresh_token);
      const userData = this.loadUserFromToken();
      
      return userData;
    } catch (error: any) {
      const errorMessage = this.getErrorMessage(error);
      throw new Error(errorMessage);
    } finally {
      this.isLoading.set(false);
    }
  }

  // ========== REGISTRO ==========
  async register(userData: {
    fullName: string;
    email: string;
    password: string;
    phone: string;
  }): Promise<RegisterResponse> {
    this.isLoading.set(true);
    try {
      const response$ = this.http.post<RegisterResponse>(
        `${this.API_URL}/auth/register`,
        userData,
        { headers: this.getHeaders(false) }
      );

      const response = await lastValueFrom(response$);
      return response;
    } catch (error: any) {
      const errorMessage = this.getErrorMessage(error);
      throw new Error(errorMessage);
    } finally {
      this.isLoading.set(false);
    }
  }

  // ========== VERIFICAR EMAIL ==========
  async verifyEmail(email: string, code: string): Promise<VerifyResponse> {
    try {
      const response$ = this.http.post<VerifyResponse>(
        `${this.API_URL}/auth/verify`,
        { email, code },
        { headers: this.getHeaders(false) }
      );

      const response = await lastValueFrom(response$);
      return response;
    } catch (error: any) {
      const errorMessage = this.getErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  // ========== RECUPERAR CONTRASEÑA ==========
  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    try {
      const response$ = this.http.post<ForgotPasswordResponse>(
        `${this.API_URL}/auth/request-reset`,
        { email },
        { headers: this.getHeaders(false) }
      );

      const response = await lastValueFrom(response$);
      return response;
    } catch (error: any) {
      const errorMessage = this.getErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  // ========== REFRESCAR TOKEN ==========
  async refreshSession(): Promise<void> {
    if (!this.refreshToken) {
      this.logout();
      return;
    }

    try {
      const response$ = this.http.post<LoginResponse>(
        `${this.API_URL}/auth/refresh-token`,
        {},
        { 
          headers: {
            'Authorization': `Bearer ${this.refreshToken}`,
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );

      const response = await lastValueFrom(response$);
      this.saveTokens(response.access_token, response.refresh_token);
      this.loadUserFromToken();
    } catch (error) {
      console.error('Error al refrescar sesión:', error);
      this.logout();
    }
  }

  // ========== SUBIR FOTO DE PERFIL ==========
  async uploadProfileImage(file: File): Promise<ProfileImageResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response$ = this.http.post<ProfileImageResponse>(
        `${this.API_URL}/users/me/image`,
        formData,
        { 
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'ngrok-skip-browser-warning': 'true'
          }
        }
      );

      const response = await lastValueFrom(response$);

      // Actualizar la URL de la foto en el usuario actual
      if (response.profileImageUrl) {
        const currentUser = this.currentUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, picture: response.profileImageUrl };
          this.currentUser.set(updatedUser);
        }
      }

      return response;
    } catch (error: any) {
      const errorMessage = this.getErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  // ========== OBTENER PRODUCTOS ==========
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.API_URL}/products`,
      { headers: this.getHeaders(true) }
    ).pipe(
      catchError(error => {
        console.error('Error obteniendo productos:', error);
        return throwError(() => error);
      })
    );
  }

  getMyProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(
      `${this.API_URL}/products/my-products`,
      { headers: this.getHeaders(true) }
    ).pipe(
      catchError(error => {
        console.error('Error obteniendo mis productos:', error);
        return throwError(() => error);
      })
    );
  }

  // ========== LOGOUT ==========
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.accessToken = null;
    this.refreshToken = null;
    this.currentUser.set(null);
    this.router.navigate(['/auth']);
  }

  // ========== HELPERS PRIVADOS ==========
  private saveTokens(accessToken: string, refreshToken: string): void {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  private loadUserFromToken(): UserData {
    if (!this.accessToken) {
      throw new Error('No hay token de acceso');
    }

    try {
      const payload = this.parseJwt(this.accessToken);
      const userData: UserData = {
        email: payload.sub,
        fullName: payload.fullName || payload.name || 'Usuario',
        picture: payload.picture,
        phone: payload.phone,
        token: this.accessToken
      };

      this.currentUser.set(userData);
      return userData;
    } catch (error) {
      console.error('Error parsing JWT:', error);
      throw new Error('Token inválido');
    }
  }

  private parseJwt(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return {};
    }
  }

  private getHeaders(auth: boolean = false, isJson: boolean = true): any {
    const headers: any = {
      'ngrok-skip-browser-warning': 'true'
    };

    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }

    if (auth && this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  private getErrorMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }

    if (error.status === 401) {
      return 'Credenciales inválidas';
    }

    if (error.status === 404) {
      return 'Servicio no disponible';
    }

    if (error.status === 0) {
      return 'Error de conexión. Verifica tu internet.';
    }

    return 'Ocurrió un error inesperado';
  }

  // ========== UTILIDADES PÚBLICAS ==========
  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.currentUser();
  }

  getToken(): string | null {
    return this.accessToken;
  }

  getUserName(): string {
    return this.currentUser()?.fullName || 'Usuario';
  }

  getUserEmail(): string {
    return this.currentUser()?.email || '';
  }

  getProfileImageUrl(): string {
    const picture = this.currentUser()?.picture;
    if (!picture) {
      return 'https://via.placeholder.com/40?text=U';
    }

    if (picture.startsWith('http')) {
      return picture;
    }

    return `${this.BASE_URL}${picture}`;
  }
}