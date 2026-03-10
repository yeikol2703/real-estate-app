import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import {
  getPropertyWhatsAppLink,
  DEFAULT_WHATSAPP_PHONE,
} from './shared/utils/whatsapp.util';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly floatingWhatsAppUrl = getPropertyWhatsAppLink(
    DEFAULT_WHATSAPP_PHONE,
    'Consulta general',
    'Costa Rica'
  );
}
