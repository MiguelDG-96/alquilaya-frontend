import { Routes } from '@angular/router';
import { AuthPageComponent} from './features/auth/pages/login/auth-page.component';
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
      // { 
      //   path: 'producto/:id', 
      //   loadComponent: () => import('./features/products/pages/details/product-details.component').then(m => m.ProductDetailsComponent),
      //   title: 'Detalles del Producto' 
      // },
      // Otras rutas públicas irían aquí
    ]
  },

  // 2. RUTAS DE AUTENTICACIÓN (Login/Registro)
  {
    path: 'login',
    component: AuthPageComponent,
    title: 'Iniciar Sesión',
  },

  // 3. RUTAS DEL DASHBOARD (ADMIN/PROPIETARIO)
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard', 
    children: [
      { 
        path: '', 
        redirectTo: 'home',
        pathMatch: 'full' 
      },
      // {
      //   path: 'home',
      //   loadComponent: () => import('./features/dashboard/pages/home/home.component').then(m => m.HomeComponent),
      //   title: 'Dashboard | Inicio',
      // },
      // {
      //   path: 'productos',
      //   loadComponent: () => import('./features/dashboard/pages/products/products.component').then(m => m.ProductsComponent),
      //   title: 'Dashboard | Gestión de Productos',
      // },
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