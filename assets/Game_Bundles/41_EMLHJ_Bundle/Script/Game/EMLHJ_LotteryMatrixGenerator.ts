import { EMLHJ_DataManager } from "../Manager/EMLHJ_DataManager";

/**
 * 中秋抽奖旋转机矩阵生成器
 * 生成3×5的图案矩阵，受幸运值和图案影响参数控制
 */
export class LotteryMatrixGenerator {
    // 图案总数
    private static readonly TOTAL_SYMBOLS = 7;
    
    // // 奖项配置：key为幸运值阈值，value为最高可中奖项
    // private static readonly LUCK_THRESHOLDS = {
    //     3: 3,    // 3点幸运值最高中3等奖
    //     5: 5,    // 5点幸运值最高中5等奖
    //     7: 7,    // 7点幸运值最高中6等奖
    //     10: 11   // 10点幸运值最高中11等奖(头奖)
    // };
    
    // // 各奖项对应的概率算法（不同幸运值范围使用不同算法）
    // private static readonly PRIZE_PROBABILITY_ALGORITHMS = {
    //     1: [0.3, 0.2, 0.1, 0, 0, 0, 0, 0, 0, 0, 0],  // 算法1：对应幸运值≤3
    //     2: [0.25, 0.2, 0.15, 0.1, 0.05, 0, 0, 0, 0, 0, 0],  // 算法2：对应幸运值≤5
    //     3: [0.2, 0.18, 0.15, 0.1, 0.08, 0.03, 0, 0, 0, 0, 0],  // 算法3：对应幸运值≤7
    //     4: [0.15, 0.15, 0.12, 0.1, 0.08, 0.05, 0.03, 0.02, 0.02, 0.02, 0.01]  // 算法4：对应幸运值≤10
    // };
    
   // 各奖项对应的图案排列方式（1表示需要相同图案的位置）
    private static readonly PRIZE_PATTERNS = {
        1: { 
            type: 'horizontal', // 横向连续3个（随机起始位置）
            length: 3 
        },
        2: { 
            type: 'vertical', // 竖向连续3个（随机起始位置）
            length: 3 
        },
        3: { 
            type: 'diagonal', // 斜向连续3个（随机起始位置）
            length: 3 
        },
        // 4: [  // 横大：横向连续4个
        //     [1,1,1,1,0],
        //     [0,0,0,0,0],
        //     [0,0,0,0,0]
        // ],
        // 5: [  // 横超大：横向连续5个
        //     [1,1,1,1,1],
        //     [0,0,0,0,0],
        //     [0,0,0,0,0]
        // ],
            
        4: { 
            type: 'horizontal', // 横向连续4个（随机行）
            length: 4 
        },
        5: { 
            type: 'horizontal', // 横向连续5个（随机行）
            length: 5 
        },
        6: [  // 之字
            [0,0,1,0,0],
            [0,1,0,1,0],
            [1,0,0,0,1]
        ],
        7: [  // 锯齿
            [1,0,0,0,1],
            [0,1,0,1,0],
            [0,0,1,0,0]
        ],
        8: [  // 上方
            [0,0,1,0,0],
            [0,1,0,1,0],
            [1,1,1,1,1]
        ],
        9: [  // 下方
            [1,1,1,1,1],
            [0,1,0,1,0],
            [0,0,1,0,0]
        ],
        10: [ // 邪眼阵
            [0,1,1,1,0],
            [1,1,0,1,1],
            [0,1,1,1,0]
        ],
        11: [ // 头奖：全相同
            [1,1,1,1,1],
            [1,1,1,1,1],
            [1,1,1,1,1]
        ]
    };
    
    /**
     * 生成抽奖矩阵
     * @param luckValue 幸运值
     * @param symbolInfluence 图案影响参数 {图案编号: 增加概率}
     * @returns 3×5的矩阵，每个元素为图案编号(1-7)
     */
    generateMatrix(luckValue: number, symbolInfluence: {[key: number]: number} = {}): number[][] {
        // 步骤1：根据幸运值确定适用的概率算法和最高可中奖项
        const {algorithm, maxPrize} = this.determineAlgorithmAndMaxPrize(luckValue);
        
        // 步骤2：根据概率算法随机决定是否中奖及中哪个奖项
        const prize = this.determinePrize(algorithm, maxPrize);
        
        // 步骤3：获取中奖图案位置，如果没中奖则返回null
        const pattern = prize ? LotteryMatrixGenerator.PRIZE_PATTERNS[prize] : null;
        
        // 步骤4：生成最终矩阵
        return this.generateFinalMatrix(pattern, symbolInfluence);
    }
    
