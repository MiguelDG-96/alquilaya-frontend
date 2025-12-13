import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layout/public-layout.component';
import { HomeComponent } from './features/home/home.component';

// import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
// import { HomeComponent } from './features/home/home.component'; 
// import { ProductDetailsComponent } from './features/products/pages/details/product-details.component'; 


export const routes: Routes = [
  // 1. RUTAS PÚBLICAS (CLIENTE)
  {
    path: '', 
    component: PublicLayoutComponent, 
    children: [
      { 
        path: '', 
        component: HomeComponent,
        title: 'Alquila Ya! - Inicio' 
      },
      { 
        path: 'productos', // Nueva ruta para productos públicos
        loadComponent: () => import('./features/home/components/products/products-clients.component').then(m => m.ProductsClientsComponent),
        title: 'Productos - AlquilaYa'
      },

    ]
  },

  // 2. RUTAS DE AUTENTICACIÓN (Login/Registro)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent),
    title: 'Iniciar Sesión - AlquilaYa'
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent),
    title: 'Registrarse - AlquilaYa'
  },

  // 3. RUTAS DEL DASHBOARD (ADMIN/PROPIETARIO)
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard', 
    children: [
      { 
        path: '', 
        redirectTo: 'inicio',
        pathMatch: 'full' 
      },
      {
        path: 'inicio',
        loadComponent: () => import('./features/dashboard/components/products/dashboard-products.component').then(m => m.DashboardProductsComponent),
        title: 'Dashboard | Productos',
      },
      {
        path: 'publicar',
        loadComponent: () => import('./features/dashboard/components/publicar/publicar-product.component').then(m => m.PublicarProductComponent),
        title: 'Dashboard | Publicar Producto',
      },
      {
        path: 'messages',
        loadComponent: () => import('./features/dashboard/components/messages/messages.component').then(m => m.MessagesComponent),
        title: 'Dashboard | Publicar Producto',
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/dashboard/components/notifications/notifications.component').then(m => m.NotificationsComponent),
        title: 'Dashboard | Publicar Producto',
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/dashboard/components/profile/profile.component').then(m => m.ProfileComponent),
        title: 'Dashboard | Publicar Producto',
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/dashboard/components/settings/settings.component').then(m => m.SettingsComponent),
        title: 'Dashboard | Publicar Producto',
      }
      // Otras rutas internas del dashboard irían aquí
    ]
  },
  
  // 4. RUTA CATCH-ALL (404)
  {
    path: '**', 
    redirectTo: '', 
    pathMatch: 'full'
  }
];