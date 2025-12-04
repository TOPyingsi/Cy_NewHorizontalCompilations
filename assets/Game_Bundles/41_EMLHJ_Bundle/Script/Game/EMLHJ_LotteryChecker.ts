import { _decorator, Component, Node } from 'cc';
import { EMLHJ_WinInfo } from '../Common/EMLHJ_WinInfo';
const { ccclass, property } = _decorator;

@ccclass('EMLHJ_LotteryChecker')
export class EMLHJ_LotteryChecker extends Component {
// 图案编号数量（0-6，共7种图案）
    private   readonly SYMBOL_COUNT = 7;
    
    // 回调函数
    private   callback: ((resultData: { patterns: number[][][][]; multipliers: number[] }) => void) | null = null;
    
    // 中奖模式定义（11种）
    private   readonly PATTERNS = [
        { name: "横", check: this.checkHorizontal.bind(this), multiplier: 1.0 },
        { name: "竖", check: this.checkVertical.bind(this), multiplier: 1.0 },
        { name: "斜", check: this.checkDiagonal.bind(this), multiplier: 1.0 },
        { name: "横大", check: this.checkHorizontalLarge.bind(this), multiplier: 2.0 },
        { name: "横超大", check: this.checkHorizontalXL.bind(this), multiplier: 3.0 },
        { name: "之字", check: this.checkZigZag.bind(this), multiplier: 4.0 },
        { name: "锯齿", check: this.checkSawtooth.bind(this), multiplier: 4.0 },
        { name: "上方", check: this.checkUpper.bind(this), multiplier: 7.0 },
        { name: "下方", check: this.checkLower.bind(this), multiplier: 7.0 },
        { name: "邪眼阵", check: this.checkEvilEye.bind(this), multiplier: 8.0 },
        { name: "头奖", check: this.checkJackpot.bind(this), multiplier: 10.0 }
    ];

    // 分帧检测相关变量
    private   currentPatternIndex = 0;
    private   detectionResult: number[][][][] = [];
    private   detectionMultipliers: number[] = [];
    private   targetMatrix: number[][] | null = null;
    private   detectionCallback: ((() => void) | null) = null;

    isChecking:boolean = false;

    /**
     * 初始化函数，设置检测完成后的回调函数
     * @param callback 检测完成后的回调函数
     */
      initialize(callback:((resultData: EMLHJ_WinInfo) => void)) {
        this.callback = callback;
    }

    /**
     * 开始分帧检测中奖模式
     * @param matrix 3x5的结果矩阵（图案编号）
     */
      startDetection(matrix: number[][]): void {
        if(this.isChecking) return;
        this.isChecking = true;
        // 重置检测状态
        this.currentPatternIndex = 0;
        this.detectionResult = [];
        this.detectionMultipliers = [];
        
        
        // 验证矩阵格式
        if (!this.validateMatrix(matrix)) {
            console.error("无效的矩阵格式，必须是3x5的矩阵");
            this.finishDetection();
            return;
        }
        
        this.targetMatrix = matrix;
        
        // // 开始第一帧检测
        // this.scheduleOnce(this.aa, 0);
    }

    // aa(){
    //     this.detectNextPattern();
    // }

    /**
     * 每帧检测下一种中奖模式
     */
      update(dt: number): void {
        // this.unschedule(this.aa);
        if(!this.isChecking) return;
        if (!this.targetMatrix || this.currentPatternIndex >= this.PATTERNS.length) {
            this.finishDetection();
            return;
        }
        
        // 检测当前模式
        const pattern = this.PATTERNS[this.currentPatternIndex];
        const winMatrices = pattern.check(this.targetMatrix);
        
        // 保存结果
        this.detectionResult.push(winMatrices);
        this.detectionMultipliers.push(pattern.multiplier);
        
        // 移动到下一个模式
        this.currentPatternIndex++;
        
        // 如果还有模式未检测，安排下一帧检测
        if (this.currentPatternIndex < this.PATTERNS.length) {
            // this.scheduleOnce(this.aa, 0);

        } else {
            // 所有模式检测完成
            this.finishDetection();
        }
    }

