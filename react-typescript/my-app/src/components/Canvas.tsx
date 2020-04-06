import * as React from 'react';
import { GridGraph } from 'src/library/datastructures';
import { GraphDrawer } from './GraphDrawer';
import { observer } from 'mobx-react';
import { action, computed } from 'mobx';
import { NaivePathRenderer, NaivePathAutomata } from 'app/simulators/NaivePath';
import { AutomataRenderer, Automata } from 'app/simulators/interfaces';
import { DjikstraAutomataRenderer, DjikstraAutomata } from 'app/simulators/Djikstra';

@observer
export class Canvas extends React.Component<{}, {}> {
	ctx: CanvasRenderingContext2D;
	graphDrawer: GraphDrawer;
	automataRenderer: AutomataRenderer;

	componentDidMount() {
		this.ctx = (this.refs.canvas as HTMLCanvasElement).getContext('2d');
	}

	@action
	setGraph(graph: GridGraph) {
		this.graphDrawer = new GraphDrawer(this.ctx, graph);
		if (this.automataRenderer) this.automataRenderer.graphDrawer = this.graphDrawer;
	}

	@action
	setAutomata(automata: Automata) {
		if (!this.graphDrawer) return;
		if (automata instanceof NaivePathAutomata)
			this.automataRenderer = new NaivePathRenderer(automata, this.graphDrawer, this.ctx);
		else if (automata instanceof DjikstraAutomata)
			this.automataRenderer = new DjikstraAutomataRenderer(automata, this.graphDrawer, this.ctx);
	}

	@computed
	get width(): number {
		return window.innerWidth;
	}

	@computed
	get height(): number {
		return this.width / 2;
	}

	render() {
		return <canvas width={this.width} height={this.height} className="graphCanvas" ref="canvas" />;
	}
}

export default Canvas;