    /**
     * 根据幸运值确定适用的概率算法和最高可中奖项
     */
    private determineAlgorithmAndMaxPrize(luckValue: number): {algorithm: number, maxPrize: number} {
        // 排序幸运值阈值，找到适用的范围
        const sortedThresholds = Object.keys(EMLHJ_DataManager.Instance.LUCK_THRESHOLDS)
            .map(Number)
            .sort((a, b) => a - b);
        
        // 找到不大于当前幸运值的最大阈值
        let applicableThreshold = 0;
        for (const threshold of sortedThresholds) {
            if (threshold <= luckValue) {
                applicableThreshold = threshold;
            } else {
                break;
            }
        }
        
        // 确定算法编号和最高奖项
        let algorithm = 1;
        if (applicableThreshold >= 10) {
            algorithm = 4;
        } else if (applicableThreshold >= 7) {
            algorithm = 3;
        } else if (applicableThreshold >= 5) {
            algorithm = 2;
        }
        
        return {
            algorithm,
            maxPrize: applicableThreshold > 0 
                ? EMLHJ_DataManager.Instance.LUCK_THRESHOLDS[applicableThreshold] 
                : 1  // 默认最高可中1等奖
        };
    }
    
    /**
     * 根据概率算法随机决定是否中奖及中哪个奖项
     */
    private determinePrize(algorithm: number, maxPrize: number): number | null {
        // 获取对应算法的概率分布
        const probabilities =  EMLHJ_DataManager.Instance.PRIZE_PROBABILITY_ALGORITHMS[algorithm];
        
        // 计算总中奖概率
        const totalWinningProbability = probabilities.slice(0, maxPrize).reduce((sum, p) => sum + p, 0);
        
        // 先随机决定是否中奖
        const random = Math.random();
        if (random > totalWinningProbability) {
            return null;  // 未中奖
        }
        
        // 确定具体中哪个奖项
        let cumulativeProbability = 0;
        for (let i = 0; i < maxPrize; i++) {
            cumulativeProbability += probabilities[i];
            if (random <= cumulativeProbability) {
                return i + 1;  // 奖项从1开始编号
            }
        }
        
        return null;  // 理论上不会走到这里
    }
    
    /**
     * 生成最终矩阵
     */
    private generateFinalMatrix(pattern: any, symbolInfluence: {[key: number]: number}): number[][] {
        // 初始化3×5矩阵
        const matrix: number[][] = Array(3).fill(0).map(() => Array(5).fill(0));
        
        // 如果有中奖图案
        if (pattern) {
            let winningPositions: [number, number][] = [];
            
            // 处理随机位置的奖项（1-5）
            if (typeof pattern === 'object' && pattern.type) {
                winningPositions = this.generateRandomWinningPositions(pattern.type, pattern.length);
            } 
            // 处理固定位置的奖项
            else {
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 5; col++) {
                        if (pattern[row][col] === 1) {
                            winningPositions.push([row, col]);
                        }
                    }
                }
            }
            
            // 为中奖位置选择一个图案
            const winningSymbol = this.selectSymbol(symbolInfluence);
            
            // 填充中奖位置
            for (const [row, col] of winningPositions) {
                matrix[row][col] = winningSymbol;
            }
            
