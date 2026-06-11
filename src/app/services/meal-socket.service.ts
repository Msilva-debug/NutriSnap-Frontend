import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { Meal } from '../models/meal.model';
import { AppStore } from '../store/app.store';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class MealSocketService implements OnDestroy {
  private readonly socketUrl = `${environment.urlBackend.replace(/\/$/, '')}/meals`;
  private readonly logoutSubscription: Subscription;
  private socket?: Socket;

  constructor(
    private readonly authService: AuthService,
    private readonly store: AppStore,
  ) {
    this.logoutSubscription = this.authService.logout$.subscribe(() => {
      this.disconnect();
    });
  }

  connect(): void {
    const token = this.authService.getToken();

    if (!token) {
      this.disconnect();
      return;
    }

    if (this.socket) {
      this.socket.auth = { token };

      if (!this.socket.connected) {
        this.socket.connect();
      }

      return;
    }

    this.socket = io(this.socketUrl, {
      auth: { token },
      timeout: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect_error', (error) => {
      console.warn('No se pudo conectar al socket de comidas:', error.message);
    });

    this.socket.on('meal:created', (meal: Meal) => {
      this.store.dispatch({ type: 'todayMeals/add', meal });
    });
  }

  disconnect(): void {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = undefined;
  }

  ngOnDestroy(): void {
    this.logoutSubscription.unsubscribe();
    this.disconnect();
  }
}