    /**
     * 完成所有检测，发送事件并调用回调
     */
    private  finishDetection(): void {
        this.isChecking = false;
        // 准备结果数据
        const resultData = {
            patterns: this.detectionResult,
            multipliers: this.detectionMultipliers
        };
        
        // // 发射事件
        // EventManager.emit("check", resultData);
        
        // 调用回调函数
        if (this.callback) {
            this.callback(resultData);
        }
        
        // 清理
        this.targetMatrix = null;
    }

    /**
     * 验证矩阵是否为3x5格式
     */
    private   validateMatrix(matrix: number[][]): boolean {
        if (matrix.length !== 3) return false;
        for (const row of matrix) {
            if (row.length !== 5) return false;
            for (const val of row) {
                if (val < 1 || val > this.SYMBOL_COUNT) return false;
            }
        }
        return true;
    }

    /**
     * 1. 横向检查：任意位置横向连续3个图案相同
     */
    private   checkHorizontal(matrix: number[][]): number[][][] {
        const winMatrices: number[][][] = [];
        
        // 检查每一行
        for (let row = 0; row < 3; row++) {
            // 检查可能的连续3个位置（列0-2, 1-3, 2-4）
            for (let col = 0; col <= 2; col++) {
                const symbol = matrix[row][col];
                // 检查连续3个是否相同
                if (symbol === matrix[row][col+1] && symbol === matrix[row][col+2]) {
                    // 创建中奖矩阵
                    const winMatrix = this.createEmptyWinMatrix();
                    winMatrix[row][col] = 1;
                    winMatrix[row][col+1] = 1;
                    winMatrix[row][col+2] = 1;
                    winMatrices.push(winMatrix);
                }
            }
        }
        
        return winMatrices;
    }

    /**
     * 2. 竖向检查：任意位置竖向连续3个图案相同
     */
    private   checkVertical(matrix: number[][]): number[][][] {
        const winMatrices: number[][][] = [];
        
        // 检查每一列
        for (let col = 0; col < 5; col++) {
            // 只有一列可以检查连续3个（行0-2）
            const symbol = matrix[0][col];
            if (symbol === matrix[1][col] && symbol === matrix[2][col]) {
                // 创建中奖矩阵
                const winMatrix = this.createEmptyWinMatrix();
                winMatrix[0][col] = 1;
                winMatrix[1][col] = 1;
                winMatrix[2][col] = 1;
                winMatrices.push(winMatrix);
            }
        }
        
        return winMatrices;
    }

    /**
     * 3. 斜向检查：任意位置斜向连续3个图案相同
     * 包括左上到右下和左下到右上两种方向
     */
    private   checkDiagonal(matrix: number[][]): number[][][] {
        const winMatrices: number[][][] = [];
        
        // 检查左上到右下方向
        for (let col = 0; col <= 2; col++) {
            const symbol = matrix[0][col];
            if (symbol === matrix[1][col+1] && symbol === matrix[2][col+2]) {
                const winMatrix = this.createEmptyWinMatrix();
                winMatrix[0][col] = 1;
                winMatrix[1][col+1] = 1;
                winMatrix[2][col+2] = 1;
                winMatrices.push(winMatrix);
            }
        }
        
        // 检查左下到右上方向
        for (let col = 0; col <= 2; col++) {
            const symbol = matrix[2][col];
            if (symbol === matrix[1][col+1] && symbol === matrix[0][col+2]) {
                const winMatrix = this.createEmptyWinMatrix();
                winMatrix[2][col] = 1;
                winMatrix[1][col+1] = 1;
                winMatrix[0][col+2] = 1;
                winMatrices.push(winMatrix);
            }
        }
        
        return winMatrices;
    }

