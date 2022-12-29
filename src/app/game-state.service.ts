import {EventEmitter, Injectable} from '@angular/core';
import * as paper from "paper";

const COLOR_ALIVE = new paper.Color("#44aa44");
const COLOR_DEAD = new paper.Color("#ffffff");

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  nodes: Cell[] = [];
  needsRedraw = new EventEmitter<void>();
  lastAllocationTime = 0;
  ups: number = 1;
  shouldRun = false;

  constructor() {
    this.size = 5;
  }

  private _size = 0;

  public get size() {
    return this._size;
  }

  public set size(size: number) {
    const startTime = performance.now();
    if (size < this.size) {
      this.nodes.filter(node => node.ring >= size).forEach(node => node.remove());
      this.nodes = this.nodes.filter(node => node.ring < size);
      this.nodes.forEach(node => node.neighbours = node.neighbours.filter(neighbour => neighbour.ring <= size));
    }
    if (size > this.size) {
      for (let x = 1 - size; x < size; x++) {
        for (let y = 1 - size; y < size; y++) {
          if (this.findNode(x, y)) continue;
          const newNode = new Cell(x, y);
          if (newNode.ring >= size) continue;
          this.nodes.push(newNode);
        }
      }
      this.nodes.forEach(filledNode => filledNode.neighbours = this.nodes.filter(node => {
        const xDist = node.x - filledNode.x;
        const yDist = node.y - filledNode.y;
        if (xDist === 0 && Math.abs(yDist) === 1) return true;
        if (yDist === 0 && Math.abs(xDist) === 1) return true;
        return xDist === yDist && Math.abs(xDist) === 1;
      }));
    }
    this._size = size;
    this.needsRedraw.emit();
    this.lastAllocationTime = performance.now() - startTime;
  }

  public findNode(x: number, y: number): Cell | undefined {
    return this.nodes.find(node => node.x === x && node.y === y);
  }

  public draw() {
    this.nodes.forEach(node => node.draw(230 / this.size));
  }

  public tick() {
    this.nodes.forEach(node => node.prepareTurn());
    this.nodes.forEach(node => node.executeTurn());
  }

  public run() {
    this.shouldRun = true;
    this.runner();
  }

  public runner() {
    if (!this.shouldRun) return;
    this.tick();
    setTimeout(() => this.runner(), 1000 / this.ups);
  }

  public stop() {
    this.shouldRun = false;
  }
}

export class Cell {
  neighbours: Cell[] = [];
  layer?: paper.Layer;
  polygon?: paper.Path;

  constructor(public x: number, public y: number) {
  }

  _alive = false;

  public get alive() {
    return this._alive;
  }

  public set alive(alive: boolean) {
    if (this.polygon) this.polygon.fillColor = alive ? COLOR_ALIVE : COLOR_DEAD;
    this._alive = alive;
  }

  _aliveNextTurn = false;

  public get aliveNextTurn() {
    const aliveNeighbours = this.neighbours.filter(node => node.alive).length;
    if (this.alive) return aliveNeighbours === 3 || aliveNeighbours === 5;
    return aliveNeighbours === 2;
  }

  public get ring() {
    if (this.x < 0 && this.y > 0 || this.x > 0 && this.y < 0) return Math.abs(this.x) + Math.abs(this.y);
    return Math.max(Math.abs(this.x), Math.abs(this.y));
    // return Math.abs(this.y - this.x);
  }

  public get paperPoint() {
    const yVect = new paper.Point(-Math.sqrt(3) / 2, -1.5);
    const xVect = new paper.Point(Math.sqrt(3), 0);
    return xVect.multiply(this.x).add(yVect.multiply(this.y));
  }

  public prepareTurn() {
    this._aliveNextTurn = this.aliveNextTurn;
  }

  public executeTurn() {
    // call prepareTurn first!
    this.alive = this._aliveNextTurn;
  }

  public draw(scale: number) {
    this.remove();
    const pos = this.paperPoint.multiply(scale).add(paper.view.center);
    this.layer = new paper.Layer();
    this.layer.fillColor = new paper.Color(1, 0, 0)
    this.layer.onClick = () => this.alive = !this.alive;
    this.polygon = new paper.Path.RegularPolygon(pos, 6, scale);
    this.polygon.strokeWidth = 1;
    this.polygon.strokeColor = new paper.Color("#000000");
    const text = new paper.PointText({});
    text.content = [this.x, this.y].join(", ");
    text.fontSize = scale / 2;
    text.position = pos;
    this.alive = this.alive;
  }

  public remove() {
    if (this.layer) this.layer.remove();
  }
}
