import { pointHash, nodeHash, orderEdge, edgeHash, shuffleArray } from "./algorithms";
import { computed, observable } from "mobx";

export interface Point {
    x: number,
    y: number
};

export class Node {
    point: Point;
    adjSet: Set<Node> = new Set();
    adjList: Node[] = [];

    constructor(point: Point) {
        this.point = point;
    }

    addNeighbor(node: Node) {
        if (this.adjSet.has(node)) return;
        this.adjSet.add(node);
        this.adjList.push(node);
    }
}

export class Edge {
    node1: Point;
    node2: Point;
    length: number;
    constructor(node1: Point, node2: Point) {
        this.node1 = node1;
        this.node2 = node2;
        this.length = Math.sqrt(Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2));
    }
}

export class GridGraph {
    gridWidth: number;
    gridHeight: number;
    gridSize: number;
    nodes: Map<number, Node> = new Map();
    edges: Map<number, Edge> = new Map();
    spanningTree: Map<number, Edge> = new Map();
    nonSpanningTreeEdges: Map<number, number> = new Map();
    maxConnectivity: number;
    @observable validEdgeIndex: number;
    firstNode: Node;
    lastNode: Node;

    constructor(gridWidth: number, gridHeight: number) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.gridSize = gridWidth * gridHeight;
    }

    @computed
    get numOfValidEdges(): number {
        return this.spanningTree.size + this.validEdgeIndex;
    }

    hasNode(point: Point) {
        return this.nodes.has(pointHash(point));
    }

    getNode(point: Point) {
        return this.nodes.get(pointHash(point));
    }

    hasEdge(edge: Edge) {
        return this.edges.has(edgeHash(edge));
    }

    verifyPoint(point: Point): boolean {
        return 0 <= point.x && point.x < this.gridWidth && 0 <= point.y && point.y < this.gridHeight;
    }

    addNode(point: Point) {
        if (!this.verifyPoint(point)) {
            return;
        }
        if (this.hasNode(point)) {
            return;
        }
        this.nodes.set(pointHash(point), new Node(point));
        this.updateFirstLast(this.nodes.get(pointHash(point)));
    }

    updateFirstLast(node: Node) {
        if (this.firstNode == null) this.firstNode = node;
        else if (nodeHash(node) < nodeHash(this.firstNode)) this.firstNode = node;

        if (this.lastNode == null) this.lastNode = node;
        else if (nodeHash(this.lastNode) < nodeHash(node)) this.lastNode = node;
    }

    addNodes(points: Point[]) {
        for (let i = 0; i < points.length; i++) {
            this.addNode(points[i]);
        }
    }

    addEdge(point1: Point, point2: Point) {
        if (pointHash(point1) == pointHash(point2)
            || !this.verifyPoint(point1)
            || !this.verifyPoint(point2)
            || !this.hasNode(point1)
            || !this.hasNode(point2)) return;

        let edge = orderEdge(new Edge(point1, point2));
        if (this.hasEdge(edge)) return;
        this.edges.set(edgeHash(edge), edge);

        let node1 = this.getNode(point1);
        let node2 = this.getNode(point2);
        node1.adjList.push(node2);
        node2.adjList.push(node1);
    }

    addEdges(edges: Edge[]) {
        for (let i = 0; i < edges.length; i++) {
            this.addEdge(edges[i].node1, edges[i].node2);
        }
    }

    calculateSpanningTree() {
        let node: Node = this.nodes.values().next().value;
        let queue: Node[] = [node];
        let visited: Set<number> = new Set();
        visited.add(nodeHash(node));
        this.spanningTree = new Map();
        let queueIndex = 0;
        while (queueIndex < queue.length) {
            node = queue[queueIndex];
            for (let i = 0; i < node.adjList.length; i++) {
                let neighbor: Node = node.adjList[i];
                if (visited.has(nodeHash(neighbor))) continue;

                queue.push(neighbor);
                let edge = orderEdge(new Edge(node.point, neighbor.point));
                this.spanningTree.set(edgeHash(edge), edge);
                visited.add(nodeHash(neighbor));
            }
            queueIndex++;
        }
    }

    calculateNonSpanTreeEdges() {
        let edges: Edge[] = [];
        for (let edge of this.edges.values()) {
            if (this.spanningTree.has(edgeHash(edge))) continue;
            edges.push(edge);
        }
        shuffleArray(edges);
        for (let i = 0; i < edges.length; i++) {
            this.nonSpanningTreeEdges.set(edgeHash(edges[i]), i);
        }
        this.maxConnectivity = edges.length;
        this.validEdgeIndex = this.maxConnectivity;
    }

    initConnectivityAdjustments() {
        this.calculateSpanningTree();
        this.calculateNonSpanTreeEdges();
    }

    edgeValid(edge: Edge): boolean {
        edge = orderEdge(edge);
        if (this.validEdgeIndex == null) return true;
        if (!this.nonSpanningTreeEdges.has(edgeHash(edge))) return true;
        return this.nonSpanningTreeEdges.get(edgeHash(edge)) < this.validEdgeIndex;
    }

    edgeValid2(node1: Node, node2: Node): boolean {
        return this.edgeValid(new Edge(node1.point, node2.point));
    }

    setConnectivity(connectivity: number) {
        this.validEdgeIndex = Math.round(this.maxConnectivity * connectivity);
    }
}