            // 填充非中奖位置
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 5; col++) {
                    if (!winningPositions.some(([r, c]) => r === row && c === col)) {
                        matrix[row][col] = this.selectSymbol(symbolInfluence);
                    }
                }
            }
        } else {
            // 没有中奖，所有位置随机生成，但确保不形成任何中奖模式
            let validMatrix = false;
            
            while (!validMatrix) {
                // 填充矩阵
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col < 5; col++) {
                        matrix[row][col] = this.selectSymbol(symbolInfluence);
                    }
                }
                
                // 检查矩阵是否不包含任何中奖模式
                validMatrix = !this.checkAnyWinningPattern(matrix);
            }
        }
        
        return matrix;
    }
    
   /**
     * 根据图案影响参数选择一个图案
     * 新逻辑：将每个图案的权重与平均值的差作为基础，调整为非负值后归一化到总权重为1
     */
    private selectSymbol(symbolInfluence: {[key: number]: number}): number {
        const totalSymbols = LotteryMatrixGenerator.TOTAL_SYMBOLS;
        const weights: number[] = new Array(totalSymbols).fill(0);
        
        // 计算传入的权重总和
        let providedWeightSum = 0;
        const providedSymbols = Object.keys(symbolInfluence).map(Number);
        
        // 初始化权重数组并计算提供的权重总和
        providedSymbols.forEach(symbol => {
            if (symbol >= 1 && symbol <= totalSymbols) {
                const weight = symbolInfluence[symbol];
                weights[symbol - 1] = weight > 0 ? weight : 0; // 确保权重不为负
                providedWeightSum += weights[symbol - 1];
            }
        });
        
        // 情况1：提供的权重总和小于1，未指定的图案平分剩余权重
        if (providedWeightSum < 1) {
            const remainingWeight = 1 - providedWeightSum;
            const unprovidedCount = totalSymbols - providedSymbols.length;
            
            if (unprovidedCount > 0) {
                const evenShare = remainingWeight / unprovidedCount;
                // 为未提供权重的图案分配平分的权重
                for (let i = 0; i < totalSymbols; i++) {
                    if (weights[i] === 0) {
                        weights[i] = evenShare;
                    }
                }
            }
        } 
        // 情况2：提供的权重总和大于等于1，基于与平均值的差值重新计算
        else {
            // 计算所有图案的平均权重
            const averageWeight = providedWeightSum / totalSymbols;
            
            // 计算每个图案与平均值的差值
            let diffs: number[] = [];
            for (let i = 0; i < totalSymbols; i++) {
                diffs.push(weights[i] - averageWeight);
            }
            
            // 找到最小差值（可能为负）
            const minDiff = Math.min(...diffs);
            
            // 调整差值，确保没有负值
            if (minDiff < 0) {
                diffs = diffs.map(d => d - minDiff);
            }
            
            // 计算调整后的总差值
            const totalDiff = diffs.reduce((sum, d) => sum + d, 0);
            
            // 归一化差值，使总权重为1
            if (totalDiff > 0) {
                for (let i = 0; i < totalSymbols; i++) {
                    weights[i] = diffs[i] / totalDiff;
                }
            } else {
                // 如果总差值为0，说明所有差值相等，平均分配
                const evenWeight = 1 / totalSymbols;
                weights.fill(evenWeight);
            }
        }
        
        // console.log("权重:", weights);

        // 根据计算出的权重随机选择一个图案
        let random = Math.random();
        let cumulativeWeight = 0;
        
        for (let i = 0; i < totalSymbols; i++) {
            cumulativeWeight += weights[i];
            if (random <= cumulativeWeight) {
                return i + 1; // 图案编号从1开始
            }
        }
        
        // 理论上不会走到这里，默认返回1
        return 1;
    }

    /**
     * 为1-5等奖生成随机的中奖位置
     */
    private generateRandomWinningPositions(type: string, length: number): [number, number][] {
        const positions: [number, number][] = [];
        
        switch (type) {
            case 'horizontal':
                // 随机选择一行
                const row = Math.floor(Math.random() * 3);
                // 随机选择起始列（确保有足够空间放下连续length个）
                const startCol = Math.floor(Math.random() * (5 - length + 1));
                // 添加连续的位置
                for (let i = 0; i < length; i++) {
                    positions.push([row, startCol + i]);
                }
                break;
                
            case 'vertical':
                // 随机选择一列
                const col = Math.floor(Math.random() * 5);
                // 纵向只有3行，所以起始行只能是0
                for (let i = 0; i < length; i++) {
                    positions.push([i, col]);
                }
                break;
                
            case 'diagonal':
                // 斜向有两种可能：左上到右下 或 右上到左下
                const direction = Math.random() > 0.5 ? 'down-right' : 'down-left';
                if (direction === 'down-right') {
                    // 左上到右下，起始列只能是0-2
                    const startCol = Math.floor(Math.random() * (5 - length + 1));
                    for (let i = 0; i < length; i++) {
                        positions.push([i, startCol + i]);
                    }
                } else {
                    // 右上到左下，起始列只能是2-4
                    const startCol = 2 + Math.floor(Math.random() * (5 - 2 - length + 2));
                    for (let i = 0; i < length; i++) {
                        positions.push([i, startCol - i]);
                    }
                }
                break;
        }
        
        return positions;
    }
    
    /**
     * 检查矩阵是否包含任何中奖模式
     */
    private checkAnyWinningPattern(matrix: number[][]): boolean {
        // 检查所有可能的中奖模式
        for (let prize = 1; prize <= 11; prize++) {
            const pattern = LotteryMatrixGenerator.PRIZE_PATTERNS[prize];
            if (this.checkPatternMatch(matrix, pattern)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * 检查矩阵是否匹配特定的中奖模式
     */
    private checkPatternMatch(matrix: number[][], pattern: any): boolean {
        // 处理随机位置类型的奖项
        if (typeof pattern === 'object' && pattern.type) {
            return this.checkRandomPatternMatch(matrix, pattern);
        }
        
        // 检查固定模式
        const requiredPositions: [number, number][] = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 5; col++) {
                if (pattern[row][col] === 1) {
                    requiredPositions.push([row, col]);
                }
            }
        }
        
        if (requiredPositions.length === 0) return false;
        
        // 检查所有需要相同的位置是否真的相同
        const symbol = matrix[requiredPositions[0][0]][requiredPositions[0][1]];
        for (const [row, col] of requiredPositions.slice(1)) {
            if (matrix[row][col] !== symbol) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * 检查随机位置类型的图案是否匹配
     */
    private checkRandomPatternMatch(matrix: number[][], pattern: {type: string, length: number}): boolean {
        switch (pattern.type) {
            case 'horizontal':
                // 检查所有行是否有连续length个相同的图案
                for (let row = 0; row < 3; row++) {
                    for (let col = 0; col <= 5 - pattern.length; col++) {
                        const symbol = matrix[row][col];
                        let match = true;
                        for (let i = 1; i < pattern.length; i++) {
                            if (matrix[row][col + i] !== symbol) {
                                match = false;
                                break;
                            }
                        }
                        if (match) return true;
                    }
                }
                break;
                
            case 'vertical':
                // 检查所有列是否有连续length个相同的图案
                for (let col = 0; col < 5; col++) {
                    const symbol = matrix[0][col];
                    let match = true;
                    for (let i = 1; i < pattern.length; i++) {
                        if (matrix[i][col] !== symbol) {
                            match = false;
                            break;
                        }
                    }
                    if (match) return true;
                }
                break;
                
            case 'diagonal':
                // 检查斜向是否有连续length个相同的图案
                // 左上到右下
                for (let col = 0; col <= 5 - pattern.length; col++) {
                    const symbol = matrix[0][col];
                    let match = true;
                    for (let i = 1; i < pattern.length; i++) {
                        if (matrix[i][col + i] !== symbol) {
                            match = false;
                            break;
                        }
                    }
                    if (match) return true;
                }
                
                // 右上到左下
                for (let col = pattern.length - 1; col < 5; col++) {
                    const symbol = matrix[0][col];
                    let match = true;
                    for (let i = 1; i < pattern.length; i++) {
                        if (matrix[i][col - i] !== symbol) {
                            match = false;
                            break;
                        }
                    }
                    if (match) return true;
                }
                break;
        }
        
        return false;
    }
    
    /**
     * 检查连续模式（横向、竖向、斜向）
     */
    private checkContinuousPatterns(matrix: number[][], pattern: number[][]): boolean {
        // 这里实现对连续模式的检查逻辑
        // 简化实现，实际需要检查所有可能的连续位置组合
        return false;
    }
}

// 使用示例
// const generator = new LotteryMatrixGenerator();
// const matrix = generator.generateMatrix(5, {1: 0.1, 2: 0.2, 5: 0.1});
// console.log("生成的矩阵:", matrix);
