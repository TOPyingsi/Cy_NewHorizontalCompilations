import { _decorator, Component, Label, Node, Tween, tween, Vec3 } from 'cc';
import { EMLHJ_DataManager } from '../Manager/EMLHJ_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { EMLHJ_GameEvents } from '../Common/EMLHJ_GameEvents';
const { ccclass, property } = _decorator;

@ccclass('EMLHJ_ATMPanel')
export class EMLHJ_ATMPanel extends Component {
  @property(Node)
    btnBack: Node = null;

    @property(Label)
    lblRemainRound: Label = null;

    @property(Label)
    lblDebt: Label = null;
        
    @property(Label)
    lblSave: Label = null;
        
    @property(Label)
    lblRate: Label = null;
        
    @property(Label)
    lblInterest: Label = null;

    @property(Label)
    lblCoin: Label = null;

    @property(Label)
    lblMoney: Label = null;

    @property(Node)
    coinsLayer: Node = null;

    @property(Node)
    money: Node = null;

    @property(Node)
    pushCoinLayer: Node = null;

    @property(Node)
    btnSave: Node = null;


    isAddedEvent: boolean = false;

    isSaving: boolean = false;

    tween: Tween<Node>;
    tween2: Tween<Node>;

    protected start(): void {
        if(!this.isAddedEvent){
            this.registerEvents();
            this.isAddedEvent = true;
        }
    }


    // 初始化UI
    initUI() {
        if(!this.isAddedEvent){
            this.registerEvents();
            this.isAddedEvent = true;
        }
        EMLHJ_DataManager.Instance.calculateInterest();
        // this.updateInterest();
        this.updateRound();
        this.updateDebt();
        this.updateMoney();
        this.updateCoin();
        this.updateSave();

        if (EMLHJ_DataManager.Instance.remaining == 0 && !EMLHJ_DataManager.Instance.isGotMoney) {
            EMLHJ_DataManager.Instance.isGotMoney = true;
            this.spitInterestCoin();
            this.spitMoney();
        }
    }

