import { Point, Edge, GridGraph, Node } from './datastructures'
import Delaunator from 'delaunator';

const PRIME1 = 99181;
const PRIME2 = 6197;

export function pointHash(point: Point): number {
    return point.x * PRIME1 + point.y;
}

export function nodeHash(node: Node): number {
    return pointHash(node.point);
}

export function edgeHash(edge: Edge): number {
    return PRIME2 * pointHash(edge.node1) + pointHash(edge.node2);
}

export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function round(num: number, decimals: number) {
    const magnitude = Math.pow(10, decimals);
    return Math.round(num * magnitude) / magnitude;
}

export function generateRandomSubset(totalSize: number, subsetSize: number): Set<number> {
    if (subsetSize > totalSize) throw Error();
    let result = new Set();
    for (let j = totalSize - subsetSize; j <= totalSize; j++) {
        let t = getRandomInt(1, j);
        if (!result.has(t)) result.add(t);
        else result.add(j);
    }

    return result;
}

export function generateRandomPointSet(gridWidth: number, gridHeight: number, numOfNodes: number): Point[] {
    let randomSubset = generateRandomSubset(gridWidth * gridHeight, numOfNodes);
    let points: Point[] = [];
    randomSubset.forEach((num, num_, set) => {
        points.push({ x: num % gridWidth, y: Math.floor(num / gridWidth) });
    })
    return points;
}

export function triangleIndexToUnorderedPair(num: number, index: number): { x: number, y: number } {
    let x: number;
    let y: number;
    for (let firstNum = 0; firstNum < num - 1; firstNum++) {
        let ceil = (firstNum + 1) * num - (firstNum + 1) * (firstNum + 2) / 2;
        if (index > ceil) {
            continue;
        }
        x = firstNum;
        y = num - 1 - (ceil - index);
        break;
    }
    if (x > num - 1) console.log({ num, x });
    if (y > num - 1) console.log({ num, y });
    if (x == y) throw Error();
    return { x: x, y: y };
}

export function generateRandomGraph(gridWidth: number,
    gridHeight: number,
    numOfNodes: number,
    numOfEdges: number): GridGraph {
    let points = generateRandomPointSet(gridWidth, gridHeight, numOfNodes);
    let edges: Edge[] = [];
    let graph = new GridGraph(gridWidth, gridHeight);

    let numOfUnorderedPairs = numOfNodes * (numOfNodes - 1) / 2;
    let randomNumSet = generateRandomSubset(numOfUnorderedPairs, numOfEdges);

    for (let entry of randomNumSet.values()) {
        let pair = triangleIndexToUnorderedPair(numOfNodes, entry);
        edges.push(new Edge(points[pair.x], points[pair.y]));
    }

    graph.addNodes(points);
    graph.addEdges(edges);

    return graph;
}

export function nodeDist(point1: Point, point2: Point): number {
    const val = 1000 * Math.sqrt(135 * point1.x + 1007 * point2.x + 17 * point1.y + 9605 * point2.y);
    const factor = (val - Math.floor(val)) * 1.5 + 0.5
    return factor * (Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)));
}

export function delauny(points: Point[]): Edge[] {
    let pointFormatted = []
    let edges: Edge[] = [];
    for (let i = 0; i < points.length; i++) {
        pointFormatted.push([points[i].x, points[i].y]);
    }
    const triangles = Delaunator.from(pointFormatted).triangles;

    for (let i = 0; i < triangles.length; i += 3) {
        edges.push(new Edge(points[triangles[i]], points[triangles[i + 1]]));
        edges.push(new Edge(points[triangles[i + 1]], points[triangles[i + 2]]));
        edges.push(new Edge(points[triangles[i + 2]], points[triangles[i]]));
    }

    return edges;
}


export function numberOfPaths(graph: GridGraph, start: Node): number {
    let map: Map<number, number> = new Map();
    let visited: Set<number> = new Set();
    let queue: Node[] = [start];
    map.set(nodeHash(start), 1);
    let queueIndex = 0;

    while (queueIndex < queue.length) {
        let currentNode = queue[queueIndex];
        visited.add(nodeHash(currentNode));
        let numPaths = map.get(nodeHash(currentNode));

        for (let i = 0; i < currentNode.adjList.length; i++) {
            let neighbor: Node = currentNode.adjList[i];
            if (!graph.edgeValid2(currentNode, neighbor)) continue;
            if (visited.has(nodeHash(neighbor))) continue;
            let hash = nodeHash(neighbor);

            if (map.has(hash)) {
                map.set(hash, map.get(hash) + numPaths);
            } else {
                map.set(hash, numPaths);
                queue.push(neighbor);
            }

        }

        queueIndex++;
    }

    let result = 0;
    for (let paths of map.values()) {
        result += paths;
    }

    return result;
}

