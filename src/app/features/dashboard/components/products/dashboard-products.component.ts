import { ProductsClientsComponent } from '../../../home/components/products/products-clients.component';
// dashboard-products.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-products',
  template: `
    <app-products-clients></app-products-clients>
  `,
  imports: [ProductsClientsComponent]
})
export class DashboardProductsComponent {}