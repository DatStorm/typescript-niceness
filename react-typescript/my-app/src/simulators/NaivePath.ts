import { Point, GridGraph, Node } from 'app/library/datastructures'
import { GraphDrawer } from 'app/components/GraphDrawer'
import { nodeDist, round } from 'app/library/algorithms'
import { observable, autorun, action, computed } from 'mobx';
import { Automata, AutomataRenderer } from 'app/simulators/interfaces';

export class NaivePathAutomata implements Automata {
    graph: GridGraph;
    startNode: Node;
    endNode: Node;
    @observable nextStep: () => void;
    isRunning: boolean = false;
    runningSpeed: number = 1000;
    interval: number;

    @observable lowestCostFound: number = null;
    @observable shortestPathFound: Node[] = null; 2
    @observable pathStack: { node: Node, length: number, edgeTraversing: number }[] = [];
    @observable nodeCandidate: Node;
    @observable cycle: Node[] = [];
    currentPathLength: number = 0;

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
            this.interval = window.setInterval(() => this.next(), this.runningSpeed);
        }
    }

    toggleRun(toggle?: boolean) {
        if (toggle == null) this.isRunning = !this.isRunning;
        else this.isRunning = toggle;
        if (this.isRunning) {
            this.interval = window.setInterval(() => this.next(), this.runningSpeed);
        } else {
            window.clearInterval(this.interval);
        }
    }

    @action
    reset() {
        this.lowestCostFound = null;
        this.pathStack = [];
        this.nodeCandidate = null;
        this.cycle = [];
        this.nextStep = this.start;
        if (this.isRunning) {
            this.isRunning = false;
            window.clearInterval(this.interval);
        }
    }

    @computed
    get currentNode() {
        if (this.pathStack.length == 0) return null;
        return this.pathStack[this.pathStack.length - 1];
    }

    hasNext(): boolean {
        return this.nextStep != null;
    }

    @action
    start() {
        console.log("start");
        this.pathStack.push({ node: this.startNode, length: 0, edgeTraversing: 0 });
        this.nextStep = this.nextNode;
    }

    @action
    next() {
        if (this.nextStep) this.nextStep();
    }

    @action
    nextNode() {
        console.log("nextNode");
        this.cycle = [];
        this.nodeCandidate = null;
        while (this.currentNode.edgeTraversing < this.currentNode.node.adjList.length) {
            this.nodeCandidate = this.currentNode.node.adjList[this.currentNode.edgeTraversing];
            this.currentNode.edgeTraversing++;
            if (this.graph.edgeValid2(this.currentNode.node, this.nodeCandidate)) {
                this.nextStep = this.verifyNode;
                return;
            }
        }
        this.nodeCandidate = null;
        this.nextStep = this.popNode;
    }

    @action
    verifyNode() {
        console.log("verifyNode");
        for (let i = 0; i < this.pathStack.length; i++) {
            let node = this.pathStack[i].node;
            if (node == this.nodeCandidate) {
                //this.currentNode.edgeTraversing = Math.min(this.currentNode.node.adjList.length ,this.currentNode.edgeTraversing+1); //Ugly hack to fix bug....
                for (let j = i; j < this.pathStack.length; j++) {
                    this.cycle.push(this.pathStack[j].node);
                }
                this.cycle.push(this.pathStack[i].node);
                this.nextStep = this.nextNode;
                return;
            }
        }
        this.nextStep = this.addCandidate;
    }

    @action
    addCandidate() {
        console.log("addCandidate");
        let length = this.currentNode.length + nodeDist(this.currentNode.node.point, this.nodeCandidate.point);
        this.pathStack.push({ node: this.nodeCandidate, length: length, edgeTraversing: 0 });
        if (this.nodeCandidate == this.endNode) {
            if (this.lowestCostFound == null || length < this.lowestCostFound) {
                this.lowestCostFound = length;
                this.shortestPathFound = this.pathStack.map((x) => x.node);
            }
        }
        this.nodeCandidate = null;
        this.nextStep = this.nextNode;
    }

    @action
    popNode() {
        this.pathStack.pop();
        if (this.pathStack.length == 0) this.nextStep = this.end;
        else this.nextStep = this.nextNode;
    }

    @action
    end() {
        this.nextStep = null;
        this.toggleRun(false);
    }
}

export class NaivePathRenderer implements AutomataRenderer {
    @observable automata: NaivePathAutomata;
    graphDrawer: GraphDrawer;
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;

    constructor(naive: NaivePathAutomata,
        graphDrawer: GraphDrawer,
        ctx: CanvasRenderingContext2D) {
        this.automata = naive;
        this.graphDrawer = graphDrawer;
        this.ctx = ctx;
        autorun(() => this.renderAutomata());
    }

    @computed
    get path(): Point[] {
        let result: Point[] = [];
        for (let i = 0; i < this.automata.pathStack.length; i++) {
            result.push(this.automata.pathStack[i].node.point);
        }
        return result;
    }

    renderAutomata() {
        //this.graphDrawer.redraw();
        this.ctx.clearRect(0, 0, this.ctx.canvas.clientWidth, this.ctx.canvas.clientHeight);
        this.graphDrawer.drawCanvas();

        this.ctx.strokeStyle = "rgb(66, 138, 255)";
        this.ctx.lineWidth = 2.5;
        for (let i = 0; i < this.automata.pathStack.length; i++) {
            const nodeInfo = this.automata.pathStack[i];
            for (let j = 0; j < nodeInfo.edgeTraversing; j++) {
                this.graphDrawer.drawEdgeNode(nodeInfo.node, nodeInfo.node.adjList[j]);
            }
        }

        this.ctx.strokeStyle = "blue";
        this.ctx.lineWidth = 2;
        this.graphDrawer.drawLinePoint(this.path);

        for (let i = 0; i < this.automata.pathStack.length; i++) {
            const nodeInfo = this.automata.pathStack[i];
            this.graphDrawer.drawCircleNode(nodeInfo.node, "rgb(70, 126, 219)");
            this.ctx.fillStyle = "14px black"
            this.graphDrawer.drawTextNode(round(nodeInfo.length, 2) + "", nodeInfo.node);
        }

        this.ctx.strokeStyle = "red";
        this.ctx.lineWidth = 2.5;
        this.graphDrawer.drawLineNode(this.automata.cycle);

        if (this.automata.nextStep == null) {
            this.ctx.strokeStyle = "green";
            this.graphDrawer.drawLineNode(this.automata.shortestPathFound);
        }

        this.graphDrawer.drawGraph();

        this.graphDrawer.drawCircleNode(this.automata.endNode, "black");
        this.graphDrawer.drawCircleNode(this.automata.startNode, "orange");

        if (this.automata.nodeCandidate) {
            this.graphDrawer.drawCircleNode(this.automata.nodeCandidate, "yellow");
        }
    }

}