    spitInterestCoin(){
        const interest = EMLHJ_DataManager.Instance.interest;
        if(interest <= 0) return;

        // 获取需要动画的硬币数量（1-3个）
        const coinCount = Math.min(3, interest);
        const coins = this.coinsLayer.children.slice(0, coinCount);
        
        // 存储原始位置
        const originalPositions = coins.map(coin => coin.position.clone());

        // 创建动画序列
        coins.forEach((coin, index) => {
            const moveDistance = 180 + Math.random() * 30;
            const originalPos = originalPositions[index];

            // 下落动画
            tween(coin)
                .to(1, { position: new Vec3(originalPos.x, originalPos.y - moveDistance, 0) })
                .delay(1) // 保持1秒
                // .to(0.5, { position: originalPos }) 
                .call(() => {
                    coin.setPosition(originalPos);
                    // 最后一个硬币复位后触发事件
                    if(index === coinCount-1) {
                        EMLHJ_DataManager.Instance.coin +=  EMLHJ_DataManager.Instance.interest;
                        EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_COIN);
                    }
                })
                .start();
        });
    }

    spitMoney(){
        let moveDistance = 70
        let originalPos = this.money.position.clone()
          // 下落动画
          tween(this.money)
          .to(1, { position: new Vec3(originalPos.x, originalPos.y - moveDistance, 0) })
          .delay(1) // 保持1秒
          .call(() => {
              // 最后一个硬币复位后触发事件
                    this.money.setPosition(originalPos);
            //   if(index === coinCount-1) {
                  EMLHJ_DataManager.Instance.money +=  EMLHJ_DataManager.Instance.endMoneyAdd;
                  EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_MONEY);
            //   }
            if(EMLHJ_DataManager.Instance.remainRound > 0){
                EMLHJ_DataManager.Instance.updateRound();
            }
                
                // this.showReturnBtnAnim();
                this.showSaveBtnAnim();
          })
          .start();
    }

    saveMoney(){
        if(this.tween2){
            this.tween2.stop();
            this.tween2 = null;
            this.btnSave.scale = new Vec3(1,1,1);
        }

        if(EMLHJ_DataManager.Instance.coin <= 0){
            EMLHJ_DataManager.Instance.Tip = "金币不足";
            EventManager.Scene.emit(EMLHJ_GameEvents.UI_SHOW_TIP_PANEL)
            return;
        }


        if(this.isSaving)return;

        this.isSaving = true;

        const coins = this.pushCoinLayer.children;
        // 存储原始位置
        const originalPositions = coins.map(coin => coin.position.clone());
        
        coins.forEach((coin, index) => {
            coin.active = false; // 初始隐藏
            
            // 延迟激活（每个间隔0.2秒）
            setTimeout(() => {
                coin.active = true;
                const originalPos = originalPositions[index];
                
                // 向左移动动画
                tween(coin)
                    .to(0.2, { position: new Vec3(originalPos.x - 200, originalPos.y, 0) })
                    .call(() => {
                        coin.active = false;
                        coin.position = originalPos; // 复位位置
                    
                        // 最后一个硬币动画完成时
                        if(index === coins.length - 1) {
                                this.isSaving = false;
                            if(EMLHJ_DataManager.Instance.coin > EMLHJ_DataManager.Instance.debtsData[EMLHJ_DataManager.Instance.currentDebtNum].singleSave){
                                EMLHJ_DataManager.Instance.coin -= EMLHJ_DataManager.Instance.debtsData[EMLHJ_DataManager.Instance.currentDebtNum].singleSave;
                                EMLHJ_DataManager.Instance.currentSave += EMLHJ_DataManager.Instance.debtsData[EMLHJ_DataManager.Instance.currentDebtNum].singleSave
                                EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_SAVE);
                                EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_COIN);
                                // EventManager.Scene.emit(EMLHJ_GameEvents.START_NEW_DEBT);

                                if(EMLHJ_DataManager.Instance.currentSave >= EMLHJ_DataManager.Instance.debtsData[EMLHJ_DataManager.Instance.currentDebtNum].debt){
                                    // EventManager.Scene.emit(EMLHJ_GameEvents.PASS_GAME);
                                    EventManager.Scene.emit(EMLHJ_GameEvents.UI_SHOW_PHONE_PANEL);
                                }
                                EMLHJ_DataManager.Instance.calculateInterest();
                                // this.showReturnBtnAnim();
                            }
                            else{
                                EMLHJ_DataManager.Instance.currentSave += EMLHJ_DataManager.Instance.coin;
                                EMLHJ_DataManager.Instance.coin = 0;
                                EMLHJ_DataManager.Instance.calculateInterest();
                                EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_SAVE);
                                EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_COIN);
                                if(EMLHJ_DataManager.Instance.remainRound > 0 || EMLHJ_DataManager.Instance.remaining > 0 ){
                                    return;
                                }
                                EventManager.Scene.emit(EMLHJ_GameEvents.END_GAME);
                            }
                        }
                    })
                    .start();
            }, index * 200); // 每个间隔200ms
        });
    }

    showReturnBtnAnim(){

            // 保存原始缩放值
            const originalScale = this.btnBack.scale.clone();
            
            // 创建循环缩放动画
            this.tween = new Tween(this.btnBack)
                .to(0.5, { scale: new Vec3(originalScale.x * 1.2, originalScale.y * 1.2, originalScale.z) })
                .to(0.5, { scale: originalScale })
                .union()
                .repeatForever()
                .start();
                
            // // 监听按钮点击事件
            // this.btnATMPanel.on(Button.EventType.CLICK, () => {
            //     // 停止动画
               
            //     // 恢复原始缩放
            //     // this.btnATMPanel.scale = originalScale;
            //     // 移除点击监听
            //     this.btnATMPanel.off(Button.EventType.CLICK);
            // }, this);
    }

     showSaveBtnAnim(){


            // 保存原始缩放值
            const originalScale = this.btnSave.scale.clone();
            
            // 创建循环缩放动画
            this.tween2 = new Tween(this.btnSave)
                .to(0.5, { scale: new Vec3(originalScale.x * 1.2, originalScale.y * 1.2, originalScale.z) })
                .to(0.5, { scale: originalScale })
                .union()
                .repeatForever()
                .start();
                
            // // 监听按钮点击事件
            // this.btnATMPanel.on(Button.EventType.CLICK, () => {
            //     // 停止动画
               
            //     // 恢复原始缩放
            //     // this.btnATMPanel.scale = originalScale;
            //     // 移除点击监听
            //     this.btnATMPanel.off(Button.EventType.CLICK);
            // }, this);
        
    }

    updateRound(){
        this.lblRemainRound.string ="剩余轮次："+ (EMLHJ_DataManager.Instance.remainRound).toString();
        if(EMLHJ_DataManager.Instance.remainRound == 0){
            EMLHJ_DataManager.Instance.Tip = "本次债务进入最后一轮，请在旋转次数用完之后还清债务";
            EventManager.Scene.emit(EMLHJ_GameEvents.UI_SHOW_TIP_PANEL)
        }
    }

    updateDebt(){
        // let totalRound =  EMLHJ_DataManager.Instance.debtsData[EMLHJ_DataManager.Instance.currentDebtNum].round
        // let remainRound =  EMLHJ_DataManager.Instance.remainRound;
        this.lblDebt.string = EMLHJ_DataManager.Instance.debtsData[EMLHJ_DataManager.Instance.currentDebtNum].debt.toString();
        this.lblRate.string = EMLHJ_DataManager.Instance.debtsData[EMLHJ_DataManager.Instance.currentDebtNum].rate.toString();
    }
    

    // 更新钞票方法
    updateMoney() {
        const dataMgr = EMLHJ_DataManager.Instance;
        this.lblMoney.string = dataMgr.money.toString();
    }
    
            // 更新钞票方法
    updateCoin() {
        const dataMgr = EMLHJ_DataManager.Instance;
        this.lblCoin.string = dataMgr.coin.toString();
    }

    updateSave(){
        this.lblSave.string = EMLHJ_DataManager.Instance.currentSave.toString();
    }
    
    updateInterest() {
        const dataMgr = EMLHJ_DataManager.Instance;
        this.lblInterest.string = dataMgr.interest.toString();
    }
    

    onBtnBackClick(){
        if(this.tween){
            this.tween.stop();
            this.tween = null;
            this.btnBack.scale = new Vec3(1,1,1);
        }

        this.node.active = false;
    }

    // 注册事件监听
    registerEvents() {
        EventManager.on(EMLHJ_GameEvents.UPDATE_MONEY, this.updateMoney, this);
        EventManager.on(EMLHJ_GameEvents.UPDATE_COIN, this.updateCoin, this);
        EventManager.on(EMLHJ_GameEvents.UPDATE_ROUND, this.updateRound, this);
        EventManager.on(EMLHJ_GameEvents.START_NEW_DEBT, this.updateDebt, this);
        EventManager.on(EMLHJ_GameEvents.UPDATE_INTEREST, this.updateInterest, this);
        EventManager.on(EMLHJ_GameEvents.UPDATE_SAVE, this.updateSave, this);

        this.btnBack.on(Node.EventType.TOUCH_END, this.onBtnBackClick, this);
        this.btnSave.on(Node.EventType.TOUCH_END, this.saveMoney, this);
    }

    // 注销事件监听
    unregisterEvents() {
        EventManager.off(EMLHJ_GameEvents.UPDATE_MONEY, this.updateMoney, this);
        EventManager.off(EMLHJ_GameEvents.UPDATE_COIN, this.updateCoin, this);
        EventManager.off(EMLHJ_GameEvents.UPDATE_ROUND, this.updateRound, this);
        EventManager.off(EMLHJ_GameEvents.START_NEW_DEBT, this.updateDebt, this);
        EventManager.off(EMLHJ_GameEvents.UPDATE_INTEREST, this.updateInterest, this);
        EventManager.off(EMLHJ_GameEvents.UPDATE_SAVE, this.updateSave, this);

        // this.btnBack.off(Node.EventType.TOUCH_END, this.onBtnBackClick, this);
        // this.btnSave.off(Node.EventType.TOUCH_END, this.saveMoney, this);
    }

    // 注销事件监听
    onDestroy() {
        this.unregisterEvents();
        this.isAddedEvent = false;
    }

}


