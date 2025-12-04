import { _decorator,Node } from 'cc';

// 图案节点信息结构
export interface EMLHJ_SymbolNodeInfo {
    node: Node;          // 图案节点
    symbolId: number;    // 图案编号
    row: number;         // 所在行(逻辑行号，0为最底部)
    col: number;         // 所在列(0-4)
    isResultSymbol: boolean; // 是否是结果图案节点
}
