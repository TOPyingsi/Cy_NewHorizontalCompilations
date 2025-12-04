import { _decorator, Component, Node, Prefab, instantiate, Vec3, tween, UITransform, Layout, SpriteFrame, Sprite, Label } from 'cc';
import { EMLHJ_SymbolNodeInfo } from '../Common/EMLHJ_SymbolNodeInfo';
const { ccclass, property } = _decorator;

// 旋转配置参数（移除了减速相关配置）
interface EMLHJ_SpinConfig {
    speed: number;          // 旋转速度(图案/秒)，所有列相同
}

@ccclass('EMLHJ_LotteryRotation')
export class EMLHJ_LotteryRotation extends Component {
    @property({ type: Node})
    maskNode: Node = null;
    @property({ type: Node})
    containNode: Node = null;
    @property({ type: Prefab, tooltip: "列预制体" })
    columnNode: Prefab = null;
    @property({ type: Prefab, tooltip: "图案预制体" })
    symbolPrefab: Prefab = null;

    @property({ type: Number, tooltip: "图案节点高度(像素)" })
    symbolHeight: number = 100;

    @property({ type: Number, tooltip: "图案间距(像素)" })
    symbolSpacingX: number = 10;

    @property({ type: Number, tooltip: "图案间距(像素)" })
    symbolSpacingY: number = 10;

    @property(SpriteFrame)
    icons: SpriteFrame[] = [];

    @property(SpriteFrame)
    bgIcons: SpriteFrame[] = [];
    

    // @property({ type: Number, tooltip: "生成随机图案节点最大数量" })
    maxRandomSymbolCount: number = 10;

    // 旋转配置（移除了减速相关参数）
    spinConfig: EMLHJ_SpinConfig = {
        speed: 9            // 所有列使用相同的旋转速度
    };

    spinEndCallback: (resultSymbolMatrix: (EMLHJ_SymbolNodeInfo | null)[][])=>void;

    // 列容器节点
    private columnNodes: Node[] = [];
    // 存储当前显示的图案节点信息
    private currentSymbols: EMLHJ_SymbolNodeInfo[][] = [];
    // 每列的旋转状态
    private isSpinning: boolean[] = [false, false, false, false, false];
    // 每列的当前转速（保持恒定）
    private currentSpeed: number[] = [0, 0, 0, 0, 0];
    // 每列的旋转偏移量
    private spinOffset: number[] = [0, 0, 0, 0, 0];
    // 每列的图案节点池
    private symbolPools: Node[][] = [];

    // 每列随机图案节点的最大数量(从右到左递减)
    private maxSymbolsPerColumn: number[] = [];
    // 每列当前已生成的随机图案节点数量
    private generatedRandomSymbols: number[] = [];
    // 每列还需要生成的结果图案数量
    private remainingResultSymbols: number[] = [3, 3, 3, 3, 3];

    // 初始图案节点坐标矩阵(3*5)
    private initialSymbolPositions: Vec3[][] = [];
    // 结果矩阵图案节点矩阵
    private resultSymbolMatrix: (EMLHJ_SymbolNodeInfo | null)[][] = [];
    // 每列当前需要创建的结果图案行序号（从第三行开始）
    private currentResultRowIndex: number[] = [2, 2, 2, 2, 2];
    // 每列是否正在生成结果图案
    private isGeneratingResultSymbols: boolean[] = [false, false, false, false, false];

    containOffestX: number = 0;
    containOffestY: number = 0;

    isSpining: boolean = false;

    targetMatrix: number[][] = [];

    protected onLoad() {
        this.containOffestX = this.containNode.getComponent(UITransform).width/2;
        this.containOffestY = this.containNode.getComponent(UITransform).height/2; 
        // 初始化5列，从右到左随机图案数量递减1
        for (let col = 0; col < 5; col++) {
            const column = instantiate(this.columnNode);
            column.parent = this.containNode;
            this.columnNodes.push(column);
            
            // 初始化图案池
            this.symbolPools[col] = [];
            
            // 初始化当前图案矩阵
            this.currentSymbols[col] = [];
            
            // 初始化结果矩阵图案节点矩阵
            this.resultSymbolMatrix[col] = [null, null, null];
            
            // 设置每列的最大随机图案数量(从右到左递减)
            // 列索引0是最左边，4是最右边
            this.maxSymbolsPerColumn[col] = this.maxRandomSymbolCount?this.maxRandomSymbolCount - (4 - col):0;
            this.generatedRandomSymbols[col] = 0;
        }
        
        let layout = this.containNode.getComponent(Layout);
        layout.updateLayout();
        layout.enabled = false;

        this.columnNodes.forEach((column) => {
            let worldPos = column.worldPosition.clone();
            column.setParent(this.maskNode);
            column.setWorldPosition(worldPos);
        });
    }

