import { _decorator, Component, Node } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { EMLHJ_GameEvents } from '../Common/EMLHJ_GameEvents';
import { EMLHJ_WinInfo } from '../Common/EMLHJ_WinInfo';
const { ccclass, property } = _decorator;

@ccclass('EMLHJ_DataManager')
export class EMLHJ_DataManager {
    private static instance: EMLHJ_DataManager;

    public static get Instance(): EMLHJ_DataManager {
        if (!EMLHJ_DataManager.instance) {
            EMLHJ_DataManager.instance = new EMLHJ_DataManager();
        }
        return EMLHJ_DataManager.instance;
    }

    // 游戏状态
    isGameStart: boolean = false;

    isFail : boolean = false;

    
    // 金币相关
    coin: number = 100;          // 当前金币数
    coinAdd: number = 0;        // 新增金币数
    
    // 钞票相关
    money: number = 35;         // 当前钞票数
    moneyAdd: number = 0;      // 新增钞票数
    endMoneyAdd:number = 0;
    
    // 剩余次数
    remaining: number = 100;     // 剩余游戏次数

    isGotMoney: boolean = false;

    remainRound: number = 0;     // 剩余游戏次数

    interest:number = 0; // 剩余游戏次数
    
    // 奖励
    totalReward: number = 0;     // 总奖励

    currentDebtNum:number = 0;      // 当前负债

    currentSave = 20;

    Tip: string = '';

    debtsData :{[debtNum: number]: {debt:number,singleSave:number,rate:number ,round:number,endDec:string}} = {
        1:{ debt:75,rate:0.1 ,singleSave:3,round:3,endDec:"运气不错嘛，可惜新的一轮债务已经开始了，这次需要还款200金币，合理利用商城的道具，祝你好运。"},
        2:{ debt:200,rate:0.05 ,singleSave:33,round:5,endDec:"运气不错嘛，可惜新的一轮债务已经开始了，这次需要还款666金币，这次还款完你就可以离开了"},
        3:{ debt:666,rate:0.03 ,singleSave:66,round:7,endDec:"恭喜还完债务，你可以离开了，最好别在让我再见到你！"},
    }



        // 奖项配置：key为幸运值阈值，value为最高可中奖项
    readonly LUCK_THRESHOLDS = {
        3: 3,    // 3点幸运值最高中3等奖
        5: 5,    // 5点幸运值最高中5等奖
        7: 7,    // 7点幸运值最高中6等奖
        10: 11   // 10点幸运值最高中11等奖(头奖)
    };
    
    // 各奖项对应的概率算法（不同幸运值范围使用不同算法）
    readonly PRIZE_PROBABILITY_ALGORITHMS = {
        1: [0.1, 0.10, 0.15, 0.1, 0, 0, 0, 0, 0, 0, 0],  // 算法1：对应幸运值≤3
        2: [0.10, 0.10, 0.15, 0.10, 0.10, 0, 0, 0, 0, 0, 0],  // 算法2：对应幸运值≤5
        3: [0.05, 0.05, 0.05, 0.15, 0.25, 0.25, 0.2, 0, 0, 0, 0],  // 算法3：对应幸运值≤7
        4: [0.03, 0.03, 0.03, 0.12, 0.2, 0.25, 0.15, 0.05, 0.05, 0.05, 0.1]  // 算法4：对应幸运值≤10
    };
    

        
    // 中奖模式定义（11种）
    readonly PATTERNS = {
        1:{ name: "横", multiplier: 1.0 },
        2:{ name: "竖",  multiplier: 1.0 },
        3:{ name: "斜",  multiplier: 1.0 },
        4:{ name: "横大",  multiplier: 2.0 },
        5:{ name: "横超大",  multiplier: 3.0 },
        6:{ name: "之字",  multiplier: 4.0 },
        7:{ name: "锯齿",  multiplier: 4.0 },
        8:{ name: "上方", multiplier: 7.0 },
        9:{ name: "下方",  multiplier: 7.0 },
        10:{ name: "邪眼阵",  multiplier: 8.0 },
        11:{ name: "头奖",  multiplier: 10.0 }
    }

     
    ICONS = {
        1:{ multiplier: 2, probability: 14.3 },
        2:{ multiplier: 2, probability: 14.3 },
        3:{ multiplier: 3, probability: 14.3 },
        4:{ multiplier: 3, probability: 14.3 },
        5:{ multiplier: 5, probability: 14.3 },
        6:{ multiplier: 5, probability: 14.3 },
        7:{ multiplier: 7, probability: 14.3 }
    }

