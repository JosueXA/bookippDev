import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/shared/shared.module';
import { ConfiguracionesRoutingModule } from './configuraciones.routing';
import { ConfiguracionesComponent } from './configuraciones.component';

@NgModule({
  declarations: [ConfiguracionesComponent],
  imports: [CommonModule, ConfiguracionesRoutingModule, SharedModule],
})
export class ConfiguracionesModule {}
