import { _decorator, Component, instantiate, Label, Node, Prefab, Sprite, SpriteFrame, Tween, Vec3 } from 'cc';
import { HXTJB_DataManager } from '../Manager/HXTJB_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { HXTJB_GameEvents } from '../Common/HXTJB_GameEvents';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('HXTJB_GameUI')
export class HXTJB_GameUI extends Component {
 @property(Label)
    currentScoreLabel: Label = null; // 当前分数标签

     @property(Label)
    targetScoreLabel: Label = null; // 当前分数标签

    @property(Label)
    lblCoinRemain: Label = null; // 当前分数标签

    @property(Label)
    lblScoreMix: Label = null; // 分数混合标签

    @property(Label)
    lblRoundRemain: Label = null; // 分数混合标签

    @property(Label)
    lblMoney: Label = null; // 金币标签

    @property(Label)
    lblMoneyMix: Label = null; // 金币混合标签

    @property(Label)
    lblCoinMix: Label = null; // 金币混合标签

    @property(Label)
    lblAttack: Label = null; // 攻击标签

    @property(Label)
    lblAddMix: Label = null; // 增加混合标签

    @property(Node)
    btnGot: Node = null; // 购买增加混合按钮

    @property(Node)
    btnShop: Node = null; // 购买增加混合按钮

    @property(Node)
    btnBack: Node = null; // 购买增加混合按钮

    @property(Node)
    btnSplt: Node = null; // 购买增加混合按钮

    @property(Node)
    specialCoinsContain: Node = null; // 特殊金币层

    @property(Prefab)
    specialItem: Prefab = null; // 特殊金币

    @property(SpriteFrame)
    specialIcons:SpriteFrame[]=[]

    @property(Node)
    clickTipNode: Node = null; // 购买增加混合按钮

    // @property(Label)
    // highScoreLabel: Label = null; // 最高分标签
    
    // @property(Node)
    // scorePopup: Node = null; // 加分弹窗节点
    
    // @property(Label)
    // scorePopupLabel: Label = null; // 加分弹窗文本

    isAddedEvent: boolean = false;

    tween: Tween<Node> = null;
    tween2: Tween<Node> = null;


    
    onLoad() {
        // 注册分数变化事件
        if(!this.isAddedEvent){
            this.registerEvents();
            this.isAddedEvent = true;
        }
    }

    
    protected start(): void {
       
    }

    
    // 初始化UI
    initUI() {
        if(!this.isAddedEvent){
            this.registerEvents();
            this.isAddedEvent = true;
        }

         // 初始化显示
        this.updateScoreDisplay();
        this.updateTargetScoreDisplay();
        this.updateCoinRemainDisplay();
        this.updateScoreMixDisplay();
        this.updateRoundRemainDisplay();
        this.updateMoneyDisplay();
        this.updateMoneyMixDisplay();
        this.updateCoinMixDisplay();
        this.updateAttackDisplay();
        this.updateAddMixDisplay();
        this.updateSpecialConter();
        this.updateSpecialCoins();


                
        // // 隐藏加分弹窗
        // if (this.scorePopup) {
        //     this.scorePopup.active = false;
        // }
    }


    
    // 更新当前分数显示
    updateScoreDisplay() {
        if (this.currentScoreLabel) {
            this.currentScoreLabel.string = Math.floor(HXTJB_DataManager.Instance.currentScore).toString();
            
            if(HXTJB_DataManager.Instance.currentScore >= HXTJB_DataManager.Instance.roundData[HXTJB_DataManager.Instance.currentRound].tagetScore){
              
                    
                // // 监听按钮点击事件
                // this.btnATMPanel.on(Button.EventType.CLICK, () => {
                //     // 停止动画
                
                //     // 恢复原始缩放
                //     // this.btnATMPanel.scale = originalScale;
                //     // 移除点击监听
                //     this.btnATMPanel.off(Button.EventType.CLICK);
                // }, this);
                this.btnShop.active = true; 
                this.showBtnShopAnim();
            }
            else{
                this.btnShop.active = false;
            }
            // // 如果有加分值，显示加分动画
            // if (addedValue && addedValue > 0 && this.scorePopup && this.scorePopupLabel) {
            //     // this.showScorePopup(addedValue);
            // }
        }
    }

