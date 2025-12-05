import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule, 
  Home, Car, Building2, Wrench, Laptop, Bike, Calendar, 
  Armchair, SlidersHorizontal, MapPin, Star, Heart, 
  Music, Shirt 
} from 'lucide-angular';

interface Product {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  price: number;
  priceUnit: string;
  isFeatured: boolean;
  imageUrl?: string;
}

@Component({
  selector: 'app-products-clients',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './products-clients.component.html',
  styleUrls: ['./products-clients.component.css']
})
export class ProductsClientsComponent implements AfterViewInit {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;

  // Iconos de Lucide
  readonly Home = Home;
  readonly Car = Car;
  readonly Building2 = Building2;
  readonly Wrench = Wrench;
  readonly Laptop = Laptop;
  readonly Bike = Bike;
  readonly Calendar = Calendar;
  readonly Armchair = Armchair;
  readonly SlidersHorizontal = SlidersHorizontal;
  readonly MapPin = MapPin;
  readonly Star = Star;
  readonly Heart = Heart;
  readonly Music = Music;
  readonly Shirt = Shirt;

  selectedCategory: string = 'all';

  categories = [
    { id: 'all', name: 'Todas', icon: 'Home' },
    { id: 'vehicles', name: 'Vehículos', icon: 'Car' },
    { id: 'properties', name: 'Inmuebles', icon: 'Building2' },
    { id: 'tools', name: 'Herramientas', icon: 'Wrench' },
    { id: 'electronics', name: 'Electrónica', icon: 'Laptop' },
    { id: 'sports', name: 'Deportes', icon: 'Bike' },
    { id: 'events', name: 'Eventos', icon: 'Calendar' },
    { id: 'home', name: 'Hogar', icon: 'Armchair' },
    { id: 'music', name: 'Música', icon: 'Music' },
    { id: 'fashion', name: 'Moda', icon: 'Shirt' }
  ];

  products: Product[] = [
    {
      id: 1,
      name: 'Toyota Camry 2023',
      location: 'Lima Centro',
      rating: 4.8,
      reviewCount: 124,
      price: 45,
      priceUnit: 'día',
      isFeatured: true
    },
    {
      id: 2,
      name: 'Apartamento Loft Moderno',
      location: 'Miraflores',
      rating: 4.9,
      reviewCount: 89,
      price: 850,
      priceUnit: 'mes',
      isFeatured: true
    },
    {
      id: 3,
      name: 'Taladro Profesional Bosch',
      location: 'San Isidro',
      rating: 4.7,
      reviewCount: 203,
      price: 12,
      priceUnit: 'día',
      isFeatured: false
    },
    {
      id: 4,
      name: 'MacBook Pro M3 16"',
      location: 'San Borja',
      rating: 5.0,
      reviewCount: 67,
      price: 35,
      priceUnit: 'día',
      isFeatured: true
    }
  ];

  ngAfterViewInit(): void {
    this.setupHorizontalScroll();
  }

  private setupHorizontalScroll(): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;

    // Asegurar que el contenedor pueda scrollear
    container.style.overflowX = 'auto';
    container.style.overflowY = 'hidden';
    container.style.scrollBehavior = 'smooth';
    
    // Ocultar scrollbar
    container.style.scrollbarWidth = 'none';
  }

  // Método para scroll con rueda del mouse
  onCategoriesWheel(event: WheelEvent): void {
    if (this.scrollContainer?.nativeElement) {
      event.preventDefault();
      this.scrollContainer.nativeElement.scrollLeft += event.deltaY;
    }
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
  }

  toggleFavorite(productId: number): void {
    console.log('Toggle favorite for product:', productId);
  }

  viewMore(productId: number): void {
    console.log('View more details for product:', productId);
  }

  getIconComponent(iconName: string): any {
    const icons: { [key: string]: any } = {
      'Home': this.Home,
      'Car': this.Car,
      'Building2': this.Building2,
      'Wrench': this.Wrench,
      'Laptop': this.Laptop,
      'Bike': this.Bike,
      'Calendar': this.Calendar,
      'Armchair': this.Armchair,
      'Music': this.Music,
      'Shirt': this.Shirt
    };
    return icons[iconName];
  }
}