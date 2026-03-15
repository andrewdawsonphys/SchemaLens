import dagre from "dagre";

export class LayoutHandler {

    constructor() {
        this.nodes = [];
        this.edges = [];
        this.LAYOUT_DIRECTION = "TB";
        this.NODE_WIDTH = 280;
        this.NODE_HEIGHT = 64;
        this.COLUMN_ROW_HEIGHT = 32;
    }

    getNodeSize(node) {
      const columnCount = node?.data?.columns?.length ?? 0;
      return {
        width: this.NODE_WIDTH,
        height: this.NODE_HEIGHT + columnCount * this.COLUMN_ROW_HEIGHT,
      };
    }

    applyAutoLayout(nodes, edges) {
      const graph = new dagre.graphlib.Graph();
      graph.setDefaultEdgeLabel(() => ({}));
      graph.setGraph({
        rankdir: this.LAYOUT_DIRECTION,
        nodesep: 40,
        ranksep: 140,
        marginx: 24,
        marginy: 24,
      });
    
      nodes.forEach((node) => {
        const { width, height } = this.getNodeSize(node);
        graph.setNode(node.id, { width, height });
      });
    
      edges.forEach((edge) => {
        graph.setEdge(edge.source, edge.target);
      });
    
      dagre.layout(graph);
    
      return nodes.map((node) => {
        const { width, height } = this.getNodeSize(node);
        const layoutNode = graph.node(node.id);
    
        if (!layoutNode) {
          return node;
        }
    
        return {
          ...node,
          position: {
            x: layoutNode.x - width / 2,
            y: layoutNode.y - height / 2,
          },
        };
      });
    }
};