    /**
     * 4. 横大：横向连续4个图案相同
     */
    private   checkHorizontalLarge(matrix: number[][]): number[][][] {
        const winMatrices: number[][][] = [];
        
        // 检查每一行
        for (let row = 0; row < 3; row++) {
            // 检查可能的连续4个位置（列0-3, 1-4）
            for (let col = 0; col <= 1; col++) {
                const symbol = matrix[row][col];
                if (symbol === matrix[row][col+1] && 
                    symbol === matrix[row][col+2] && 
                    symbol === matrix[row][col+3]) {
                    
                    const winMatrix = this.createEmptyWinMatrix();
                    winMatrix[row][col] = 1;
                    winMatrix[row][col+1] = 1;
                    winMatrix[row][col+2] = 1;
                    winMatrix[row][col+3] = 1;
                    winMatrices.push(winMatrix);
                }
            }
        }
        
        return winMatrices;
    }

    /**
     * 5. 横超大：横向连续5个图案相同
     */
    private   checkHorizontalXL(matrix: number[][]): number[][][] {
        const winMatrices: number[][][] = [];
        
        // 检查每一行
        for (let row = 0; row < 3; row++) {
            const symbol = matrix[row][0];
            // 检查整行5个是否相同
            if (symbol === matrix[row][1] && 
                symbol === matrix[row][2] && 
                symbol === matrix[row][3] && 
                symbol === matrix[row][4]) {
                
                const winMatrix = this.createEmptyWinMatrix();
                winMatrix[row][0] = 1;
                winMatrix[row][1] = 1;
                winMatrix[row][2] = 1;
                winMatrix[row][3] = 1;
                winMatrix[row][4] = 1;
                winMatrices.push(winMatrix);
            }
        }
        
        return winMatrices;
    }

    /**
     * 6. 之字：矩阵排列为 "00100；01010；10001"
     */
    private   checkZigZag(matrix: number[][]): number[][][] {
        const winMatrices: number[][][] = [];
        const positions = [
            [0, 2],  // 第一行中间
            [1, 1],  // 第二行左中
            [1, 3],  // 第二行右中
            [2, 0],  // 第三行最左
            [2, 4]   // 第三行最右
        ];
        
        // 检查这些位置是否有相同的图案
        const symbol = matrix[positions[0][0]][positions[0][1]];
        let allMatch = true;
        
        for (const [row, col] of positions) {
            if (matrix[row][col] !== symbol) {
                allMatch = false;
                break;
            }
        }
        
        if (allMatch) {
            const winMatrix = this.createEmptyWinMatrix();
            for (const [row, col] of positions) {
                winMatrix[row][col] = 1;
            }
            winMatrices.push(winMatrix);
        }
        
        return winMatrices;
    }

    /**
     * 7. 锯齿：矩阵排列为 "10001；01010；00100"
     */
    private   checkSawtooth(matrix: number[][]): number[][][] {
        const winMatrices: number[][][] = [];
        const positions = [
            [0, 0],  // 第一行最左
            [0, 4],  // 第一行最右
            [1, 1],  // 第二行左中
            [1, 3],  // 第二行右中
            [2, 2]   // 第三行中间
        ];
        
        // 检查这些位置是否有相同的图案
        const symbol = matrix[positions[0][0]][positions[0][1]];
        let allMatch = true;
        
        for (const [row, col] of positions) {
            if (matrix[row][col] !== symbol) {
                allMatch = false;
                break;
            }
        }
        
        if (allMatch) {
            const winMatrix = this.createEmptyWinMatrix();
            for (const [row, col] of positions) {
                winMatrix[row][col] = 1;
            }
            winMatrices.push(winMatrix);
        }
        
        return winMatrices;
    }

