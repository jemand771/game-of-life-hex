import {EventEmitter, Injectable} from '@angular/core';
import * as paper from "paper";

const PAPER_SCALE = 40;
const COLOR_ALIVE = new paper.Color("#44aa44");
const COLOR_DEAD = new paper.Color("#ffffff");

@Injectable({
  providedIn: 'root'
})
export class GameStateService {

  nodes: Cell[] = [];
  needsRedraw = new EventEmitter<void>();

  constructor() {
    this.size = 4;
  }

  private _size = 0;

  public get size() {
    return this._size;
  }

  public set size(size: number) {
    if (size == this._size) return;
    if (size < this.size) {
      this.nodes.filter(node => node.ring >= size).forEach(node => node.remove());
      this.nodes = this.nodes.filter(node => node.ring < size);
      this.nodes.forEach(node => node.neighbours = node.neighbours.filter(neighbour => neighbour.ring <= size));
    } else {
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
      this.needsRedraw.emit();
    }
    this._size = size;
  }

  public findNode(x: number, y: number): Cell | undefined {
    return this.nodes.find(node => node.x === x && node.y === y);
  }

  public draw() {
    this.nodes.forEach(node => node.draw());
  }

  public tick() {
    this.nodes.forEach(node => node.prepareTurn());
    this.nodes.forEach(node => node.executeTurn());
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
    return xVect.multiply(this.x).add(yVect.multiply(this.y)).multiply(PAPER_SCALE).add(paper.view.center);
  }

  public prepareTurn() {
    this._aliveNextTurn = this.aliveNextTurn;
  }

  public executeTurn() {
    // call prepareTurn first!
    this.alive = this._aliveNextTurn;
  }

  public draw() {
    if (this.layer) return;
    const pos = this.paperPoint;
    this.layer = new paper.Layer();
    this.layer.fillColor = new paper.Color(1, 0, 0)
    this.layer.onClick = () => this.alive = !this.alive;
    this.polygon = new paper.Path.RegularPolygon(pos, 6, PAPER_SCALE);
    this.polygon.strokeWidth = 1;
    this.polygon.strokeColor = new paper.Color("#000000");
    const text = new paper.PointText({});
    text.content = [this.x, this.y].join(", ");
    text.position = pos;
    this.alive = this.alive;
  }

  public remove() {
    if (this.layer) this.layer.remove();
  }
}
