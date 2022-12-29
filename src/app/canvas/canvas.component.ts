import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {GameStateService} from "../game-state.service";
import * as paper from "paper";

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements AfterViewInit {

  @ViewChild("canvas") canvas?: ElementRef<HTMLCanvasElement>;

  constructor(private game: GameStateService) {
    this.game.needsRedraw.subscribe(() => this.game.draw());
  }

  ngAfterViewInit(): void {
    if (!this.canvas) throw "where canvas";
    paper.setup(this.canvas.nativeElement);
    this.game.draw();
  }
}