    /**
     * 8. 上方：矩阵排列为 "00100；01010；11111"
     */
    private   checkUpper(matrix: number[][]): number[][][] {
        const winMatrices: number[][][] = [];
        // 上方图案位置
        const positions = [
            [0, 2],  // 第一行中间
            [1, 1],  // 第二行左中
            [1, 3],  // 第二行右中
            [2, 0],  // 第三行最左
            [2, 1],  // 第三行左二
            [2, 2],  // 第三行中间
            [2, 3],  // 第三行右二
            [2, 4]   // 第三行最右
        ];
        
        // 检查这些位置是否有相同的图案
        const symbol = matrix[positions[0][0]][positions[0][1]];
        let allMatch = true;
        
        for (const [row, col] of positions) {
            if (matrix[row][col] !== symbol) {
                allMatch = false;
                break;
            }
        }
        
        if (allMatch) {
            const winMatrix = this.createEmptyWinMatrix();
            for (const [row, col] of positions) {
                winMatrix[row][col] = 1;
            }
            winMatrices.push(winMatrix);
        }
        
        return winMatrices;
    }

    /**
     * 9. 下方：矩阵排列为 "11111；01010；00100"
     */
    private   checkLower(matrix: number[][]): number[][][] {
        const winMatrices: number[][][] = [];
        // 下方图案位置
        const positions = [
            [0, 0],  // 第一行最左
            [0, 1],  // 第一行左二
            [0, 2],  // 第一行中间
            [0, 3],  // 第一行右二
            [0, 4],  // 第一行最右
            [1, 1],  // 第二行左中
            [1, 3],  // 第二行右中
            [2, 2]   // 第三行中间
        ];
        
        // 检查这些位置是否有相同的图案
        const symbol = matrix[positions[0][0]][positions[0][1]];
        let allMatch = true;
        
        for (const [row, col] of positions) {
            if (matrix[row][col] !== symbol) {
                allMatch = false;
                break;
            }
        }
        
        if (allMatch) {
            const winMatrix = this.createEmptyWinMatrix();
            for (const [row, col] of positions) {
                winMatrix[row][col] = 1;
            }
            winMatrices.push(winMatrix);
        }
        
        return winMatrices;
    }

    /**
     * 10. 邪眼阵：矩阵排列为 "01110；11011；01110"
     */
    private   checkEvilEye(matrix: number[][]): number[][][] {
        const winMatrices: number[][][] = [];
        // 邪眼阵位置
        const positions = [
            [0, 1], [0, 2], [0, 3],  // 第一行中间三个
            [1, 0], [1, 1], [1, 3], [1, 4],  // 第二行除中间外
            [2, 1], [2, 2], [2, 3]   // 第三行中间三个
        ];
        
        // 检查这些位置是否有相同的图案
        const symbol = matrix[positions[0][0]][positions[0][1]];
        let allMatch = true;
        
        for (const [row, col] of positions) {
            if (matrix[row][col] !== symbol) {
                allMatch = false;
                break;
            }
        }
        
        if (allMatch) {
            const winMatrix = this.createEmptyWinMatrix();
            for (const [row, col] of positions) {
                winMatrix[row][col] = 1;
            }
            winMatrices.push(winMatrix);
        }
        
        return winMatrices;
    }

    /**
     * 11. 头奖：整个矩阵所有图案都相同
     */
    private   checkJackpot(matrix: number[][]): number[][][] {
        const winMatrices: number[][][] = [];
        
        // 检查所有位置是否都相同
        const symbol = matrix[0][0];
        let allMatch = true;
        
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 5; col++) {
                if (matrix[row][col] !== symbol) {
                    allMatch = false;
                    break;
                }
            }
            if (!allMatch) break;
        }
        
        if (allMatch) {
            // 全为1的矩阵
            const winMatrix = [
                [1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1]
            ];
            winMatrices.push(winMatrix);
        }
        
        return winMatrices;
    }

    /**
     * 创建一个空的中奖矩阵（3x5，全为0）
     */
    private   createEmptyWinMatrix(): number[][] {
        return [
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0]
        ];
    }
}


