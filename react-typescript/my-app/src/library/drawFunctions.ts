import { Point } from './datastructures'

export function drawLine(ctx: CanvasRenderingContext2D, points: Point[]) {
    if (points.length == 0) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        let point = points[i];
        ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
}

export function drawCircle(ctx: CanvasRenderingContext2D, center: Point, radius: number) {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
    ctx.fill();
}

export function drawCircleWithBorder(ctx: CanvasRenderingContext2D, center: Point, color: string, radius: number) {
    ctx.fillStyle = "grey";
    drawCircle(ctx, center, radius);
    ctx.fillStyle = color;
    drawCircle(ctx, center, radius - 1);
}

export function drawCirclePerimeter(ctx: CanvasRenderingContext2D, center: Point, radius: number) {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
    ctx.stroke();
}
