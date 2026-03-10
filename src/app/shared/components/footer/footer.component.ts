import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LocaleService } from '../../../core/services/locale.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  readonly localeService = inject(LocaleService);
  readonly currentYear = new Date().getFullYear();
}
