import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { getPropertyWhatsAppLink, DEFAULT_WHATSAPP_PHONE } from '../../shared/utils/whatsapp.util';
import { PropertyService } from '../../core/services/property.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-about',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslatePipe, AsyncPipe],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent {
  private readonly fb = inject(FormBuilder);
  private readonly propertyService = inject(PropertyService);

  readonly whatsAppUrl = getPropertyWhatsAppLink(
    DEFAULT_WHATSAPP_PHONE,
    'Consulta desde Nosotros',
    'Costa Rica'
  );
  /** Dynamic profile image from Cloudinary (`perfil` tag), fallback handled in template. */
  readonly profileImageUrl$ = this.propertyService.getProfileImageUrl();
  readonly contactForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    inquiryType: ['general', [Validators.required]],
    message: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.contactForm.valid) {
      console.log('Form submitted:', this.contactForm.getRawValue());
      this.contactForm.reset({ inquiryType: 'general' });
    }
  }
}
