import { Component, Input, forwardRef, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // Usamos CommonModule para @if y bindings de clase

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule], 
  // Estilos agregados para eliminar artefactos visuales de corchetes/bordes no deseados
  styles: [`
    :host {
      /* Asegura que el contenedor del componente no tenga bordes o outlines */
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
      display: block; 
    }
    
    .relative.flex.items-center {
      border: none !important;
      outline: none !important;
      box-shadow: none !important;
    }
    
    .w-full:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(102, 35, 128, 0.5); /* Sombra de foco púrpura sutil */
    }
  `],
  template: `
    <div class="relative">
      <div class="relative flex items-center">
        
        <!-- Icono Izquierdo (Muestra el ícono) -->
        @if (iconLeft) {
          <!-- Ícono posicionado absolutamente -->
          <i 
            [class]="iconLeft"
            class="icon-left absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none"
          ></i>
        }

        <!-- Campo de Entrada -->
        <input
          [id]="id"
          [type]="currentType()"
          [placeholder]="placeholder"
          [value]="value"
          (input)="onInputChange($event)"
          (blur)="onBlur()"
          class="w-full py-3 border border-gray-300 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-purple-200 
                 transition-all text-gray-800"
        
          
          [class.pl-11]="!!iconLeft"
          [class.pl-20]="!iconLeft"
          
          [class.pr-11]="isPasswordField()"
          [class.pr-4]="!isPasswordField()"
        />

        <!-- Icono Derecho (Toggle de Contraseña) -->
        @if (isPasswordField()) {
          <button 
            type="button" 
            (click)="toggleVisibility()"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i [class]="isPasswordVisible() ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </button>
        }
      </div>
      
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements ControlValueAccessor {
  @Input() id: string = '';
  @Input() type: string = 'text'; 
  @Input() placeholder: string = '';
  @Input() iconLeft: string = '';

  value: any = '';
  onChange: any = () => {};
  onTouched: any = () => {};

  isPasswordVisible = signal(false);
  isPasswordField = computed(() => this.type === 'password');
  
  currentType = computed(() => {
    if (this.isPasswordField() && this.isPasswordVisible()) {
      return 'text';
    }
    return this.type;
  });

  toggleVisibility() {
    this.isPasswordVisible.update(visible => !visible);
  }

  // Métodos de ControlValueAccessor
  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
  }

  onBlur(): void {
    this.onTouched();
  }
}