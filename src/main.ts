// main.ts
// Author of the code: AI Assistant
// Author of the ideas: Roman G.
// Description: This module initializes and manages the interactive visualization
// of graph unfolding using D3.js. It handles loading genes, mapping nodes,
// updating the graph, and adding interactive features such as dragging and zooming.

import * as d3 from 'd3';
import { GUMGraph, GUMNode, GraphUnfoldingMachine, NodeState, ChangeTableItem, OperationCondition, Operation, OperationKindEnum } from './gum';

// Interface for Node
interface Node {
  id: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

// Interface for Link
interface Link {
  source: number | Node;
  target: number | Node;
}

// Set the dimensions for the SVG container
const width = 960;
const height = 600;

// Create an SVG container
const svg = d3.select("#canvas-container svg")
  .attr("width", width)
  .attr("height", height);

// Add a rectangle overlay to capture zoom events
const zoomOverlay = svg.append("rect")
  .attr("width", width)
  .attr("height", height)
  .attr("fill", "none")
  .attr("pointer-events", "all");

const graphGroup = svg.append("g");

// Add zoom behavior to the overlay
const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
  .scaleExtent([0.01, 10]) // Limit the zoom scale
  .on("zoom", (event) => {
    graphGroup.attr("transform", event.transform);
  });

// Use type assertion to ensure compatibility
(zoomOverlay as any).call(zoomBehavior as any);

// Initialize the force simulation
const simulation = d3.forceSimulation<Node, Link>()
  .force("link", d3.forceLink<Node, Link>()
    .id((d: Node) => d.id.toString())
    .distance(50)) // Adjust distance for stability
  .force("charge", d3.forceManyBody().strength(-300)) // Adjust strength for stability
  .force("center", d3.forceCenter(width / 2, height / 2))
  .velocityDecay(0.2); // Increase decay for stability

// Initialize nodes and links arrays
let nodes: Node[] = [{ id: 1, x: width / 2, y: height / 2 }];
let links: Link[] = [];

// Initialize GUM graph and machine
const gumGraph = new GUMGraph();
const gumMachine = new GraphUnfoldingMachine(gumGraph);

// Add an initial node to the GUM graph
const initialNode = new GUMNode(1, NodeState.A);
gumGraph.addNode(initialNode);

// Helper function to map string state to NodeState enum
function mapNodeState(state: string): NodeState {
  return NodeState[state as keyof typeof NodeState];
}

// Load the genes library from a JSON file
async function loadGenesLibrary() {
  try {
    const response = await fetch('data/demo_2010_dict_genes.json');
    const data = await response.json();
    const geneSelect = document.getElementById('gene-select') as HTMLSelectElement;

    // Populate the combo box with gene names
    for (const geneName in data.genes) {
      const option = document.createElement('option');
      option.value = geneName;
      option.text = geneName;
      geneSelect.add(option);
    }

    // Load the default gene
    loadGene(data.genes[geneSelect.value]);

    // Add event listener to handle gene selection
    geneSelect.addEventListener('change', (event) => {
      const selectedGene = (event.target as HTMLSelectElement).value;
      loadGene(data.genes[selectedGene]);
    });
    updateDebugInfo();
  } catch (error) {
    console.error("Error loading genes library:", error);
  }
}

// Function to load a specific gene
function loadGene(gene: any) {
  gumMachine.clearChangeTable();
  gene.forEach((item: any) => {
    const condition = new OperationCondition(
      mapNodeState(item.condition.currentState),
      mapNodeState(item.condition.priorState),
      item.condition.allConnectionsCount_GE,
      item.condition.allConnectionsCount_LE,
      item.condition.parentsCount_GE,
      item.condition.parentsCount_LE
    );

    const operation = new Operation(
      mapOperationKind(item.operation.kind),
      mapNodeState(item.operation.operandNodeState)
    );
    gumMachine.addChangeTableItem(new ChangeTableItem(condition, operation));
  });

  // Reset and start the graph
  resetGraph();
}

// Helper function to map string kind to OperationKindEnum
function mapOperationKind(kind: string): OperationKindEnum {
  switch (kind) {
    case "TurnToState": return OperationKindEnum.TurnToState;
    case "TryToConnectWithNearest": return OperationKindEnum.TryToConnectWithNearest;
    case "GiveBirthConnected": return OperationKindEnum.GiveBirthConnected;
    case "DisconectFrom": return OperationKindEnum.DisconectFrom;
    case "Die": return OperationKindEnum.Die;
    case "TryToConnectWith": return OperationKindEnum.TryToConnectWith;
    case "GiveBirth": return OperationKindEnum.GiveBirth;
    default: throw new Error(`Unknown operation kind: ${kind}`);
  }
}

// Map GUMNode to Node interface
function mapGUMNodeToNode(gumNode: GUMNode): Node {
  return {
    id: gumNode.id,
    x: gumNode.x,
    y: gumNode.y,
    vx: gumNode.vx,
    vy: gumNode.vy,
    fx: gumNode.fx,
    fy: gumNode.fy
  };
}

function update() {
  console.log("Updating graph with nodes:", nodes);
  console.log("Updating graph with links:", links);

  // Bind data for links
  const link = graphGroup.selectAll<SVGLineElement, Link>(".link")
    .data(links, d => `${(d.source as Node).id}-${(d.target as Node).id}`);

  // Enter new links
  link.enter().append("line")
    .attr("class", "link")
    .attr("stroke", "black")
    .attr("stroke-width", 2)
    .merge(link);

  // Update existing links
  link
    .attr("x1", d => (d.source as Node).x!)
    .attr("y1", d => (d.source as Node).y!)
    .attr("x2", d => (d.target as Node).x!)
    .attr("y2", d => (d.target as Node).y!);

  // Remove old links
  link.exit().remove();

  // Bind data for nodes
  const node = graphGroup.selectAll<SVGGElement, Node>(".node")
    .data(nodes, d => d.id.toString());

  // Enter new nodes
  const nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .call(d3.drag<SVGGElement, Node>()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  nodeEnter.append("circle")
    .attr("r", 5)
    .attr("fill", "red");

  nodeEnter.append("text")
    .attr("dy", 3)
    .attr("dx", -3)
    .text(d => d.id.toString());

  // Merge new nodes with existing nodes
  const mergedNodes = nodeEnter.merge(node);

  // Remove old nodes
  node.exit().remove();

  // Update simulation nodes and links
  simulation.nodes(nodes).on("tick", () => {
    link
      .attr("x1", d => (d.source as Node).x!)
      .attr("y1", d => (d.source as Node).y!)
      .attr("x2", d => (d.target as Node).x!)
      .attr("y2", d => (d.target as Node).y!);

    mergedNodes.select("circle")
      .attr("cx", d => d.x!)
      .attr("cy", d => d.y!);

    mergedNodes.select("text")
      .attr("x", d => d.x!)
      .attr("y", d => d.y!);
  });

  simulation.force<d3.ForceLink<Node, Link>>("link")!.links(links);

  // Smoothly restart the simulation
  simulation.alpha(0.5).restart();

  updateDebugInfo();
}

// Update the debug information displayed on the page
function updateDebugInfo() {
  const nodeCountElement = document.getElementById('node-count');
  const nodeDetailsElement = document.getElementById('node-details');
  const changeTableElement = document.getElementById('change-table');
  const statusInfoElement = document.getElementById('status-info');

  if (nodeCountElement) {
    nodeCountElement.textContent = `Nodes: ${nodes.length}`;
  }
  if (nodeDetailsElement) {
    const nodeDetails = gumGraph.getNodes().map(node => `
      <p>
        ID: ${node.id}<br>
        State: ${NodeState[node.state]}<br>
        Prior State: ${NodeState[node.priorState]}<br>
        Parents Count: ${node.parentsCount}<br>
        Connections Count: ${node.connectionsCount}
      </p>
    `).join('');
    nodeDetailsElement.innerHTML = nodeDetails;
  }
  if (changeTableElement) {
    const changeTableItems = gumMachine.getChangeTableItems();
    changeTableElement.textContent = `Change Table: ${JSON.stringify(changeTableItems, null, 2)}`;
  }
  if (statusInfoElement) {
    statusInfoElement.textContent = `Nodes: ${nodes.length} | Edges: ${links.length} | Iterations: ${gumMachine.getIterations()}`;
  }
}

// Unfold the graph using the Graph Unfolding Machine
function unfoldGraph() {
  console.log("Unfolding graph");

  // Run the Graph Unfolding Machine
  gumMachine.run();

  // Get the updated nodes and edges from GUMGraph
  const gumNodes = gumGraph.getNodes();
  const gumEdges = gumGraph.getEdges();

  console.log("Updated GUM nodes:", gumNodes);
  console.log("Updated GUM edges:", gumEdges);

  // Update nodes array
  nodes = gumNodes.map(gumNode => {
    let existingNode = nodes.find(node => node.id === gumNode.id);
    if (!existingNode) {
      const centerNode = nodes[0]; // Center node
      const angle = Math.random() * 2 * Math.PI; // Random angle
      const distance = Math.random() * 200; // Random distance within 200 pixels
      existingNode = mapGUMNodeToNode(gumNode);
      existingNode.x = centerNode.x! + distance * Math.cos(angle);
      existingNode.y = centerNode.y! + distance * Math.sin(angle);
    }
    return existingNode;
  });

  console.log("Updated nodes array:", nodes);

  // Update links array to reference node objects
  links = gumEdges.map(gumEdge => {
    const sourceNode = nodes.find(node => node.id === gumEdge.source.id) as Node;
    const targetNode = nodes.find(node => node.id === gumEdge.target.id) as Node;
    console.log(`Creating link from node ${sourceNode.id} to node ${targetNode.id}`);
    return { source: sourceNode, target: targetNode };
  });

  console.log("Updated links array:", links);

  // Immediately update the visualization
  update();
}

// Function to reset the graph to its initial state with a single node
function resetGraph() {
  nodes = [{ id: 1, x: width / 2, y: height / 2 }];
  links = [];
  gumGraph.getNodes().forEach(node => node.markedAsDeleted = true);
  gumGraph.removeMarkedNodes();
  gumGraph.addNode(new GUMNode(1, NodeState.A));
  update();
}

// Initial update of the graph
update();

// Load the genes library and start the unfolding process
loadGenesLibrary().then(() => {
  setInterval(unfoldGraph, 500);
});

// Drag event handlers for D3 nodes
function dragstarted(event: any, d: Node) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(event: any, d: Node) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragended(event: any, d: Node) {
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}