export function formatNumberCommaSep(num: number): string {
    let numString = num + "";
    let resultString = "";

    for (let i = numString.length - 1; i >= 0; i -= 3) {
        let j = Math.max(0, i - 2);
        if (resultString.length == 0) resultString = numString.slice(j, i + 1);
        else resultString = numString.slice(j, i + 1).concat(",", resultString);
    }

    return resultString;
}

export function formatNumber(num: number): string {
    if (num < Math.pow(10, 12)) return formatNumberCommaSep(num);
    let exponent = Math.floor(Math.log10(num));
    let numString = num / Math.pow(10, exponent - 3) + "";
    return numString[0] + "." + numString.slice(1, 4) + "·10e" + exponent;
}

export function magnitudeDifference(small: number, large: number): string {
    let ratio = large / small;
    let magnitude = Math.floor(Math.log10(ratio));
    if (magnitude < 1) return "";
    return " " + formatNumber(Math.pow(10, magnitude)) + " times";
}

export function largeNumberInfotext(num: number): string {
    let ants = Math.pow(10, 15);
    let sandGrains = Math.pow(10, 19);
    let oceanL = Math.pow(10, 21);
    let worldKg = 6 * Math.pow(10, 24);
    let worldg = worldKg * 1000;
    let sunKg = 2 * Math.pow(10, 30);
    let sung = 1000 * sunKg; // 2*10^33
    let milkyWayKg = sunKg * Math.pow(10, 12); // 2*10^45
    let milkyWayg = milkyWayKg * 1000 //2*10^48
    let earthAtoms = 1.33 * Math.pow(10, 50);
    let solarAtoms = 1.2 * Math.pow(10, 56);
    let milkyWayAtoms = 2.4 * Math.pow(10, 67);
    let universeAtoms = Math.pow(10, 80);

    if (num < ants) return "";
    if (num < sandGrains) return "This is more than" + magnitudeDifference(ants, num) + " the number of ants in the world";
    if (num < oceanL) return "This is more than" + magnitudeDifference(sandGrains, num) + " the number grains of sand in the world";
    if (num < worldKg) return "This is more than" + magnitudeDifference(oceanL, num) + " liters of water in the worlds oceans";
    if (num < worldg) return "This is more than" + magnitudeDifference(worldKg, num) + " the Earth's mass in Kg";
    if (num < sunKg) return "This is more than" + magnitudeDifference(worldg, num) + " the Earth's mass in g";
    if (num < sung) return "This is more than" + magnitudeDifference(sunKg, num) + " the sun's mass in Kg";
    if (num < milkyWayKg) return "This is more than" + magnitudeDifference(sung, num) + " the sun's mass in g";
    if (num < milkyWayg) return "This is more than" + magnitudeDifference(milkyWayKg, num) + " the Milky Way's mass in kg";
    if (num < earthAtoms) return "This is more than" + magnitudeDifference(milkyWayg, num) + " the Milky Way's mass in g";
    if (num < solarAtoms) return "This is more than" + magnitudeDifference(earthAtoms, num) + " the number of atoms in the Earth";
    if (num < milkyWayAtoms) return "This is more than" + magnitudeDifference(solarAtoms, num) + " the number of atoms in the Sun";
    if (num < universeAtoms) return "This is more than" + magnitudeDifference(milkyWayAtoms, num) + " the number of atoms in the Milky Way";
    return "This is more than" + magnitudeDifference(universeAtoms, num) + " the number of atoms in the observable universe";
}

export function orderEdge(edge: Edge): Edge {
    if (edge.node1.x < edge.node2.x) return edge;
    if (edge.node2.x < edge.node1.x) return new Edge(edge.node2, edge.node1);
    if (edge.node1.y <= edge.node2.y) return edge;
    return new Edge(edge.node2, edge.node1);
}

export function shuffleArray<T>(array: T[]) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}