    showBtnShopAnim(){
         // 保存原始缩放值
        // 创建循环缩放动画
        if(this.tween){
           return;
        }
        const originalScale = this.btnShop.scale.clone();
        
        this.tween = new Tween(this.btnShop)
            .to(0.5, { scale: new Vec3(originalScale.x * 1.2, originalScale.y * 1.2, originalScale.z) })
            .to(0.5, { scale: originalScale })
            .union()
            .repeatForever()
            .start();
    }

    // 更新目标分数显示
    updateTargetScoreDisplay() {
        if (this.targetScoreLabel) {
            this.targetScoreLabel.string = HXTJB_DataManager.Instance.roundData[HXTJB_DataManager.Instance.currentRound].tagetScore.toString();
        }
    }

    // 更新当前金币显示
    updateCoinRemainDisplay() {
        if (this.lblCoinRemain) {
            this.lblCoinRemain.string = HXTJB_DataManager.Instance.currentCoins.toString();
        }
    }

    // 更新分数混合显示
    updateScoreMixDisplay() {
        // if (HXTJB_DataManager.Instance.scoreMix) {
            this.lblScoreMix.string =  HXTJB_DataManager.Instance.currentSourceMix.toString();
        // }
    }

    // 更新当前回合剩余显示
    updateRoundRemainDisplay() {
        if (this.lblRoundRemain) {
            this.lblRoundRemain.string = HXTJB_DataManager.Instance.currentRound.toString()+"/"+HXTJB_DataManager.Instance.totalRound.toString();
        }
    }

    // 更新当前金币显示
    updateMoneyDisplay() {
        if (this.lblMoney) {
            this.lblMoney.string = HXTJB_DataManager.Instance.currentMoney.toString();
        }
    }

    // 更新当前金币混合显示
    updateMoneyMixDisplay() {
        if (this.lblMoneyMix) {
            this.lblMoneyMix.string =  HXTJB_DataManager.Instance.roundData[HXTJB_DataManager.Instance.currentRound].MoneyMix.toString();
        }
    }

    // 更新当前金币混合显示
    updateCoinMixDisplay() {
        if (this.lblCoinMix) {
            this.lblCoinMix.string = HXTJB_DataManager.Instance.roundData[HXTJB_DataManager.Instance.currentRound].CoinMix.toString();
        }
    }

    // 更新当前攻击显示
    updateAttackDisplay() {
        if (this.lblAttack) {
            this.lblAttack.string = "连击："+HXTJB_DataManager.Instance.currentAttack.toString();
            this.lblAttack.node.active = HXTJB_DataManager.Instance.currentAttack>=2;
            this.scheduleOnce(()=>{
                this.lblAttack.node.active = false;
            },3)
        }
    }

    // 更新增加混合显示
    updateAddMixDisplay() {
        if (this.lblAddMix) {
            if(HXTJB_DataManager.Instance.currentAddMix <= 0){
                this.lblAddMix.node.active = false;
                return;
            }
            this.lblAddMix.node.active = true;
            this.lblAddMix.string = "分数倍率+"+HXTJB_DataManager.Instance.currentAddMix.toString();
            this.scheduleOnce(()=>{
                this.lblAddMix.node.active = false;
            },1.5)
        }
    }


