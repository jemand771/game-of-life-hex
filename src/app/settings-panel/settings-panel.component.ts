import {Component, ElementRef, ViewChild} from '@angular/core';
import {GameStateService} from "../game-state.service";

@Component({
  selector: 'app-settings-panel',
  templateUrl: './settings-panel.component.html',
  styleUrls: ['./settings-panel.component.css']
})
export class SettingsPanelComponent {

  @ViewChild("alivePos") alivePos?: ElementRef<HTMLTextAreaElement>;

  constructor(protected game: GameStateService) {
  }

  protected loadAlivePos() {
    const numbers = (this.alivePos?.nativeElement.value ?? "").split(/[,; \n]/).filter(elem => elem).map(elem => parseInt(elem.trim()));
    this.game.nodes.forEach(node => node.alive = false);
    for (let i = 0; i < numbers.length; i += 2) {
      const node = this.game.findNode(numbers[i], numbers[i + 1]);
      if (node) node.alive = true;
    }
  }

  protected saveAlivePos() {
    if (!this.alivePos?.nativeElement) return;
    this.alivePos.nativeElement.value = this.game.nodes.filter(node => node.alive).map(node => [node.x, node.y].join(",")).join(" ");
  }
}
