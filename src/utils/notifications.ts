import { Notify } from 'quasar';
export function showSuccessNotification(message: string) {
  Notify.create({
    type: 'positive',
    message,
    position: 'top',
    timeout: 2500,
    actions: [{ icon: 'close', color: 'white', dense: true }],
  });
}

export function showErrorNotification(message: string) {
  Notify.create({
    type: 'negative',
    message,
    position: 'top',
    timeout: 3000,
    actions: [{ icon: 'close', color: 'white', dense: true }],
  });
}
