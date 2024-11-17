// gum.ts

export enum NodeState {
    Max = 255,
    Min = 0,
    Ignored = 0,
    Unknown = 254,
    A = 1, B = 2, C = 3, D = 4, E = 5, F = 6, G = 7, H = 8, I = 9,
    J = 10, K = 11, L = 12, M = 13, N = 14, O = 15, P = 16, Q = 17, R = 18, S = 19,
    T = 20, U = 21, V = 22, W = 23, X = 24, Y = 25, Z = 26, s27 = 27, s28 = 28, s29 = 29,
    s30 = 30, s31 = 31, s32 = 32, s33 = 33, s34 = 34, s35 = 35, s36 = 36, s37 = 37, s38 = 38, s39 = 39,
    s40 = 40, s41 = 41, s42 = 42, s43 = 43, s44 = 44, s45 = 45, s46 = 46, s47 = 47, s48 = 48, s49 = 49,
    s50 = 50, s51 = 51, s52 = 52, s53 = 53, s54 = 54, s55 = 55, s56 = 56, s57 = 57, s58 = 58, s59 = 59,
    s60 = 60, s61 = 61, s62 = 62, s63 = 63, s64 = 64, s65 = 65, s66 = 66, s67 = 67, s68 = 68, s69 = 69,
    s70 = 70, s71 = 71, s72 = 72, s73 = 73, s74 = 74, s75 = 75, s76 = 76, s77 = 77, s78 = 78, s79 = 79,
    s80 = 80, s81 = 81, s82 = 82, s83 = 83, s84 = 84, s85 = 85, s86 = 86, s87 = 87, s88 = 88, s89 = 89,
    s90 = 90, s91 = 91, s92 = 92, s93 = 93, s94 = 94, s95 = 95, s96 = 96, s97 = 97, s98 = 98, s99 = 99,
    s100 = 100, s101 = 101, s102 = 102, s103 = 103, s104 = 104, s105 = 105, s106 = 106, s107 = 107, s108 = 108, s109 = 109,
    s110 = 110, s111 = 111, s112 = 112, s113 = 113, s114 = 114, s115 = 115, s116 = 116, s117 = 117, s118 = 118, s119 = 119,
    s120 = 120, s121 = 121, s122 = 122, s123 = 123, s124 = 124, s125 = 125, s126 = 126, s127 = 127, s128 = 128, s129 = 129,
    s130 = 130, s131 = 131, s132 = 132, s133 = 133, s134 = 134, s135 = 135, s136 = 136, s137 = 137, s138 = 138, s139 = 139,
    s140 = 140, s141 = 141, s142 = 142, s143 = 143, s144 = 144, s145 = 145, s146 = 146, s147 = 147, s148 = 148, s149 = 149,
    s150 = 150, s151 = 151, s152 = 152, s153 = 153, s154 = 154, s155 = 155, s156 = 156, s157 = 157, s158 = 158, s159 = 159,
    s160 = 160, s161 = 161, s162 = 162, s163 = 163, s164 = 164, s165 = 165, s166 = 166, s167 = 167, s168 = 168, s169 = 169,
    s170 = 170, s171 = 171, s172 = 172, s173 = 173, s174 = 174, s175 = 175, s176 = 176, s177 = 177, s178 = 178, s179 = 179,
    s180 = 180, s181 = 181, s182 = 182, s183 = 183, s184 = 184, s185 = 185, s186 = 186, s187 = 187, s188 = 188, s189 = 189,
    s190 = 190, s191 = 191, s192 = 192, s193 = 193, s194 = 194, s195 = 195, s196 = 196, s197 = 197, s198 = 198, s199 = 199,
    s200 = 200, s201 = 201, s202 = 202, s203 = 203, s204 = 204, s205 = 205, s206 = 206, s207 = 207, s208 = 208, s209 = 209,
    s210 = 210, s211 = 211, s212 = 212, s213 = 213, s214 = 214, s215 = 215, s216 = 216, s217 = 217, s218 = 218, s219 = 219,
    s220 = 220, s221 = 221, s222 = 222, s223 = 223, s224 = 224, s225 = 225, s226 = 226, s227 = 227, s228 = 228, s229 = 229,
    s230 = 230, s231 = 231, s232 = 232, s233 = 233, s234 = 234, s235 = 235, s236 = 236, s237 = 237, s238 = 238, s239 = 239,
    s240 = 240, s241 = 241, s242 = 242, s243 = 243, s244 = 244, s245 = 245, s246 = 246, s247 = 247, s248 = 248, s249 = 249,
    s250 = 250, s251 = 251, s252 = 252, s253 = 253
  }

  export enum OperationKindEnum {
    TurnToState = 0x0,
    TryToConnectWithNearest = 0x1,
    GiveBirthConnected = 0x2,
    DisconectFrom = 0x3,
    Die = 0x4,
    TryToConnectWith = 0x5,
    GiveBirth = 0x6,
  }

  export class Operation {
    constructor(
      public kind: OperationKindEnum,
      public operandNodeState: NodeState = NodeState.Ignored
    ) {}
  }

  export class OperationCondition {
    constructor(
      public currentState: NodeState,
      public priorState: NodeState = NodeState.Ignored,
      public allConnectionsCount_GE: number = -1,
      public allConnectionsCount_LE: number = -1,
      public parentsCount_GE: number = -1,
      public parentsCount_LE: number = -1
    ) {}
  }

  export class ChangeTableItem {
    constructor(
      public condition: OperationCondition,
      public operation: Operation,
      public isActive: boolean = false,
      public isEnabled: boolean = true,
      public lastActivationInterationIndex: number = -1
    ) {}
  }

  export class ChangeTable {
    private items: ChangeTableItem[] = [];

    add(item: ChangeTableItem) {
      this.items.push(item);
    }

    find(node: GUMNode): ChangeTableItem | null {
      for (const item of this.items) {
        const condition = item.condition;
        if (
          (condition.currentState === node.state || condition.currentState === NodeState.Ignored) &&
          (condition.priorState === node.priorState || condition.priorState === NodeState.Ignored) &&
          (condition.allConnectionsCount_GE <= node.connectionsCount || condition.allConnectionsCount_GE === -1) &&
          (condition.allConnectionsCount_LE >= node.connectionsCount || condition.allConnectionsCount_LE === -1) &&
          (condition.parentsCount_GE <= node.parentsCount || condition.parentsCount_GE === -1) &&
          (condition.parentsCount_LE >= node.parentsCount || condition.parentsCount_LE === -1)
        ) {
          return item;
        }
      }
      return null;
    }
  }

  export class GUMNode {
    public connectionsCount: number = 0;
    public parentsCount: number = 0;
    public markedAsDeleted: boolean = false;
    public priorState: NodeState = NodeState.Unknown;

    constructor(public id: number, public state: NodeState = NodeState.Unknown) {}
  }

  export class GUMGraph {
    private nodes: GUMNode[] = [];
    private edges: { source: GUMNode; target: GUMNode }[] = [];

    addNode(node: GUMNode) {
      this.nodes.push(node);
    }

    addEdge(source: GUMNode, target: GUMNode) {
      this.edges.push({ source, target });
      source.connectionsCount++;
      target.connectionsCount++;
    }

    getNodes(): GUMNode[] {
      return this.nodes;
    }

    getEdges() {
      return this.edges;
    }

    removeMarkedNodes() {
      this.nodes = this.nodes.filter(node => !node.markedAsDeleted);
      this.edges = this.edges.filter(edge => !edge.source.markedAsDeleted && !edge.target.markedAsDeleted);
    }
  }

  export class GraphUnfoldingMachine {
    private changeTable: ChangeTable;

    constructor(private graph: GUMGraph) {
      this.changeTable = new ChangeTable();
    }

    addChangeTableItem(item: ChangeTableItem) {
      this.changeTable.add(item);
    }

    run() {
      const nodes = this.graph.getNodes();
      for (const node of nodes) {
        const item = this.changeTable.find(node);
        if (item && item.isEnabled) {
          this.performOperation(node, item.operation);
          item.isActive = true;
          item.lastActivationInterationIndex++;
        }
        node.priorState = node.state;
      }
      this.graph.removeMarkedNodes();
    }

    private performOperation(node: GUMNode, operation: Operation) {
      switch (operation.kind) {
        case OperationKindEnum.TurnToState:
          node.state = operation.operandNodeState;
          break;
        case OperationKindEnum.GiveBirthConnected:
          const newNode = new GUMNode(this.graph.getNodes().length + 1, operation.operandNodeState);
          newNode.parentsCount = node.parentsCount + 1;
          this.graph.addNode(newNode);
          this.graph.addEdge(node, newNode);
          break;
        case OperationKindEnum.DisconectFrom:
          node.markedAsDeleted = true;
          break;
        // Handle other cases as needed
      }
    }
  }