    updateSpecialCoins(){
        if(this.specialCoinsContain){
            // 获取所有特殊币种数据
            const specialCoins = HXTJB_DataManager.Instance.specialCoins;
            
            // 获取所有币位节点
            const coinSlots: Node[] = [];
            this.specialCoinsContain.children.forEach(child => {
                const coin1 = child.getChildByName('coin_1');
                const coin2 = child.getChildByName('coin_2');
                if(coin1 && coin2) {
                    coinSlots.push(coin1, coin2);
                }
            });
            
            // 重置所有币位显示
            coinSlots.forEach(slot => {
                const sprite = slot.getComponent(Sprite);
                if(sprite) sprite.spriteFrame = null;
            });
            
            // 按币种类型和数量设置对应币位
            let slotIndex = 0;
            let isHaveSpecialCoin = false;
            for(const [coinType, count] of Object.entries(specialCoins)) {
                const typeNum = parseInt(coinType);
                const spriteFrame = this.specialIcons[typeNum - 1];
                if(count > 0) {
                    isHaveSpecialCoin = true;
                }
                
                for(let i = 0; i < count && slotIndex < coinSlots.length; i++, slotIndex++) {
                    const sprite = coinSlots[slotIndex].getComponent(Sprite);
                    if(sprite && spriteFrame) {
                        sprite.spriteFrame = spriteFrame;
                    }
                }
            }

            this.btnSplt.active = isHaveSpecialCoin;
        }
    }

    updateSpecialConter(){
        if(this.specialCoinsContain){
            let count = HXTJB_DataManager.Instance.currentItemCotanerCount;
            this.specialCoinsContain.children.forEach((item)=>{
                item.setParent(null);
                item.destroy();
            })
            for(let i = 0; i < count; i++){
                let item = instantiate(this.specialItem);
                item.parent = this.specialCoinsContain;
            }
            // for(let i = 0; i < specialCoins.length; i++){
            //     let specialCoin = specialCoins[i];
            //     let item = this.specialCoinsContain.children[i];
            //     if(item){
            //         item.setPosition(new Vec3(specialCoin.x, specialCoin.y, 0));
            //     }
            // }
        }
    }

    onBtnSpltClick(){
        HXTJB_DataManager.Instance.useSpecialCoin(1);
    }

    onBtnGotClick(){
        HXTJB_DataManager.Instance.buyCoins();
    }

    showClickTip(){
//    // 保存原始缩放值
//         const originalScale = this.clickTipNode.scale.clone();
        
//         // 创建循环缩放动画
//         this.tween2 = new Tween(this.clickTipNode)
//             .to(0.5, { scale: new Vec3(originalScale.x * 1.2, originalScale.y * 1.2, originalScale.z) })
//             .to(0.5, { scale: originalScale })
//             .union()
//             .repeatForever()
//             .start();
//         this.clickTipNode.active = true;
    }

    hideClickTip(){
        // if(this.tween2){
        //     this.tween2.stop();
        //     this.tween2 = null;
        //     this.clickTipNode.scale = new Vec3(1,1,1);
        // }
        // this.clickTipNode.active = false;
    }

    showBtnShop(){
        this.btnShop.active = true;
    }
    hideBtnShop(){
        this.btnShop.active = false;
    }

    onBtnShopClick(){
        if(this.tween){
            this.tween.stop();
            this.tween = null;
            this.btnShop.scale = new Vec3(1,1,1);
        }
        HXTJB_DataManager.Instance.isGameStart = false;
        EventManager.Scene.emit(HXTJB_GameEvents.UI_SHOW_SHOP_PANEL);
    }

