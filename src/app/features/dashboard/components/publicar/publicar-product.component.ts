import { Component, signal, computed, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { 
  LucideAngularModule, 
  Car, 
  Laptop, 
  Wrench, 
  Home, 
  Dumbbell,
  Sofa,
  PartyPopper,
  type LucideIconData
} from 'lucide-angular';

interface Categoria {
  value: string;
  viewValue: string;
  icon: LucideIconData;
}

@Component({
  selector: 'app-publicar-producto',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatSelectModule, 
    MatFormFieldModule,
    MatSnackBarModule,
    LucideAngularModule
  ],
  templateUrl: './publicar-product.component.html',
  styleUrls: ['./publicar-product.component.css']
})
export class PublicarProductComponent {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  // Iconos como propiedades del componente
  readonly Car = Car;
  readonly Laptop = Laptop;
  readonly Wrench = Wrench;
  readonly Home = Home;
  readonly Dumbbell = Dumbbell;
  readonly Sofa = Sofa;
  readonly PartyPopper = PartyPopper;

  categorias = signal<Categoria[]>([
    { value: 'vehiculos', viewValue: 'Vehículos', icon: Car },
    { value: 'electronica', viewValue: 'Electrónica', icon: Laptop },
    { value: 'herramientas', viewValue: 'Herramientas', icon: Wrench },
    { value: 'inmuebles', viewValue: 'Inmuebles', icon: Home },
    { value: 'deportes', viewValue: 'Deportes', icon: Dumbbell },
    { value: 'hogar', viewValue: 'Hogar y Jardín', icon: Sofa },
    { value: 'eventos', viewValue: 'Eventos', icon: PartyPopper }
  ]);

  fotos = signal(
    Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      nombre: i === 0 ? 'Foto principal' : `Foto ${i + 1}`,
      esPrincipal: i === 0
    }))
  );

  productoForm: FormGroup;
  
  // Computed para la categoría seleccionada
  categoriaSeleccionada = computed(() => {
    const value = this.productoForm.get('categoria')?.value;
    return this.categorias().find(c => c.value === value);
  });

  previewData = signal({
    titulo: 'Título del producto',
    ubicacion: 'Lima, Perú',
    precio: 0,
    periodo: 'día',
    gananciaNeta: 0,
    tarifaServicio: 0
  });

  formularioValido = computed(() => this.productoForm.valid);

  constructor() {
    this.productoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      categoria: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0)]],
      descripcion: ['', [Validators.required, Validators.minLength(20)]]
    });

    this.productoForm.valueChanges.subscribe(() => {
      this.actualizarVistaPrevia();
      // Actualizar el computed manualmente
      this.categoriaSeleccionada = computed(() => {
        const value = this.productoForm.get('categoria')?.value;
        return this.categorias().find(c => c.value === value);
      });
    });
  }

  private actualizarVistaPrevia() {
    const values = this.productoForm.value;
    const precio = parseFloat(values.precio) || 0;
    const tarifa = precio * 0.1;
    
    this.previewData.set({
      titulo: values.titulo || 'Título del producto',
      ubicacion: 'Lima, Perú',
      precio: precio,
      periodo: 'día',
      gananciaNeta: precio - tarifa,
      tarifaServicio: tarifa
    });
  }

  subirFoto(index: number) {
    this.snackBar.open(`📸 Subir ${this.fotos()[index].nombre}`, 'Cerrar', { 
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  publicarProducto() {
    if (this.formularioValido()) {
      this.snackBar.open('✅ Producto publicado exitosamente', 'Cerrar', { 
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    } else {
      this.productoForm.markAllAsTouched();
      this.snackBar.open('⚠️ Por favor completa todos los campos requeridos', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
    }
  }

  guardarBorrador() {
    this.snackBar.open('💾 Borrador guardado', 'Cerrar', { 
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}