import { Component } from '@angular/core';
import { HeroComponent } from "./components/hero/hero.component";
import { BenefitsComponent } from "./components/benefits/benefits.component";
import { ProductsClientsComponent } from "./components/products/products-clients.component";
import { FooterComponent } from "../../shared/components/footer/footer.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, BenefitsComponent, ProductsClientsComponent, FooterComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {

}