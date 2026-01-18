export interface Alert {
  type: 'alert';
  raw: string;
  alertType: 'NOTE' | 'TIP' | 'IMPORTANT' | 'WARNING' | 'CAUTION';
  text: string;
}
