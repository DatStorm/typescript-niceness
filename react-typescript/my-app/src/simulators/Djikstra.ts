import {GridGraph, Node} from 'app/library/datastructures'
import {GraphDrawer} from 'app/components/GraphDrawer'
import { nodeDist, nodeHash, round} from 'app/library/algorithms'
import { observable, autorun, action } from 'mobx';
import { AutomataRenderer, Automata } from 'app/simulators/interfaces';

export class DjikstraAutomata implements Automata{
  graph: GridGraph;
  startNode: Node;
  endNode: Node;
  nextStep: ()=>void;
  isRunning: boolean = false;
  runningSpeed: number = 1000;
  interval: number;

  @observable lowestCostFound: number = null;
  @observable visited: Set<Node> = new Set();
  @observable considering: Set<Node> = new Set();
  @observable lengths: Map<number, number> = new Map();
  @observable parents: Map<number, number> = new Map();
  @observable currentNode: Node = null;
  
  constructor(graph: GridGraph, startNode: Node, endNode: Node) {
    this.graph = graph;
    this.startNode = startNode;
    this.endNode = endNode;
    this.nextStep = this.start;
  }

  setSpeed(runningSpeed: number) {
    this.runningSpeed = runningSpeed;
    if (this.isRunning) {
      window.clearInterval(this.interval);
      this.interval = window.setInterval(()=>this.next(), this.runningSpeed);
    }
  }

  toggleRun(toggle?: boolean) {
    if (toggle == null) this.isRunning = !this.isRunning;
    else this.isRunning = toggle;
    if (this.isRunning) {
      this.interval = window.setInterval(()=>this.next(), this.runningSpeed);
    } else {
      window.clearInterval(this.interval);
    }
  }

  reset() {
    this.lowestCostFound = null;
    this.nextStep = this.start;
    this.considering = new Set();
    this.visited = new Set();
    this.lengths = new Map();
    this.currentNode = null;
    if (this.isRunning) {
      this.isRunning = false;
      window.clearInterval(this.interval);
    }
  }

  @action
  next() {
    if (this.nextStep) this.nextStep();
  }
  
  hasNext() {
    return this.nextStep != null;
  }
  
  @action
  start() {
    this.considering.add(this.startNode);
    this.lengths.set(nodeHash(this.startNode), 0);
    this.nextStep = this.findSmallest;
  }

  @action
  findSmallest() {
    let smallest: Node = null;
    for (let node of Array.from(this.considering.values())) {
      if (!smallest) {
        smallest = node;
      } else {
        if (this.lengths.get(nodeHash(node)) < this.lengths.get(nodeHash(smallest))) smallest = node;
      }
    }
    this.currentNode = smallest;
    if (this.currentNode == this.endNode) {
      this.nextStep = this.end;
      this.lowestCostFound = this.lengths.get(nodeHash(this.endNode));
    }
    else this.nextStep = this.addNeighbors;
  }

  @action
  addNeighbors() {
    for (let i=0; i<this.currentNode.adjList.length; i++) {
      let neighbor: Node = this.currentNode.adjList[i];
      
      if (!this.graph.edgeValid2(this.currentNode, neighbor)) continue;
      
      let distance: number = this.lengths.get(nodeHash(this.currentNode)) + nodeDist(this.currentNode.point, neighbor.point);
      
      if (!this.lengths.has(nodeHash(neighbor))) {
        this.lengths.set(nodeHash(neighbor), distance);
        this.considering.add(neighbor);
        this.parents.set(nodeHash(neighbor), nodeHash(this.currentNode));
      } else if (this.lengths.get(nodeHash(neighbor)) > distance) {
        this.lengths.set(nodeHash(neighbor), distance);
        this.parents.set(nodeHash(neighbor), nodeHash(this.currentNode));
      }
    }
    this.considering.delete(this.currentNode);
    this.visited.add(this.currentNode);
    this.currentNode = null;
    this.nextStep = this.findSmallest;
  }

  @action
  end() {
    this.nextStep = null;
    this.toggleRun(false)
  }
}
 
export class DjikstraAutomataRenderer implements AutomataRenderer {
  @observable automata: DjikstraAutomata;
  graphDrawer: GraphDrawer;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;

  constructor(djikstra: DjikstraAutomata,
              graphDrawer: GraphDrawer,
              ctx: CanvasRenderingContext2D) {
    this.automata = djikstra;
    this.graphDrawer = graphDrawer;
    this.ctx = ctx;
    autorun(()=>this.renderAutomata());
  }

  renderAutomata() {
    this.graphDrawer.redraw();
    
    this.drawPath();

    //this.ctx.fillStyle = "black";
    this.graphDrawer.drawCircleNode(this.automata.endNode, "black");
    
    //this.ctx.fillStyle = "white";
    this.graphDrawer.drawNodeSet(this.automata.visited, "white");
    
    //this.ctx.fillStyle = "rgb(114, 167, 249)";
    this.graphDrawer.drawNodeSet(this.automata.considering, "rgb(114, 167, 249)");
    
    //this.ctx.fillStyle = "orange";
    this.graphDrawer.drawCircleNode(this.automata.startNode, "orange");
    
    this.ctx.font = "12px Helvetica";
    this.ctx.fillStyle = "green";
    for (let node of Array.from(this.automata.visited.values())) {
      this.graphDrawer.drawTextNode(round(this.automata.lengths.get(nodeHash(node)),1)+"", node);
    }
    
    //this.ctx.fillStyle = "rgb(186, 7, 7)";
    if (this.automata.currentNode) this.graphDrawer.drawCircleNode(this.automata.currentNode, "rgb(186, 7, 7)");
    
    this.ctx.font = "12px Helvetica";
    this.ctx.fillStyle = "black"
    for (let node of Array.from(this.automata.considering.values())) {
      this.graphDrawer.drawTextNode(round(this.automata.lengths.get(nodeHash(node)), 1)+"", node);
    }
    
  }

  drawPath() {
    let currentNode = this.automata.currentNode;
    if (!currentNode) return;
    let path: Node[] = [];
    while (true) {
      path.push(currentNode);
      if (!this.automata.parents.has(nodeHash(currentNode))) break;
      let parentHash = this.automata.parents.get(nodeHash(currentNode));
      currentNode = this.automata.graph.nodes.get(parentHash);
    }
    if (this.automata.currentNode == this.automata.endNode) this.ctx.strokeStyle = "green";
    else this.ctx.strokeStyle = "blue";
    this.ctx.lineWidth = 2.5;
    this.graphDrawer.drawLineNode(path);
  }

}