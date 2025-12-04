import { _decorator, Component, director, instantiate, math, Node, Prefab, Vec3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { HXTJB_GameEvents } from '../Common/HXTJB_GameEvents';
const { ccclass, property } = _decorator;

@ccclass('HXTJB_DataManager')
export class HXTJB_DataManager {
    private static instance: HXTJB_DataManager;

    public static get Instance(): HXTJB_DataManager {
        if (!HXTJB_DataManager.instance) {
            HXTJB_DataManager.instance = new HXTJB_DataManager();
        }
        return HXTJB_DataManager.instance;
    }

    // 游戏状态
    isGameStart: boolean = false;

    isInit: boolean = false;

    isFail: boolean = false;

    roundData:{[debtNum: number]: {tagetScore:number,startCoins:number,MoneyMix:number,CoinMix:number,buyCoinsCount:number }} = {
        1:{ tagetScore:15,startCoins:30,MoneyMix:15 ,CoinMix:10,buyCoinsCount:5},
        2:{tagetScore:50,startCoins:30,MoneyMix:15 ,CoinMix:10,buyCoinsCount:5},
        3:{tagetScore:70,startCoins:30,MoneyMix:20 ,CoinMix:5,buyCoinsCount:5},
        4:{tagetScore:100,startCoins:30,MoneyMix:20 ,CoinMix:5,buyCoinsCount:5},
        5:{tagetScore:150,startCoins:30,MoneyMix:30 ,CoinMix:5,buyCoinsCount:5},
    }

    itemData:{[itemId: number]: { name: string; price: number; mix: number; }} = {
        1:{name:'雨币',price:30,mix:3},
    }

    addMixData:{[itemId: number]: number} = {
        2:0.2,
        3:0.4,
        4:0.6,
        5:0.8,
        6:1,
        7:1.2,
        8:1.4,
        9:1.6,
        10:1.8,
        11:2,
        12:2.2,
        13:2.4,
        14:2.6,
        15:2.8,
        16:3,
        17:3.2,
        18:3.4,
        19:3.6,
        20:3.8,
        21:4,
        22:4.2,
        23:4.4,
        24:4.6,
        25:4.8,
        26:5,
        27:5.2,
        28:5.4,
        29:5.6,
        30:5.8,
        31:6,
        32:6.2,
        33:6.4,
        34:6.6,
        35:6.8,
        36:7,
        37:7.2,
        38:7.4,
        39:7.6,
        40:7.8,
        41:8,
        42:8.2,
        43:8.4,
        44:8.6,
        45:8.8,
        46:9,
        47:9.2,
        48:9.4,
        49:9.6,
        50:9.8,
        51:10,
    }

    coinPositions: {position:Vec3,scale:Vec3,rotation:math.Quat}[] = [];

    totalRound: number = Object.keys(this.roundData).length;
    currentRound: number = 0; // 当前轮数
    currentScore: number = 0; // 当前分数
    currentSourceMix: number = 1; // 当前分数混合
    highScore: number = 0; // 最高分
    currentMoney: number = 60; // 当前金额
    currentCoins: number = 0; // 当前金币
    currentAddMix: number = 0; // 当前增加混合
    currentAttack: number = 0; // 当前增加混合

    specialCoins:{[itemId: number]: number} = {}

    currentItemCotanerCount: number = 1; 

    currentContainerPrice: number = 30; // 当前容器价格

    contanerPriceMix: number = 3; // 容器价格混合

    Tip: string = '';

    isRaining: boolean = false;

    pusherNode: Node = null; // 推送节点
    coinsLayerNode:Node = null;
    coinPrefab:Prefab = null;
    isInitData: boolean = false;
    isEndTutorial: boolean = false;

    onLoad(){

    }

    
    // 分数变化事件
    // public scoreChanged: EventEmitter = new EventEmitter();

    initCoinsPosition(coinsLayerNode:Node){
            let coinPositions = [];
            if (coinsLayerNode) {
                coinsLayerNode.children.forEach(child => {
                    coinPositions.push({
                        position: child.position,
                        scale: child.scale,
                        rotation: child.rotation
                    });
                });
            }
            this.coinPositions = coinPositions;
        // if (this.coinsLayerNode) {
        //     this.coinsLayerNode.removeAllChildren();
        // }
    }

    resetCoinsPosition(){
               // 如果有保存的硬币信息，则恢复金币
        if(this.coinPositions && this.coinPositions.length > 0) {
            // 先销毁所有现有金币
            this.coinsLayerNode.removeAllChildren();
            
            // 根据保存的信息创建金币
            this.coinPositions.forEach(coinData => {
                const coin = instantiate(this.coinPrefab);
                coin.position = coinData.position;
                coin.scale = coinData.scale;
                coin.rotation = coinData.rotation;
                this.coinsLayerNode.addChild(coin);
            });
        }
    }
    
    
    init(coinsLayerNode:Node,coinPrefab:Prefab){
        this.coinsLayerNode = coinsLayerNode;
        this.coinPrefab = coinPrefab;
        this.addEventListener();
        if(localStorage.getItem('HXTJB')){
            let data = JSON.parse(localStorage.getItem('HXTJB'));
            this.currentMoney = data.currentMoney;
            this.currentCoins = data.currentCoins;
            this.currentScore = data.currentScore;
            this.currentAddMix = data.currentAddMix;
            this.currentAttack = data.currentAttack;
            this.specialCoins = data.specialCoins;
            this.currentItemCotanerCount = data.currentItemCotanerCount;
            this.currentContainerPrice = data.currentContainerPrice;
            this.contanerPriceMix = data.contanerPriceMix;
            this.Tip = data.Tip;

             // 如果有保存的硬币信息，则恢复金币
        if(data.coinPositions && data.coinPositions.length > 0) {
            // 先销毁所有现有金币
            this.coinsLayerNode.removeAllChildren();
            
            // 根据保存的信息创建金币
            data.coinPositions.forEach(coinData => {
                const coin = instantiate(this.coinPrefab);
                coin.position = coinData.position;
                coin.scale = coinData.scale;
                coin.rotation = coinData.rotation;
                this.coinsLayerNode.addChild(coin);
            });
        }
        }else{
            this.resetCoinsPosition();
            this.initData();
            this.saveData();
        }

    }

    // startGame(){
    //     if(!this.isInitData){
    //         this.setNewRound();
    //     }
    //     else{
    //         EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_ROUND);
    //         EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_SCORE);
    //         EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_SCORE_MIX);
    //         EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_TARGET_SCORE);
    //         // EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_MONEY);
    //         // EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_COIN);
    //         EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_ADD_MIX);
    //         EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_ATTACK);

    //         EventManager.Scene.emit(HXTJB_GameEvents.UI_SHOW_GAMEUI);
    //         EventManager.Scene.emit(HXTJB_GameEvents.UI_HIDE_ALL_SCREENS);
    //         EventManager.Scene.emit(HXTJB_GameEvents.UI_SHOW_CLICK_TIP);
    //         this.isGameStart = true;
    //         this.saveData();
    //     }
    // }

    

    setNewRound(){
        this.currentRound++;
        if(this.currentRound > this.totalRound){
            this.isFail = false;
             EventManager.Scene.emit(HXTJB_GameEvents.PASS_GAME);
             return;
        }
        this.currentCoins = this.roundData[this.currentRound].startCoins;
        this.currentScore = 0;
        this.currentAddMix = 0;
        this.currentAttack = 0;
        this.currentSourceMix = 1; // 当前分数混合
        // this.specialCoins = {};
        // this.currentItemCotanerCount = 1;
        // this.currentMoney = this.roundData[this.currentRound].startCoins;
        // this.currentCoins = this.roundData[this.currentRound].startCoins;
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_ROUND);
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_SCORE);
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_SCORE_MIX);
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_TARGET_SCORE);
        // EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_MONEY);
        // EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_COIN);
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_ADD_MIX);
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_ATTACK);

        EventManager.Scene.emit(HXTJB_GameEvents.UI_SHOW_GAMEUI);
        EventManager.Scene.emit(HXTJB_GameEvents.UI_HIDE_ALL_SCREENS);
        EventManager.Scene.emit(HXTJB_GameEvents.UI_SHOW_CLICK_TIP);
        if(this.isEndTutorial){
           this.isGameStart = true;
        }

        this.saveData();
    }

    addEventListener(){

    }

    buyCoins(){
        let price = this.roundData[this.currentRound].MoneyMix;
        let coins = this.roundData[this.currentRound].CoinMix;
        if(this.currentMoney < price){
            this.Tip = '余额不足';
            EventManager.Scene.emit(HXTJB_GameEvents.UI_SHOW_TIP_PANEL);
            return;
        }
        let a= Math.random()
        // let getSpecialCoin = true;

        if(a<0.1){
            let totalCoinCount = Object.values(this.specialCoins).reduce((sum, count) => sum + count, 0);
            if(totalCoinCount >= this.currentItemCotanerCount*2){
                // getSpecialCoin = false;
            }
            else{
                coins -=1;
                if(this.specialCoins[1]){
                    this.specialCoins[1]++;
                }else{
                    this.specialCoins[1] = 1;
                }
                EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_MONEY);
                EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_SPECIAL_COINS);
            }
           
        }
        this.currentMoney -= price;
        this.currentCoins += coins;

        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_MONEY, this.currentMoney, -price);
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_COIN, this.currentCoins, this.roundData[this.currentRound].CoinMix);
        this.saveData();
    }


    buySpecialCoin(itemId: number){
        if(this.currentMoney < this.itemData[itemId].price){
            this.Tip = '余额不足';
            EventManager.Scene.emit(HXTJB_GameEvents.UI_SHOW_TIP_PANEL);
            return;
        }
        let totalCoinCount = Object.values(this.specialCoins).reduce((sum, count) => sum + count, 0);
        if(totalCoinCount >= this.currentItemCotanerCount*2){
            this.Tip = '容器已满';
            EventManager.Scene.emit(HXTJB_GameEvents.UI_SHOW_TIP_PANEL);
            return;
        }
        this.currentMoney -= this.itemData[itemId].price;
        if(this.specialCoins[itemId]){
            this.specialCoins[itemId]++;
        }else{
            this.specialCoins[itemId] = 1;
        }
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_MONEY, this.currentMoney, -this.itemData[itemId].price);
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_SPECIAL_COINS, itemId, 1);
        this.saveData();
    }

    buyContainer(){
        if(this.currentMoney < this.currentContainerPrice){
            return;
        }
        if(this.currentItemCotanerCount >= 5){
            this.Tip = '容器数量达上限';
            EventManager.Scene.emit(HXTJB_GameEvents.UI_SHOW_TIP_PANEL);
            return;
        }
        this.currentMoney -= this.currentContainerPrice;
        this.currentItemCotanerCount++;
        this.contanerPriceMix = Math.floor(this.currentContainerPrice * this.contanerPriceMix);
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_MONEY, this.currentMoney, -this.currentContainerPrice);
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_CURRENT_ITEM_CONTAINER_COUNT, this.currentItemCotanerCount, 1);
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_CONTAINER_PRICE, this.currentContainerPrice, this.currentContainerPrice * this.contanerPriceMix);
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_SPECIAL_COINS);
        this.saveData();
    }

      // 连击计时器
      private comboTimeout: number = null;
    // 加分
    addScore(value: number) {
        if (value <= 0) return;
        
        // 增加连击计数
        this.currentAttack++;
        
        // 触发连击效果
        if (this.currentAttack > 2) {
            // 清除之前的计时器
            if (this.comboTimeout) {
                clearTimeout(this.comboTimeout);
            }
            
            // 设置连击加成
            this.currentAddMix = this.addMixData[Math.min(this.currentAttack, 8)] || 0;
            this.currentSourceMix += this.currentAddMix;
            
            // 设置连击超时重置
            this.comboTimeout = setTimeout(() => {
                this.currentAttack = 0;
                this.currentAddMix = 0;
                this.currentSourceMix = 1;
                EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_ATTACK);
                EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_ADD_MIX);
                EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_SCORE_MIX);
            }, 2000);
        }
        
        // 计算分数
        this.currentScore += value * this.currentSourceMix;
        this.currentMoney += value;
        
        // 触发事件
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_SCORE, this.currentScore, value);
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_MONEY, this.currentMoney, value);
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_ATTACK);
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_ADD_MIX);
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_SCORE_MIX);
        
        // 检查最高分
        if (this.currentScore > this.highScore) {
            this.highScore = this.currentScore;
            this.saveHighScore();
            EventManager.Scene.emit(HXTJB_GameEvents.NEW_HIGH_SCORE, this.highScore);
        }
        this.saveData();
    }

    private resetAttack(){
        this.currentAttack = 0;
        this.currentAddMix = 0;
        this.currentSourceMix = 1;
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_ATTACK);
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_ADD_MIX);
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_SCORE_MIX);
    }
    
    // // 获取当前分数
    // getCurrentScore(): number {
    //     return this.currentScore;
    // }
    
    // // 获取最高分
    // getHighScore(): number {
    //     return this.highScore;
    // }
    
    // 重置当前分数
    resetCurrentScore() {
        this.currentScore = 0;
        EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_SCORE, this.currentScore, 0);
    }
    
    // 保存最高分到本地存储
    private saveHighScore() {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('coinPusherHighScore', this.highScore.toString());
        }
    }
    
    // 从本地存储加载最高分
    private loadHighScore() {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('coinPusherHighScore');
            this.highScore = saved ? parseInt(saved) : 0;
        }
    }

    useSpecialCoin(itemId: number){
        if(this.specialCoins[itemId] && this.specialCoins[itemId] > 0){
            if(itemId == 1){
                if(HXTJB_DataManager.Instance.isRaining) {
                    this.Tip = '当前正在下雨';
                    EventManager.Scene.emit(HXTJB_GameEvents.UI_SHOW_TIP_PANEL);
                    return false;
                }
                EventManager.Scene.emit(HXTJB_GameEvents.START_RAIN);
            }
            this.specialCoins[itemId]--;
            EventManager.Scene.emit(HXTJB_GameEvents.UPDATE_SPECIAL_COINS, itemId, -1);
            this.saveData();
            return true;
        }
        else{
            this.Tip = '当前没有雨币';
            EventManager.Scene.emit(HXTJB_GameEvents.UI_SHOW_TIP_PANEL);
        }
        return false;
    }

    
    hasSpecialCoins(): boolean {
        if (Object.keys(this.specialCoins).length === 0) return false;
        return Object.values(this.specialCoins).some(count => count > 0);
    }


    saveData(){
        // if (typeof localStorage !== 'undefined') {
        //     let coinPositions = [];
        //     if (this.coinsLayerNode) {
        //         this.coinsLayerNode.children.forEach(child => {
        //             coinPositions.push({
        //                 position: child.position,
        //                 scale: child.scale,
        //                 rotation: child.rotation
        //             });
        //         });
        //     }
            
        //     let data = {
        //         currentMoney: this.currentMoney,
        //         currentCoins: this.currentCoins,
        //         currentScore: this.currentScore,
        //         currentAddMix: this.currentAddMix,
        //         currentAttack: this.currentAttack,
        //         specialCoins: this.specialCoins,
        //         currentItemCotanerCount: this.currentItemCotanerCount,
        //         currentContainerPrice: this.currentContainerPrice,
        //         contanerPriceMix: this.contanerPriceMix,
        //         Tip: this.Tip,
        //         coinPositions: coinPositions
        //     }
        //     localStorage.setItem('HXTJB', JSON.stringify(data));
        // }
    }

    // 初始化数据
    // 初始化数据
    initData() {
        if(!this.isEndTutorial)
        this.isEndTutorial = false;

        this.isInitData = true;
        // this.isGameStart = false;

        // this.currentRound = 0;
        // this.currentScore = 0;
        // this.currentAddMix = 0;
        // this.currentAttack = 0;
        // this.currentSourceMix = 1; // 当前分数混合
        // this.specialCoins = {};
        // this.currentItemCotanerCount = 1;
        this.isGameStart = false;
        this.isInit = false;
        this.isFail = false;
        this.currentRound = 0;
        this.currentScore = 0;
        this.currentSourceMix = 1;
        this.currentMoney = 60;
        this.currentCoins = 0;
        this.currentAddMix = 0;
        this.currentAttack = 0;
        this.specialCoins = {};
        this.currentItemCotanerCount = 1;
        this.currentContainerPrice = 30;
        this.contanerPriceMix = 3;
        this.Tip = '';
        this.isRaining = false;


        
    }
    
    passLevel() {
        // 关卡通过逻辑可以在这里实现
    }
}
