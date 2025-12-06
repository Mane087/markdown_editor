import { Component, input, output } from '@angular/core';
import {
  AsideElement,
  AsideElementModal,
} from '../../utils/interfaces/aside-element';

@Component({
  selector: 'app-list-icons',
  imports: [],
  templateUrl: './list-icons.component.html',
})
export class ListIconsComponent {
  listIcons = input.required<(AsideElement | AsideElementModal)[]>();
  emitValues = output<[string, string]>();

  handleClick(tag: string, insert: 'start' | 'between' | '') {
    this.emitValues.emit([tag, insert]);
  }
}