    iconProbabilitys:{[key: number]: number} = {}

    basicLuckyValue: number = 3;

    ItemData = {
        1:{ name: "幸运辣椒", itemId:1,type:"addLuckyValue",price:5, desc: "提高5点幸运值，增加中奖概率，能加持5次旋转", Count:5, addLuckyValue :5,multiplier: 1.0 },
        2:{ name: "黄金柠檬", itemId:2,type:"addIconProbability", price:7, desc: "柠檬的出现概率大大增加，并提高2点幸运值，能维持5次旋转",Count:5,iconId:1, addProbability :0.7, addLuckyValue :3,multiplier: 1.0 },
    }

    GotItem = []
    
    // 当前奖励信息
    currentRewards: {
        patternRewards: number[], // 每个奖项的中奖矩阵对应的奖励
        total: number              // 所有奖励的总和
    } = {
        patternRewards: [],
        total: 0
    };

    
    init(){
        this.addEventListener();
        this.initData();
    }

    addEventListener(){
         // 监听开始旋转事件
        EventManager.on(EMLHJ_GameEvents.START_SPIN, this.updateRemaining, this);
    }

    getNewItem(itemId: number){
        let itemData = this.ItemData[itemId]
        if(itemData){
            this.GotItem.push({itemId:itemId, remainCount:itemData.Count});
            if(itemData.type == "addLuckyValue"){
                this.basicLuckyValue += itemData.addLuckyValue;
            }
            else if(itemData.type == "addIconProbability"){
                this.updateIconProbability();
            }
            this.money -= itemData.price;
            EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_MONEY);
            EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_ITEMS);
        }
    }


    setNewDebt(){
        this.currentDebtNum++;
        this.remaining = -1;
        this.interest = 0;
        this.currentSave = 0;
        if(!this.debtsData[this.currentDebtNum]){
            EventManager.Scene.emit(EMLHJ_GameEvents.PASS_GAME)  
        }
        else{
            this.currentSave = 0;
            this.setRound(this.debtsData[this.currentDebtNum].round);
            // EventManager.Scene.emit(EMLHJ_GameEvents.START_NEW_DEBT);
        }
    }



    setRound(round:number){
        this.remainRound = round;
        this.updateRound();
    }

    updateRound(){
        this.remainRound--;
        EventManager.Scene.emit(EMLHJ_GameEvents.SHOW_NEW_DEBT);
        EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_ROUND);
        EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_REMAINING);
        EventManager.Scene.emit(EMLHJ_GameEvents.START_NEW_DEBT);
        EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_INTEREST);
        EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_SAVE);
    }
    

    resetCurrentRewards(){
        this.currentRewards = {
            patternRewards: [],
            total: 0
        };
    }

    calculateInterest(){
        this.interest = Math.floor(this.currentSave * this.debtsData[this.currentDebtNum].rate);
        // this.money += interest;
        EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_INTEREST);
    }

    /**
     * 计算中奖奖励
     * @param matrix 生成的矩阵
     * @param winInfo 中奖信息
     */
    calculateRewards(matrix: number[][], winInfo: EMLHJ_WinInfo): void {
        const patternRewards: number[] = [];
        let total = 0;

        // 遍历所有奖项模式
        for (let i = 0; i < winInfo.patterns.length; i++) {
            const patternMatrices = winInfo.patterns[i];
            const multiplier = winInfo.multipliers[i];
            const patternReward: number[] = [];

            // 遍历该奖项下的所有中奖矩阵
            for (const winMatrix of patternMatrices) {
                let reward = 0;
                
                // let isGetReward :boolean = false;
                // 计算该中奖矩阵的奖励
                for (let row = 0; row < 3 /*|| !isGetReward*/; row++) {
                    for (let col = 0; col < 5 /*|| !isGetReward*/; col++) {
                        if (winMatrix[row][col] === 1) {
                            // 获取该位置的图案ID
                            const symbolId = matrix[row][col];
                            // 获取该图案的基础奖励
                            const baseReward = this.ICONS[symbolId]?.multiplier || 0;
                            // 累加奖励
                            reward = baseReward;
                            // isGetReward = true;
                        }
                    }
                }
                
                // 应用该奖项的倍数
                reward *= multiplier;
                patternRewards.push(reward);
                total += reward;
            }

            // patternRewards.push(patternReward);
        }

        // 保存计算结果
        this.currentRewards = {
            patternRewards,
            total
        };

        console.log("奖励计算完成:", this.currentRewards);
    }


    isItemGot(itemId: number):boolean{
        for(let item of this.GotItem){
            if(item.itemId == itemId){
                return true;
            }
        }
        return false
    }

    getGotItemRemainCount(itemId: number): number{
        let item = this.GotItem.find(item => item.itemId == itemId);
        if(item){
            return item.remainCount;
        }
        return 0;
    }

     updateGotItemRemainCount(itemId: number){
        let itemIndex = this.GotItem.findIndex(item => item.itemId == itemId);
        if(itemIndex >= 0){
            this.GotItem[itemIndex].remainCount--;
            if(this.GotItem[itemIndex].remainCount <= 0){
                let itemData = this.ItemData[this.GotItem[itemIndex].itemId];
                if(itemData){
                    if(itemData.type == "addLuckyValue"){
                        this.basicLuckyValue -= itemData.addLuckyValue;
                    }
                    else if(itemData.type == "addIconProbability"){
                        this.updateIconProbability();
                    }
                }
                this.GotItem.splice(itemIndex, 1); // 从数组中移除该物品
            }
        }
    }


    updateIconProbability() {
        // 重置概率累加器
        this.iconProbabilitys = {};
        
        // 1. 遍历所有已获得的道具，收集每个符号的总增加概率
        this.GotItem.forEach(gotItem => {
            const itemData = this.ItemData[gotItem.itemId];
            // 只处理类型为增加符号概率的道具
            if (itemData && itemData.type === "addIconProbability" && gotItem.remainCount > 0) {
                const { iconId, addProbability } = itemData;
                if (iconId && addProbability) {
                    // 累加相同符号的概率增加值
                    if (this.iconProbabilitys[iconId]) {
                        this.iconProbabilitys[iconId] += addProbability;
                    } else {
                        this.iconProbabilitys[iconId] = 0.143 + addProbability;
                    }
                }
            }
        });
        
        // 2. 计算总增加概率
        const totalAddedProbability = Object.values(this.iconProbabilitys).reduce((sum, val) => sum + val, 0);
        
        // 3. 计算剩余可分配概率
        const remainingProbability = Math.max(0, 1 - totalAddedProbability);
        
        // 4. 找出没有增加概率的符号
        const allIconIds = Object.keys(this.ICONS).map(Number);
        const iconsWithoutAddition = allIconIds.filter(iconId => !this.iconProbabilitys[iconId]);
        const countWithoutAddition = iconsWithoutAddition.length;
        
        // 5. 计算无增加概率符号的平均分配概率
        const evenDistribution = countWithoutAddition > 0 ? remainingProbability / countWithoutAddition : 0;
        
        // 6. 更新所有符号的最终概率
        allIconIds.forEach(iconId => {
            if (this.iconProbabilitys[iconId]) {
                // 有增加概率的符号
                this.ICONS[iconId].probability = (this.iconProbabilitys[iconId])*100 ;
            } else {
                // 无增加概率的符号，平分剩余概率
                this.ICONS[iconId].probability = evenDistribution * 100;
            }
        });
        EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_REMAINING);
        
    }



    updateRemaining(){
        this.remaining--;
        if(this.remaining <= 0){
            this.remaining = 0;
        }
        if(this.GotItem.length > 0){
            for(let i = 0; i < this.GotItem.length; i++){
                this.updateGotItemRemainCount(this.GotItem[i].itemId);
            }
        }
        // 发送更新剩余次数事件
        EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_REMAINING);
    }


    setRemaining(value: number){
        this.remaining = value;
    }

    // 初始化数据
    // 初始化数据
    initData() {
        this.isGameStart = false;
        this.isFail = false;
        this.coin = 75;
        this.coinAdd = 0;
        this.money = 2;
        this.moneyAdd = 0;
        this.remaining = 100;
        this.remainRound = 0;
        this.interest = 0;
        this.totalReward = 0;
        this.currentDebtNum = 0;
        this.currentSave = 0;
        this.basicLuckyValue = 5;
        this.GotItem = [];
        this.isGotMoney = false;
        this.resetCurrentRewards();
    }
    
    passLevel() {
        // 关卡通过逻辑可以在这里实现
    }
}
