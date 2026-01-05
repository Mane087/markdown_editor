export interface AsideElement {
  title: string;
  iconSrc: string;
  iconAlt: string;
  tag: string;
  insert: 'start' | 'between' | '';
  combo?: string;
  id?: string;
}

export type AsideElementModal = Omit<AsideElement, 'insert' | 'tag'>;
