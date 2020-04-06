import * as React from 'react';
import {GridGraph} from '../library/datastructures'
import {generateRandomPointSet, delauny, numberOfPaths, formatNumber, largeNumberInfotext} from 'app/library/algorithms'
import {Canvas} from './Canvas';
import { observable, action, computed } from 'mobx';
import {observer} from 'mobx-react'
import { Automata } from '../simulators/interfaces';
import { NaivePathAutomata } from '../simulators/NaivePath';
import { DjikstraAutomata } from '../simulators/Djikstra';
import { round } from '../library/algorithms';

enum AutomataType {
  naive,
  djikstra
}

@observer
export class Container extends React.Component<{}, {}> {
  maxNodes: number = 7500;
  minNodes: number = 3;
  minSpeed: number = 1;
  maxSpeed: number = 50;
  @observable connectivity: number = 50;
  @observable graph: GridGraph;
  ratio: number = 2;
  gridWidth: number;
  gridHeight: number;
  gridSize: number;
  @observable sizeOfGraph: number;
  automata: Automata;
  @observable type: AutomataType;
  @observable numberOfPaths: number;
  canvas: Canvas;
  @observable speedSliderValue: number;
  speed: number;
  @computed get djikstraNaive() {return this.graph.nodes.size*this.graph.nodes.size;}
  @computed get djikstraPriorityQueue() {return Math.round(this.graph.numOfValidEdges*Math.log2(this.graph.nodes.size));}
  @computed get djikstraText() {
    if (this.type == AutomataType.djikstra) return (
      <>
      Naive Dijkstra's number of operations: <b>{formatNumber(this.djikstraNaive)}</b> (<b>{formatNumber(Math.round(this.numberOfPaths/this.djikstraNaive))}</b>  x less) <br/>
      Dijkstra with priority queue operations: <b>{formatNumber(this.djikstraPriorityQueue)}</b> (<b>{formatNumber(Math.round(this.numberOfPaths/this.djikstraPriorityQueue))}</b> x less)<br/>
      <br></br>
      </>
    );
    else return <></>;
  }
  constructor(props: any) {
    super(props);
    this.sizeOfGraph = 75;
    this.type = null;
    this.constructGraphWithSize(75);
    this.constructAutomata(AutomataType.naive);
  }

  @action
  constructGraphWithSize(numOfNodes: number) {
    this.gridHeight = Math.round(Math.sqrt(4*numOfNodes/this.ratio));
    this.gridWidth = Math.round(this.gridHeight*this.ratio);
    this.gridSize = this.gridWidth*this.gridHeight;
    this.constructGraph(numOfNodes);
  }

  @action
  constructGraph(numberOfNodes: number) {
    let points = generateRandomPointSet(this.gridWidth, this.gridHeight, numberOfNodes);
    let edges = delauny(points);
    this.graph = new GridGraph(this.gridWidth, this.gridHeight);
    this.graph.addNodes(points);
    this.graph.addEdges(edges);
    this.graph.initConnectivityAdjustments();
    if (this.canvas) this.canvas.setGraph(this.graph);
  }
  
  @action
  constructAutomata(type: AutomataType) {
    if (this.automata) this.automata.toggleRun(false);
    
    let startNode = this.graph.firstNode;
    let endNode = this.graph.lastNode;
    switch (type) {
      case AutomataType.naive:
      this.automata = new NaivePathAutomata(this.graph, startNode, endNode);
      break;
      case AutomataType.djikstra:
      this.automata = new DjikstraAutomata(this.graph, startNode, endNode);
      break;
    }
    if (this.canvas) this.canvas.setAutomata(this.automata);
    this.type = type;
    this.speedChanged(this.speed);
    this.changeConnectivity(this.connectivity);
    this.numberOfPaths = numberOfPaths(this.graph, this.automata.startNode);
  }

  componentDidMount() {
    this.canvas = this.refs.canvas as Canvas;
    this.canvas.setGraph(this.graph);
    this.canvas.setAutomata(this.automata);
  }

  logScaleSliders(min: number, max: number, value: number): number {
    let ratio: number = max/min;
    let result = Math.pow(ratio, value/100)*min;
    return result
  }

  @action
  speedChanged(value: number) {
    this.speedSliderValue = value;
    this.automata.setSpeed(1000/value);
  }

  changeNumOfNodes(input: string) {
    let num: number = parseInt(input);
    if (isNaN(num)) return;
    if (num < this.minNodes) this.sizeOfGraph = this.minNodes;
    else if (num > this.maxNodes) this.sizeOfGraph = this.maxNodes;
    else this.sizeOfGraph = num;
  }

  changeConnectivity(value: number) {
    this.connectivity = value;
    this.graph.setConnectivity(value/100);
    this.automata.reset();
    this.numberOfPaths = numberOfPaths(this.graph, this.automata.startNode);
  }

  render() {
    return (
      <>
      <div id="canvas" className="el" ref="container">
        <Canvas ref="canvas"/>
      </div>
      <div id="takeStep" className="el">
        <button type="button" onClick={()=>this.automata.next()}>Take step</button>
      </div>
      <div id="run" className="el">
      <button type="button" onClick={()=>this.automata.toggleRun()}>Toggle run</button>
      </div>
      <div id="speed" className="el">
        Simulation speed: <input type="range" className="range" min={this.minSpeed} max={this.maxSpeed} value={this.speedSliderValue} onChange={(e)=>{this.speedChanged(parseInt(e.target.value))}}/>
      </div>
      <div id="newGraph" className="el">
        <button type="button" onClick={()=>{
          this.constructGraphWithSize(this.sizeOfGraph);
          this.constructAutomata(this.type);
        }}>New Graph</button>
      </div>
      <div id="resetGraph" className="el">
        <button type="button" onClick={()=>this.automata.reset()}>Reset Graph</button>
      </div>
      <div id="complexity" className="el">
        Number of nodes: <input type="text" name="Number of nodes" onChange={(e)=>this.changeNumOfNodes(e.target.value)}/><br/>
        Connectivity: <input type="range" className="range" min={0} max={100} value={this.connectivity} onChange={(e)=>this.changeConnectivity(parseInt(e.target.value))}/>
      </div>
      <div id="naive" className="el">
        <button type="button" className={this.type==AutomataType.naive ? "selected" : ""} onClick={()=>{
          if (this.type != AutomataType.naive) this.constructAutomata(AutomataType.naive)
          }}>Naive</button>
      </div>
      <div id="djikstra" className="el">
        <button type="button" className={this.type==AutomataType.djikstra ? "selected" : ""} onClick={()=>{
          if (this.type != AutomataType.djikstra) this.constructAutomata(AutomataType.djikstra)
        }}>Dijkstra</button>
      </div>
      <div id="text" className="el">
          The graph has <b>{this.graph.nodes.size} nodes</b> and <b>{this.graph.numOfValidEdges} edges.</b><br/>
          <br/>
          There are at least <b>{formatNumber(this.numberOfPaths)} paths.</b><br/>
          {largeNumberInfotext(this.numberOfPaths)}<br/>
          {this.djikstraText}
          Length of shortest path found so far: <b>{this.automata.lowestCostFound == null ? "No path found" : round(this.automata.lowestCostFound, 2)}</b>
      </div>
      </>
    );
  }
}

export default Container;
