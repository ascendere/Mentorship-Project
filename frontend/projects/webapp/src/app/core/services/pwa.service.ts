import { Injectable } from '@angular/core';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { environment } from 'projects/webapp/src/environments/environment';
import { BrowserLoggerService } from './browser-logger.service';

@Injectable({ providedIn: 'root' })
export class PwaService {

  constructor(
    private readonly update: SwUpdate,
    private readonly push: SwPush,
    private readonly logger: BrowserLoggerService
  ) { }

  /** Init `updates checker` to check for a new version of the application is available */
  initUpdateChecker(): void {
    this.update.available
      .subscribe(_ => {
        const reload = confirm('Hay una nueva versión de la página, Actualizar ahora?');

        if (reload)
          window.location.reload();
      });

    this.logger.log('Update checker init successfully');
  }

  /** Init service to listen for incoming push notifications */
  initPushNotifications(): void {
    this.push.messages
      .subscribe(
        message => this.logger.log('TODO: incoming message', message)
      );

    this.logger.log('Push notifications init successfully');
  }

  /** Wether push notifications are enabled or not */
  get isPushEnabled() {
    return this.push.isEnabled;
  }

  /**
   * Request user permission to send push notifications.
   *
   * Store user keys to send notifications in a server.
   */
  async requestPushAccess(): Promise<boolean> {
    const serverPublicKey = environment.messaging.serverKey;
    await this.logger.info('request-push-access');

    try {
      const key = await this.push.requestSubscription({ serverPublicKey });

      this.logger.log('TODO: Store key in server', key);
      console.log(key);
      await this.logger.info('successful-push-access');
      return true;
    } catch (error) {
      await this.logger.error('error-getting-push-access', error);
      return false;
    }
  }

  /**
   * Remove push notification permission to send notification
   *
   * Remove key form server
   */
  async removePushAccess(): Promise<void> {
    await this.push.unsubscribe();
    this.logger.log('TODO: Unsubscribe successful, remove ey from server');
    await this.logger.info('removed-push-access');
  }

}