    /**
     * 初始化旋转机，设置初始图案
     * @param initialMatrix 初始3×5矩阵，将按倒序生成
     */
    initialize(initialMatrix: number[][]) {
        // 清空现有节点
        this.clearAllSymbols();
        
        // 初始化初始图案节点坐标矩阵
        this.initialSymbolPositions = [];
        
        for (let col = 0; col < 5; col++) {
            this.initialSymbolPositions[col] = [];
            
            // 倒转矩阵生成顺序：先传第三行(索引2)，再第二行(索引1)，最后第一行(索引0)
            for (let matrixRow = 2; matrixRow >= 0; matrixRow--) {
                const logicalRow = 2 - matrixRow; // 矩阵行索引转逻辑行号: 2→0, 1→1, 0→2
                const symbolId = initialMatrix[matrixRow][col];
                const symbolNode = this.createSymbolNode(symbolId, logicalRow, col, true);
                this.currentSymbols[col][logicalRow] = {
                    node: symbolNode,
                    symbolId,
                    row: logicalRow,
                    col,
                    isResultSymbol: false
                };
                
                // 记录初始图案节点的世界坐标
                this.initialSymbolPositions[col][logicalRow] = symbolNode.worldPosition.clone();
            }
            
            // 添加初始随机节点
            for (let logicalRow = 3; logicalRow < 6; logicalRow++) {
                const randomSymbolId = Math.floor(Math.random() * 7) + 1;
                const symbolNode = this.createSymbolNode(randomSymbolId, logicalRow, col, false);
                this.currentSymbols[col].push({
                    node: symbolNode,
                    symbolId: randomSymbolId,
                    row: logicalRow,
                    col,
                    isResultSymbol: false
                });
                this.generatedRandomSymbols[col]++;
            }
        }
    }

    /**
     * 开始旋转，所有列同时以相同速度旋转
     * @param targetMatrix 目标3×5矩阵
     */
    startSpin(targetMatrix: number[][],cb:(resultSymbolMatrix: (EMLHJ_SymbolNodeInfo | null)[][])=>void) {
       
        this.targetMatrix = targetMatrix;
        this.spinEndCallback = cb;
        // 重置旋转状态
        this.resetRow();
        this.isSpinning = [true, true, true, true, true];
        this.isGeneratingResultSymbols = [false, false, false, false, false];
        this.spinOffset = [0, 0, 0, 0, 0];
        this.currentResultRowIndex = [2, 2, 2, 2, 2];
        this.remainingResultSymbols = [3, 3, 3, 3, 3];
        
        // 重置随机图案计数
        for (let col = 0; col < 5; col++) {
            this.generatedRandomSymbols[col] = 0;
            this.resultSymbolMatrix[col] = [null, null, null];
        }
        
        // 所有列使用相同的速度并立即达到目标速度
        const targetSpeed = this.spinConfig.speed;
        for (let col = 0; col < 5; col++) {
            this.currentSpeed[col] = targetSpeed;
        }
        
        console.log("开始生成随机图案节点");
        this.isSpining = true;
    }

    resetRow(){
             // 重置所有节点的行号基准
             for (let col = 0; col < 5; col++) {
                if (this.currentSymbols[col].length === 0) continue;
                
                // 获取当前列最小行号
                let minRow = Math.min(...this.currentSymbols[col].map(s => s.row));
                // 计算行号偏移量
                const delta = minRow - 0;
                
                // 调整所有节点的行号
                this.currentSymbols[col].forEach(symbol => {
                    symbol.row -= delta;
                    // 同步更新节点位置
                    const targetY = symbol.row * (this.symbolHeight + this.symbolSpacingY);
                    symbol.node.setPosition(0, targetY, 0);
                });
            }
    
    }

