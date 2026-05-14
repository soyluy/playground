import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';

import { ItemCondition } from '../../../../core/models/auction-item.model';
import { AuctionItemApiService } from '../../services/auction-item-api.service';

@Component({
  selector: 'app-create-item-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule,
  ],
  templateUrl: './create-item.html',
  styleUrl: './create-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateItemPage {
  private readonly _fb = inject(FormBuilder);
  private readonly _router = inject(Router);
  private readonly _auctionItemApi = inject(AuctionItemApiService);

  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly conditions = Object.values(ItemCondition);
  readonly imagePreviews = signal<string[]>([]);

  readonly detailsForm = this._fb.group({
    title: this._fb.control('', [Validators.required, Validators.maxLength(180)]),
    description: this._fb.control('', [Validators.required, Validators.minLength(20)]),
    condition: this._fb.control<ItemCondition>(ItemCondition.GOOD, Validators.required),
    categoryId: this._fb.control('', Validators.required),
  });

  readonly imagesForm = this._fb.group({
    images: this._fb.array<string>([]),
  });

  readonly pricingForm = this._fb.group({
    startingPrice: this._fb.control<number | null>(null),
    reservePrice: this._fb.control<number | null>(null),
    buyNowPrice: this._fb.control<number | null>(null),
    weight: this._fb.control<number | null>(null),
  });

  get imagesArray(): FormArray {
    return this.imagesForm.controls.images;
  }

  addImage(urlInput: HTMLInputElement): void {
    const value = urlInput.value.trim();
    if (!value) {
      return;
    }

    this.imagesArray.push(this._fb.control(value));
    this.imagePreviews.update((current) => [...current, value]);
    urlInput.value = '';
  }

  removeImage(index: number): void {
    this.imagesArray.removeAt(index);
    this.imagePreviews.update((current) => current.filter((_, i) => i !== index));
  }

  canProceedDetails(): boolean {
    return this.detailsForm.valid;
  }

  canProceedImages(): boolean {
    return this.imagesArray.length > 0;
  }

  canProceedPricing(): boolean {
    return true;
  }

  submit(): void {
    if (!this.detailsForm.valid || this.imagesArray.length === 0) {
      this.saveError.set('Complete all required item fields.');
      return;
    }

    this.saving.set(true);
    this.saveError.set(null);

    const payload = {
      ...this.detailsForm.getRawValue(),
      ...this.pricingForm.getRawValue(),
      images: this.imagesArray.getRawValue(),
      dimensions: null,
    };

    this._auctionItemApi.createItem(payload).subscribe({
      next: (item) => {
        this.saving.set(false);
        this._router.navigate(['/auctions/create'], {
          queryParams: { itemId: item.id },
        });
      },
      error: (err) => {
        this.saving.set(false);
        this.saveError.set(err instanceof Error ? err.message : 'Failed to create item');
      },
    });
  }
}
