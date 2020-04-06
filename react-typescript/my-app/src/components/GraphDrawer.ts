import { Point, GridGraph, Node, Edge } from 'app/library/datastructures'
import { drawCircle, drawLine, drawCircleWithBorder } from 'app/library/drawFunctions'
import { computed, autorun } from 'mobx';

export class GraphDrawer {
    ctx: CanvasRenderingContext2D;
    graph: GridGraph;
    width: number;
    height: number;

    constructor(ctx: CanvasRenderingContext2D,
        graph: GridGraph) {
        this.ctx = ctx;
        this.graph = graph;
        this.width = this.ctx.canvas.clientWidth;
        this.height = this.ctx.canvas.clientHeight;
        autorun(() => this.redraw());
    }

    @computed
    get lineSpacing(): number {
        return this.width / (this.graph.gridWidth + 1);
    }

    @computed
    get nodeRadius(): number {
        return this.lineSpacing * 0.35;
    }

    pointConverter(p: Point): Point {
        return { x: (p.x + 1) * this.lineSpacing, y: (p.y + 1) * this.lineSpacing };
    }

    redraw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawCanvas();
        this.drawGraph();
    }

    drawCanvas() {
        this.ctx.strokeStyle = "rgb(242, 242, 242)";
        this.ctx.lineWidth = 1;
        for (let x = this.lineSpacing; x < this.width; x += this.lineSpacing) {
            drawLine(this.ctx, [{ x: x, y: 0 }, { x: x, y: this.height }]);
        }
        for (let y = this.lineSpacing; y < this.height; y += this.lineSpacing) {
            drawLine(this.ctx, [{ x: 0, y: y }, { x: this.width, y: y }]);
        }
    }

    drawGraph() {
        this.drawEdges();
        this.drawNodes();
    }

    drawNode(color: string, center: Point) {
        let convertedCenter = this.pointConverter(center);
        this.ctx.fillStyle = "grey";
        drawCircle(this.ctx, convertedCenter, this.nodeRadius);
        this.ctx.fillStyle = color;
        drawCircle(this.ctx, convertedCenter, this.nodeRadius);
    }

    drawNodes() {
        this.ctx.fillStyle = 'green';
        this.graph.nodes.forEach((node, point, map) => {
            this.drawNode("grey", node.point);
        })
    }

    drawEdges() {
        this.ctx.strokeStyle = "grey";
        this.ctx.lineWidth = 1.25;
        this.graph.edges.forEach((value, key, map) => {
            if (this.graph.edgeValid(value)) this.drawLinePoint([value.node1, value.node2]);
        });
    }

    convertPoints(points: Point[]): Point[] {
        let convertedPoints: Point[] = [];
        for (let i = 0; i < points.length; i++) {
            convertedPoints.push(this.pointConverter(points[i]));
        }
        return convertedPoints;
    }

    drawCirclePoint(center: Point, color: string, radius?: number) {
        if (!radius) radius = this.nodeRadius;
        drawCircleWithBorder(this.ctx, this.pointConverter(center), color, radius);
    }

    drawCircleNode(center: Node, color: string, radius?: number) {
        if (!radius) radius = this.nodeRadius;
        drawCircleWithBorder(this.ctx, this.pointConverter(center.point), color, radius);
    }

    drawNodeSet(nodes: Set<Node>, color: string, radius?: number) {
        for (let node of Array.from(nodes.values())) {
            this.drawCircleNode(node, color, radius);
        }
    }

    drawLinePoint(points: Point[]) {
        drawLine(this.ctx, this.convertPoints(points));
    }

    drawLineNode(nodes: Node[]) {
        let points: Point[] = [];
        for (let i = 0; i < nodes.length; i++) {
            points.push(this.pointConverter(nodes[i].point));
        }
        drawLine(this.ctx, points);
    }

    drawEdge(edge: Edge) {
        if (this.graph.edgeValid(edge)) this.drawLinePoint([edge.node1, edge.node2]);
    }

    drawEdgeNode(node1: Node, node2: Node) {
        if (node1 == undefined || node2 == undefined) console.log({ node1, node2 });
        if (this.graph.edgeValid2(node1, node2)) this.drawLineNode([node1, node2]);
    }

    drawTextPoint(text: string, point: Point) {
        const convertedPoint = this.pointConverter(point);
        this.ctx.fillText(text, convertedPoint.x, convertedPoint.y);
    }

    drawTextNode(text: string, node: Node) {
        const convertedPoint = this.pointConverter(node.point);
        this.ctx.fillText(text, convertedPoint.x - 8, convertedPoint.y + 5);
    }
}