    /**
     * 更新旋转状态
     */
    update(deltaTime: number) {
        if (!this.isSpining) return;
        
        const maskWorldPos = this.maskNode.worldPosition;
        const maskUITransform = this.maskNode.getComponent(UITransform);
        const maskSize = maskUITransform.contentSize;
        const symbolHeightWithSpacing = this.symbolHeight + this.symbolSpacingY;
        

        for (let col = 0; col < 5; col++) {
            if (this.isSpinning[col]) {
                // 保持恒定速度
                const distanceThisFrame = this.currentSpeed[col] * symbolHeightWithSpacing * deltaTime;
                this.spinOffset[col] += distanceThisFrame;
                
                // 检查并移除超出可视区域的图案
                             const maskUITransform = this.maskNode.getComponent(UITransform);
                    const maskSize = new Vec3(maskUITransform.width, maskUITransform.height, 0);

                const symbolsRemoved = this.checkAndRemoveOffscreenSymbols(col, maskWorldPos, maskSize);
                
                // 当有图案被移除时，添加新的图案
                if (symbolsRemoved > 0) {
                    for (let i = 0; i < symbolsRemoved; i++) {
                        // 检查是否已达到随机图案最大数量
                        if (this.generatedRandomSymbols[col] >= this.maxSymbolsPerColumn[col]) {
                            // 开始生成结果图案
                            if (!this.isGeneratingResultSymbols[col]) {
                                this.isGeneratingResultSymbols[col] = true;
                                this.remainingResultSymbols[col] = 3;
                                this.currentResultRowIndex[col] = 2; // 从第三行开始
                                console.log("开始生成第一个结果图案节点");
                            }
                            
                            if (this.remainingResultSymbols[col] > 0) {
                                // 继续生成结果图案
                                this.addResultSymbolToTop(col, this.targetMatrix);
                            } else {
                                // this.isSpining = false;
                                // return;
                                // 结果图案生成完毕，重置为生成随机图案
                                this.isGeneratingResultSymbols[col] = false;
                                this.generatedRandomSymbols[col] = 0;
                                // debugger;
                                this.addRandomSymbolToTop(col);
                                console.log("开始生成随机图案节点");
                            }
                        } else {
                            // 生成随机图案
                            this.addRandomSymbolToTop(col);
                        }
                    }
                }
                
                // 更新列中所有图案的位置
                this.updateSymbolsPosition(col);

                if(this.resultSymbolMatrix[col][0]?.node){
                    let symbolY = this.resultSymbolMatrix[col][0].node.worldPosition.y;
                    let initY = this.initialSymbolPositions[col][2].y;
                    if(symbolY <= initY){
                        this.isSpinning[col] = false;
                        let dy = initY - symbolY;
                        this.columnNodes[col].children.forEach((child)=>{
                            child.worldPosition = child.worldPosition.add(new Vec3(0,dy,0));
                        })

                        let isAllStop = true;
                        for(let col2 = 0; col2 < 5; col2++){
                            if(this.isSpinning[col2]){
                                isAllStop = false;
                            }
                        }
                        if(isAllStop){
                            // 将列优先矩阵转换为行优先矩阵
                            const rowMatrix = [];
                            for(let row = 0; row < 3; row++){
                                rowMatrix[row] = [];
                                for(let col = 0; col < 5; col++){
                                    // 列数据中的行索引对应最终矩阵的行
                                    rowMatrix[row][col] = this.resultSymbolMatrix[col][row];
                                }
                            }
                            this.spinEndCallback && this.spinEndCallback(rowMatrix); 
                        }
                    }
                }
            }

        }
    }
    
    /**
     * 添加随机图案到列的顶部
     */
    private addRandomSymbolToTop(col: number) {
        // 随机生成1-7的图案编号
        const randomSymbolId = Math.floor(Math.random() * 7) + 1;
        
        // 获取当前列中最大的行号
        let maxRow = -1;
        for (const symbol of this.currentSymbols[col]) {
            if (symbol.row > maxRow) {
                maxRow = symbol.row;
            }
        }
        
        // 新图案的行号是当前最大行号+1
        const newRow = maxRow + 1;
        
        // 创建新图案节点
        const symbolNode = this.createSymbolNode(randomSymbolId, newRow, col, false);
        
        // 添加到当前图案列表
        this.currentSymbols[col].push({
            node: symbolNode,
            symbolId: randomSymbolId,
            row: newRow,
            col,
            isResultSymbol: false
        });
        
        this.generatedRandomSymbols[col]++;
    }

    /**
     * 添加结果图案到列的顶部（从下往上生成）
     */
    private addResultSymbolToTop(col: number, targetMatrix: number[][]) {
        // 获取当前列中最大的行号
        let maxRow = -1;
        for (const symbol of this.currentSymbols[col]) {
            if (symbol.row > maxRow) {
                maxRow = symbol.row;
            }
        }
        
        // 新图案的行号是当前最大行号+1
        const newRow = maxRow + 1;
        let symbolId: number;
        let isResultSymbol = true;
        
        // 获取对应的图案ID（从结果矩阵的第三行开始）
        if (this.currentResultRowIndex[col] >= 0 && this.currentResultRowIndex[col] < 3) {
            // 从第三行(索引2)开始，到第一行(索引0)
            const matrixRow = this.currentResultRowIndex[col];
            symbolId = targetMatrix[matrixRow][col];
            
            // 创建新图案节点
            const symbolNode = this.createSymbolNode(symbolId, newRow, col, true);
            
            // 添加到当前图案列表
            const symbolInfo: EMLHJ_SymbolNodeInfo = {
                node: symbolNode,
                symbolId,
                row: newRow,
                col,
                isResultSymbol
            };
            this.currentSymbols[col].push(symbolInfo);
            
            // 更新结果矩阵图案节点矩阵
            this.resultSymbolMatrix[col][this.currentResultRowIndex[col]] = symbolInfo;
            
            // 更新下一个要创建的行索引（向第一行推进）
            this.currentResultRowIndex[col]--;
            this.remainingResultSymbols[col]--;
        }
    }