    onBtnBackClick(){
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "浣熊推金币");
            });
        });
    }
    
    // 注册事件监听
    registerEvents() {
        EventManager.on(HXTJB_GameEvents.UPDATE_SCORE, this.updateScoreDisplay, this);
        EventManager.on(HXTJB_GameEvents.UPDATE_TARGET_SCORE, this.updateTargetScoreDisplay, this);
        EventManager.on(HXTJB_GameEvents.UPDATE_COIN, this.updateCoinRemainDisplay, this);
        EventManager.on(HXTJB_GameEvents.UPDATE_SCORE_MIX, this.updateScoreMixDisplay, this);
        EventManager.on(HXTJB_GameEvents.UPDATE_ROUND_REMAIN, this.updateRoundRemainDisplay, this);
        EventManager.on(HXTJB_GameEvents.UPDATE_MONEY, this.updateMoneyDisplay, this);
        EventManager.on(HXTJB_GameEvents.UPDATE_MONEY_MIX, this.updateMoneyMixDisplay, this);
        EventManager.on(HXTJB_GameEvents.UPDATE_COIN_MIX, this.updateCoinMixDisplay, this);
        EventManager.on(HXTJB_GameEvents.UPDATE_ATTACK, this.updateAttackDisplay, this);
        EventManager.on(HXTJB_GameEvents.UPDATE_ADD_MIX, this.updateAddMixDisplay, this);
        EventManager.on(HXTJB_GameEvents.UPDATE_CURRENT_ITEM_CONTAINER_COUNT, this.updateSpecialConter, this);
        EventManager.on(HXTJB_GameEvents.UPDATE_SPECIAL_COINS, this.updateSpecialCoins, this);
        EventManager.on(HXTJB_GameEvents.UI_SHOW_CLICK_TIP, this.showClickTip, this);
        EventManager.on(HXTJB_GameEvents.UI_HIDE_CLICK_TIP, this.hideClickTip, this);
        EventManager.on(HXTJB_GameEvents.SHOW_BTN_SHOP, this.showBtnShop, this);
        EventManager.on(HXTJB_GameEvents.HIDE_BTN_SHOP, this.hideBtnShop, this);

        // ScoreManager.instance.scoreChanged.on('scoreChanged', this.updateScoreDisplay, this);

        this.btnBack.on(Node.EventType.TOUCH_END, this.onBtnBackClick, this);
        this.btnGot.on(Node.EventType.TOUCH_END, this.onBtnGotClick, this);
        this.btnShop.on(Node.EventType.TOUCH_END, this.onBtnShopClick, this);
        this.btnSplt.on(Node.EventType.TOUCH_END, this.onBtnSpltClick, this);
        
    }

    // 注销事件监听
    unregisterEvents() {
        EventManager.off(HXTJB_GameEvents.UPDATE_SCORE, this.updateScoreDisplay, this);
        EventManager.off(HXTJB_GameEvents.UPDATE_TARGET_SCORE, this.updateTargetScoreDisplay, this);
        EventManager.off(HXTJB_GameEvents.UPDATE_COIN, this.updateCoinRemainDisplay, this);
        EventManager.off(HXTJB_GameEvents.UPDATE_SCORE_MIX, this.updateScoreMixDisplay, this);
        EventManager.off(HXTJB_GameEvents.UPDATE_ROUND_REMAIN, this.updateRoundRemainDisplay, this);
        EventManager.off(HXTJB_GameEvents.UPDATE_MONEY, this.updateMoneyDisplay, this);
        EventManager.off(HXTJB_GameEvents.UPDATE_MONEY_MIX, this.updateMoneyMixDisplay, this);
        EventManager.off(HXTJB_GameEvents.UPDATE_COIN_MIX, this.updateCoinMixDisplay, this);
        EventManager.off(HXTJB_GameEvents.UPDATE_ATTACK, this.updateAttackDisplay, this);
        EventManager.off(HXTJB_GameEvents.UPDATE_ADD_MIX, this.updateAddMixDisplay, this);
        EventManager.off(HXTJB_GameEvents.UPDATE_CURRENT_ITEM_CONTAINER_COUNT, this.updateSpecialConter, this);
        EventManager.off(HXTJB_GameEvents.UPDATE_SPECIAL_COINS, this.updateSpecialCoins, this);
        EventManager.off(HXTJB_GameEvents.UI_SHOW_CLICK_TIP, this.showClickTip, this);
        EventManager.off(HXTJB_GameEvents.UI_HIDE_CLICK_TIP, this.hideClickTip, this);
        EventManager.off(HXTJB_GameEvents.SHOW_BTN_SHOP, this.showBtnShop, this);
        EventManager.off(HXTJB_GameEvents.HIDE_BTN_SHOP, this.hideBtnShop, this);

        // this.btnBack.off(Node.EventType.TOUCH_END, this.onBtnBackClick, this);
        // this.btnBackToMain.off(Node.EventType.TOUCH_END, this.onBtnBackToMainClick, this);
        // this.btnRestart.off(Node.EventType.TOUCH_END, this.onBtnRestartClick, this);
    }

      // 注销事件监听
    onDestroy() {
        this.unregisterEvents();
        this.isAddedEvent = false;
    }
}


