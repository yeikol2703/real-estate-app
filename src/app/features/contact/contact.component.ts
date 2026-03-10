import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { getPropertyWhatsAppLink, DEFAULT_WHATSAPP_PHONE } from '../../shared/utils/whatsapp.util';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

export interface FaqItem {
  questionKey: string;
  answerKey: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);

  readonly whatsAppUrl = getPropertyWhatsAppLink(
    DEFAULT_WHATSAPP_PHONE,
    'Consulta desde Contacto',
    'Costa Rica'
  );

  readonly faqs: FaqItem[] = [
    { questionKey: 'contact.faq1q', answerKey: 'contact.faq1a' },
    { questionKey: 'contact.faq2q', answerKey: 'contact.faq2a' },
    { questionKey: 'contact.faq3q', answerKey: 'contact.faq3a' },
    { questionKey: 'contact.faq4q', answerKey: 'contact.faq4a' },
    { questionKey: 'contact.faq5q', answerKey: 'contact.faq5a' },
  ];

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
