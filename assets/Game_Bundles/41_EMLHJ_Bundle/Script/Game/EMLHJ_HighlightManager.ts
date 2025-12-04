import { _decorator, Component, Node, Sprite, Tween, Vec3, Color, Label, tween } from 'cc';
import { EMLHJ_WinInfo } from '../Common/EMLHJ_WinInfo';
import { EMLHJ_SymbolNodeInfo } from '../Common/EMLHJ_SymbolNodeInfo';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { EMLHJ_GameEvents } from '../Common/EMLHJ_GameEvents';
import { EMLHJ_DataManager } from '../Manager/EMLHJ_DataManager';
const { ccclass, property } = _decorator;


// 高亮效果参数，同一中奖数组的效果需一致
interface EMLHJ_HighlightParams {
    color: Color; // 背景闪烁颜色
    scale: number; // 背景和Label的缩放比例
}

@ccclass('EMLHJ_HighlightManager')
export class EMLHJ_HighlightManager extends Component {
    // 结果图案节点数组（3*5）
    // private resultNodes: Node[][] = [];
    private resultSymbolMatrix:(EMLHJ_SymbolNodeInfo | null)[][] = [];
    // 当前正在处理的中奖数组索引
    private currentWinPatternIndex = 0;
    // 当前正在处理的奖项索引
    private currentAwardIndex = 0;
    // 所有需要高亮的中奖数组集合
    private allWinPatterns: number[][][] = [];
    // 高亮效果参数缓存，用于同一中奖数组保持效果一致
    private highlightParamsMap: Map<number[][], EMLHJ_HighlightParams> = new Map();

    // /**
    //  * 初始化，接收结果图案节点数组
    //  * @param nodes 3*5的结果图案节点数组
    //  */
    // public initialize(nodes: Node[][]) {
    //     this.resultNodes = nodes;
    // }

    /**
     * 开始高亮中奖图案
     * @param winInfo 中奖信息
     */
    public startHighlight(winInfo: EMLHJ_WinInfo,resultSymbolMatrix:(EMLHJ_SymbolNodeInfo | null)[][]) {
        this.resultSymbolMatrix = resultSymbolMatrix;
        this.currentWinPatternIndex = 0;
        this.currentAwardIndex = 0;    
        // 收集所有需要高亮的中奖数组
        this.collectAllWinPatterns(winInfo);
        if (this.allWinPatterns.length === 0) {
            // 没有中奖，直接发射高亮结束事件
            this.emitHighlightEnd();
            return;
        }
        // 开始处理第一个中奖数组
        this.processNextWinPattern();
    }

    /**
     * 收集所有需要高亮的中奖数组
     * @param winInfo 中奖信息
     */
    private collectAllWinPatterns(winInfo: EMLHJ_WinInfo) {
        this.allWinPatterns = [];
        // 遍历每个奖项的中奖数组
        for (let awardIndex = 0; awardIndex < winInfo.patterns.length; awardIndex++) {
            const winPatterns = winInfo.patterns[awardIndex];
            for (const winPattern of winPatterns) {
                this.allWinPatterns.push(winPattern);
            }
        }
    }

    /**
     * 处理下一个中奖数组的高亮
     */
    private processNextWinPattern() {
        if (this.currentWinPatternIndex >= this.allWinPatterns.length) {
            // 所有中奖数组处理完毕，发射高亮结束事件
            this.emitHighlightEnd();
            return;
        }
        const winPattern = this.allWinPatterns[this.currentWinPatternIndex];
        // 获取或生成该中奖数组的高亮效果参数
        let params = this.highlightParamsMap.get(winPattern);
        if (!params) {
            params = this.generateHighlightParams();
            this.highlightParamsMap.set(winPattern, params);
        }
        // 高亮该中奖数组对应的图案节点
        this.highlightWinPattern(winPattern, params);
     
        // 延迟处理下一个中奖数组
        setTimeout(() => {
            this.cancelHighlight()
        }, 700); // 高亮维持0.7秒 + 暂停0.2秒 = 0.9秒

        setTimeout(() => {
            this.currentWinPatternIndex++;
            this.processNextWinPattern();
        }, 900); // 高亮维持0.7秒 + 暂停0.2秒 = 0.9秒
    }