    /**
     * 检查并移除超出可视区域的图案（底部超出的节点）
     */
    private checkAndRemoveOffscreenSymbols(col: number, maskWorldPos: Vec3, maskSize: Vec3) : number {
        const maskHalfHeight = maskSize.y / 2;
        const symbolsToRemove: EMLHJ_SymbolNodeInfo[] = [];
        
        // 检查每个图案是否在可见范围内
        for (const symbol of this.currentSymbols[col]) {
            const symbolWorldPos = symbol.node.worldPosition;
            const symbolSize = symbol.node.getComponent(UITransform).contentSize;
            const symbolHalfHeight = symbolSize.y / 2;
            
            const distance = maskWorldPos.clone().y - symbolWorldPos.clone().y - symbolHalfHeight;
            const isOutOfVisible = distance > maskHalfHeight + 100;
            
            if (isOutOfVisible) {
                symbolsToRemove.push(symbol);
            }
        }
        
        // 处理要移除的图案
        for (const symbol of symbolsToRemove) {
            // 回收节点到对象池
            this.recycleSymbolNode(col, symbol.node);
            
            // 从当前图案列表中移除
            const index = this.currentSymbols[col].indexOf(symbol);
            if (index !== -1) {
                this.currentSymbols[col].splice(index, 1);
            }
        }
        
        return symbolsToRemove.length;
    }

    /**
     * 更新列中所有图案的位置
     */
    private updateSymbolsPosition(col: number) {
        const symbolHeightWithSpacing = this.symbolHeight + this.symbolSpacingY;
        
        for (const symbol of this.currentSymbols[col]) {
            // 计算图案的目标位置（考虑旋转偏移）
            const targetY = symbol.row * symbolHeightWithSpacing - this.spinOffset[col];
            symbol.node.setPosition(0, targetY, 0);
        }
    }

    /**
     * 创建图案节点（未做修改）
     */
    private createSymbolNode(symbolId: number, row: number, col: number, isResultSymbol: boolean = false): Node {
        let symbolNode: Node;
        
        // 尝试从对象池获取
        if (this.symbolPools[col].length > 0) {
            symbolNode = this.symbolPools[col].pop();
            symbolNode.active = true;
        } else {
            // 创建新节点
            symbolNode = instantiate(this.symbolPrefab);
            symbolNode.parent = this.columnNodes[col];
        }
        
        // 设置图案
        const iconSprite = symbolNode.getChildByName("icon").getComponent(Sprite);
        iconSprite.spriteFrame = this.icons[symbolId - 1];
        const bgSprite = symbolNode.getChildByName("bg").getComponent(Sprite);
        bgSprite.spriteFrame = this.bgIcons[symbolId - 1];

        const label = symbolNode.getChildByName("Label").getComponent(Label);
        label.string = symbolId.toString();
        // symbolNode.getChildByName("icon").active = !isResultSymbol;
        
        // 设置初始位置：行号越大，Y值越大，位置越高
        const symbolHeightWithSpacing = this.symbolHeight + this.symbolSpacingY;
        symbolNode.setPosition(0, row * symbolHeightWithSpacing, 0);
        
        return symbolNode;
    }

    /**
     * 回收图案节点到对象池
     */
    private recycleSymbolNode(col: number, node: Node) {
        node.active = false;
        this.symbolPools[col].push(node);
    }

    /**
     * 清空列中的所有图案
     */
    private clearColumnSymbols(col: number) {
        this.currentSymbols[col].forEach(symbol => {
            this.recycleSymbolNode(col, symbol.node);
        });
        this.currentSymbols[col] = [];
        this.resultSymbolMatrix[col] = [null, null, null];
        this.generatedRandomSymbols[col] = 0;
    }

    /**
     * 清空所有图案
     */
    private clearAllSymbols() {
        for (let col = 0; col < 5; col++) {
            this.clearColumnSymbols(col);
        }
    }

    /**
     * 根据位置获取当前展示的图案节点
     */
    getSymbolNodeAt(row: number, col: number): Node | null {
        if (col < 0 || col >= 5 || row < 0 || row >= 3) {
            return null;
        }
        
        const symbol = this.currentSymbols[col].find(s => s.row === row);
        return symbol ? symbol.node : null;
    }

    /**
     * 根据位置获取当前展示的图案编号
     */
    getSymbolIdAt(row: number, col: number): number | null {
        if (col < 0 || col >= 5 || row < 0 || row >= 3) {
            return null;
        }
        
        const symbol = this.currentSymbols[col].find(s => s.row === row);
        return symbol ? symbol.symbolId : null;
    }
}
    