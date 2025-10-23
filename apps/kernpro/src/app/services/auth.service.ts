import { Injectable, inject, signal } from '@angular/core';
import { Auth, GoogleAuthProvider, User, signInWithPopup, signOut, user } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);

  // Current user observable
  user$: Observable<User | null> = user(this.auth);

  // Current user signal (for easier template access)
  currentUser = signal<User | null>(null);

  constructor() {
    // Keep signal in sync with auth state
    this.user$.subscribe((user) => this.currentUser.set(user));
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    return result.user;
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    await signOut(this.auth);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser();
  }
}
