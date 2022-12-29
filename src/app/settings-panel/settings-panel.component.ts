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
    this.game.aliveString = (this.alivePos?.nativeElement.value ?? "");
  }

  protected saveAlivePos() {
    if (!this.alivePos?.nativeElement) return;
    this.alivePos.nativeElement.value = this.game.aliveString;
  }
}