     // 新增取消高亮方法
     private cancelHighlight() {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 5; col++) {
                const node = this.resultSymbolMatrix[row][col]?.node;
                if (node) {
                    // 隐藏高亮框
                    const selectedNode = node.getChildByName('selected');
                    selectedNode.active = false;
                    
                    // 恢复背景初始状态
                    const bgNode = node.getChildByName('bg');
                    if (bgNode) {
                        bgNode.active = false;
                        const sprite = bgNode.getComponent(Sprite);
                        sprite?.node.setScale(Vec3.ONE);
                    }
                    
                    // 恢复Label初始状态
                    const labelNode = node.getChildByName('Label');
                    if (labelNode) {
                        labelNode.active = false;
                        labelNode.setScale(Vec3.ONE);
                        // const label = labelNode.getComponent(Label);
                        // label?.node.setScale(Vec3.ONE);
                    }
                }
            }
        }
    }


    /**
     * 生成高亮效果参数（随机颜色、缩放）
     * @returns 高亮效果参数
     */
    private generateHighlightParams(): EMLHJ_HighlightParams {
        // 生成高纯度高亮度的随机颜色
        const colors = [
            new Color(255, 0, 0),     // 红
            new Color(255, 165, 0),   // 橙
            new Color(255, 255, 0),   // 黄
            new Color(0, 255, 0),     // 绿
            new Color(0, 0, 255),     // 蓝
            new Color(0, 255, 255),   // 青
            new Color(255, 0, 255)    // 紫
        ];
        // 随机选择颜色
        const color = colors[Math.floor(Math.random() * 7)];
        // 生成随机缩放比例（0.9 - 1.2）
        const scale = 0.9 + Math.random() * 0.3;
        return { color, scale };
    }

    /**
     * 高亮指定中奖数组对应的图案节点
     * @param winPattern 中奖数组
     * @param params 高亮效果参数
     */
    private highlightWinPattern(winPattern: number[][], params: EMLHJ_HighlightParams) {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 5; col++) {
                if (winPattern[row][col] === 1) {
                    // const node = this.resultNodes[row][col];
                    const node = this.resultSymbolMatrix[row][col]?.node;
                    if (node) {
                        // 显示高亮框子节点“selected”
                        const selectedNode = node.getChildByName('selected');
                        if (selectedNode) {
                            selectedNode.active = true;
                        }
                        // 处理背景闪烁节点
                        const bgNode = node.getChildByName('bg');
                        if (bgNode) {
                            bgNode.active = true;
                            const sprite = bgNode.getComponent(Sprite);
                            if (sprite) {
                                // 保存初始颜色和缩放
                                bgNode.scale = new Vec3(0.8, 0.8, 0.8);
                                // 使用tween实现从0到1.5的缩放过渡
                                tween(bgNode)
                                    .to(0.3, { scale: new Vec3(1.3, 1.3, 1.3) }, { easing: 'smooth' })
                                    .to(0.3, { scale: new Vec3(1.05, 1.05, 1.05) }, { easing: 'smooth' })
                                    .start();
                                // 保存初始颜色
                                const originalColor = sprite.color.clone();
                                // 生成随机颜色并平滑过渡
                                const colors = [
                                    new Color(255, 0, 0),     // 红
                                    new Color(255, 165, 0),   // 橙
                                    new Color(255, 255, 0),   // 黄
                                    new Color(0, 255, 0),     // 绿
                                    new Color(0, 0, 255),     // 蓝
                                    new Color(0, 255, 255),   // 青
                                    new Color(255, 0, 255)    // 紫
                                ];
                                // 随机选择颜色
                                const randomColor = colors[Math.floor(Math.random() * 7)];
                                // const randomColor = new Color();
                                // randomColor.fromHSV(Math.random() * 360, 0.8 + Math.random() * 0.2, 0.8 + Math.random() * 0.2);
                                tween(sprite)
                                    .to(0.3, { color: randomColor }, { easing: 'smooth' })
                                    .to(0.4, { color: originalColor }, { easing: 'smooth' })
                                    .start();
                            }
                        }
                        // 处理Label子节点
                        const labelNode = node.getChildByName('Label');
                        if (labelNode) {
                            labelNode.active = true;
                            const label = labelNode.getComponent(Label);
                            if (label) {
                                // 设置Label内容为图案编号（这里假设节点名字就是编号）
                                // label.string = "+"+this.resultSymbolMatrix[row][col].symbolId.toString();
                                // 从图标数据中获取当前图案的概率
                                const reward = EMLHJ_DataManager.Instance.currentRewards.patternRewards[this.currentWinPatternIndex];
                                // if (icon) {
                                    label.string = `${reward}`;
                                // }
                                labelNode.scale = new Vec3(0, 0, 0);
                                // 使用tween实现从0到1.5的缩放过渡
                                tween(labelNode)
                                    .to(0.3, { scale: new Vec3(1.7, 1.7, 1.7) }, { easing: 'smooth' })
                                    .to(0.3, { scale: new Vec3(1.3, 1.3, 1.3) }, { easing: 'smooth' })
                                    .start();
                                // 保存初始颜色
                                const originalColor = label.color.clone();
                                // 生成随机颜色并平滑过渡
                                const colors = [
                                    new Color(255, 0, 0),     // 红
                                    new Color(255, 165, 0),   // 橙
                                    new Color(255, 255, 0),   // 黄
                                    new Color(0, 255, 0),     // 绿
                                    new Color(0, 0, 255),     // 蓝
                                    new Color(0, 255, 255),   // 青
                                    new Color(255, 0, 255)    // 紫
                                ];
                                // 随机选择颜色
                                const randomColor = colors[Math.floor(Math.random() * 7)];
                                // const randomColor = new Color();
                                // randomColor.fromHSV(Math.random() * 360, 0.8 + Math.random() * 0.2, 0.8 + Math.random() * 0.2);
                                tween(label)
                                    .to(0.3, { color: randomColor }, { easing: 'smooth' })
                                    .to(0.4, { color: originalColor }, { easing: 'smooth' })
                                    .start();
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * 发射高亮结束事件
     */
    private emitHighlightEnd() {
        // 这里假设使用EventTarget来发射事件，需根据项目实际事件管理方式调整
        // 示例：this.node.emit('HightLightEnd');
        console.log('HightLightEnd');
        EventManager.Scene.emit(EMLHJ_GameEvents.SPIN_FINISHED)
    }
}
