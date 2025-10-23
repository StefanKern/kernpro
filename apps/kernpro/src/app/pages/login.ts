import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'core-login',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = false;
  error: string | null = null;

  async signInWithGoogle(): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      await this.authService.signInWithGoogle();
      // Redirect to scraped sites page after successful login
      this.router.navigate(['/scraped-sites']);
    } catch (err) {
      this.error = 'Failed to sign in. Please try again.';
      console.error('Sign in error:', err);
    } finally {
      this.isLoading = false;
    }
  }
}
