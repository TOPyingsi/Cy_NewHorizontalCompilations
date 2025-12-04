import { _decorator, Button, Color, Component, Label, Node, Tween, Vec3 } from 'cc';
import { EMLHJ_GameManager } from '../Manager/EMLHJ_GameManager';
import { EMLHJ_DataManager } from '../Manager/EMLHJ_DataManager';
import { EMLHJ_GameEvents } from '../Common/EMLHJ_GameEvents';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('EMLHJ_GameUI')
export class EMLHJ_GameUI extends Component {
  // 金币相关节点
    @property(Label)
    lblCoin: Label = null;               // 金币显示
    
    @property(Node)
    coinsAdd: Node = null;               // 金币增加显示节点
    @property(Label)
    lblCoinAdd: Label = null;            // 金币增加数值显示
    
    // 钞票相关节点
    @property(Label)
    lblMoney: Label = null;              // 钞票显示
    
    @property(Node)
    moneyAdd: Node = null;               // 钞票增加显示节点
    @property(Label)
    lblMoneyAdd: Label = null;           // 钞票增加数值显示
    
    // 剩余次数
    @property(Label)
    lblRemaining: Label = null;          // 剩余次数显示
    
    // 总计奖励
    @property(Node)
    totalRewardMask: Node = null;        // 总计奖励遮罩
    @property(Label)
    lblTotal: Label = null;              // 总计奖励值
    @property(Label)
    lblTotalText: Label = null;          // "总计"文本
    
    // 拉杆相关
    @property(Node)
    lever: Node = null;                  // 拉杆节点
    @property(Node)
    pole: Node = null;                   // 杆子节点
    @property(Button)
    leverButton: Button = null;          // 拉杆按钮


    @property(Node)
    btnIconPanel: Node = null;          // 图标按钮

    @property(Node)
    btnRewardPanel: Node = null;          // 奖励按钮

    @property(Node)
    btnATMPanel: Node = null;          // ATM按钮

    tween: Tween<Node> = null;

    @property(Node)
    btnShopPanel: Node = null;          // 商店按钮

    @property(Node)
    selectCount: Node = null;

    @property(Node)
    btnSelect_1: Node = null;
    @property(Node)
    btnSelect_2: Node = null;

    @property(Node)
    noCountMask: Node = null;          // 无次数遮罩

    @property(Label)
    lblRound: Label = null;          // "总计"文本

    @property(Node)
    btnBack: Node = null;          // 奖励按钮

    isAddedEvent: boolean = false;

    tween3: Tween<Node> = null;
    tween4: Tween<Node> = null;
    tween5: Tween<Node> = null;

    
    
    // onLoad() {
    //     // 初始化UI
    //     // 注册事件监听
     
    // }

    protected onLoad(): void {
        // if(!this.isAddedEvent){
            this.registerEvents();
            // this.isAddedEvent = true;
        // }
    }

    showNextRound(){
        this.showSelectCount();
        this.hideNoCountMask();
        this.showSelectAnim();
    }

    showSelectCount(){
        if(this.selectCount){
            this.selectCount.active = true;
            this.leverButton.interactable = false;
        }
    }

    hideSelectCount(){
        if(this.selectCount){
            this.selectCount.active = false;
             this.leverButton.interactable = true;
        }
    }

    showNoCountMask(){
        if(this.noCountMask){
            this.noCountMask.active = true;
        }
    }

    hideNoCountMask(){
        if(this.noCountMask){
            this.noCountMask.active = false;
        }
    }
    
    // 初始化UI
    initUI() {
        if(!this.isAddedEvent){
            this.addButtonListener();
            this.isAddedEvent = true;
        }
        
        // const dataMgr = EMLHJ_DataManager.Instance;
        // dataMgr.initData();
        
        // 初始化显示
        this.updateCoin();
        this.updateMoney();
        this.updateRemaining();
        this.updateRound();
        // EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_ROUND);
        // EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_COIN);
        // EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_MONEY);
        // EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_REMAINING);
        
        
        // 初始隐藏相关节点
        this.coinsAdd.active = false;
        this.moneyAdd.active = false;
        this.totalRewardMask.active = false;
        
        // 确保拉杆在初始位置
        // this.lever.setPosition(Vec3.ZERO);
        this.pole.setScale(1, 1, 1);
    }
    
   

    onSelectClick_1(){
        if(this.tween4){
            this.tween4.stop();
            this.tween4 = null;
            this.btnSelect_1.scale = new Vec3(1,1,1);
        }
        if(this.tween4){
            this.tween4.stop();
            this.tween4 = null;
            this.btnSelect_2.scale = new Vec3(1,1,1);
        }

        EMLHJ_DataManager.Instance.setRemaining(7);
        EMLHJ_DataManager.Instance.coinAdd = -7;
        EMLHJ_DataManager.Instance.endMoneyAdd = 1  
        EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_COIN_ADD);
        // EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_MONEY_ADD);
        EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_REMAINING);
        EMLHJ_DataManager.Instance.isGotMoney = false;
        this.hideSelectCount();
        this.showLeverAnim();
    }

    onSelectClick_2(){
        if(this.tween4){
            this.tween4.stop();
            this.tween4 = null;
            this.btnSelect_1.scale = new Vec3(1,1,1);
        }
        if(this.tween4){
            this.tween4.stop();
            this.tween4 = null;
            this.btnSelect_2.scale = new Vec3(1,1,1);
        }
        EMLHJ_DataManager.Instance.setRemaining(3);
        EMLHJ_DataManager.Instance.coinAdd = -3;
        EMLHJ_DataManager.Instance.endMoneyAdd = 2  

        EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_COIN_ADD);
        // EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_MONEY_ADD);
        EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_REMAINING);
        EMLHJ_DataManager.Instance.isGotMoney = false;
        this.hideSelectCount();
        this.showLeverAnim();
    }

    updateRound(){
        if(! this.lblRound)return;
        const dataMgr = EMLHJ_DataManager.Instance;
        let totalRound =  EMLHJ_DataManager.Instance.debtsData[EMLHJ_DataManager.Instance.currentDebtNum].round
        let remainRound = dataMgr.remainRound
        this.lblRound.string = `轮次：${totalRound - remainRound}/${totalRound}`;
    }
    
    // 更新金币方法
    updateCoinAdd() {
        const dataMgr = EMLHJ_DataManager.Instance;
        
        // 设置金币增加显示
        this.lblCoinAdd.string = dataMgr.coinAdd >0 ? `+${dataMgr.coinAdd}` : `${dataMgr.coinAdd}`;
        this.coinsAdd.active = true;
        // let total = dataMgr.currentRewards.total;
        
        // 2秒后更新金币并隐藏
        setTimeout(() => {
            dataMgr.coin += dataMgr.coinAdd;
            dataMgr.coinAdd = 0;
            // dataMgr.currentRewards.total = 0;
            EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_COIN);
            // this.lblCoin.string = dataMgr.coin.toString();
            this.coinsAdd.active = false;
        }, 1000);
    }
    
    updateCoin() {
        const dataMgr = EMLHJ_DataManager.Instance;
        this.lblCoin.string = dataMgr.coin.toString();
        this.coinsAdd.active = false;
    }
    
    
    // 更新钞票方法
    updateMoneyAdd() {
        const dataMgr = EMLHJ_DataManager.Instance;
        
        // 设置钞票增加显示
        this.lblMoneyAdd.string = `+${dataMgr.moneyAdd}`;
        this.moneyAdd.active = true;
        
        // 2秒后更新钞票并隐藏
        setTimeout(() => {
            dataMgr.money += dataMgr.moneyAdd;
            dataMgr.moneyAdd = 0;
            EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_MONEY);
            // this.lblMoney.string = dataMgr.money.toString();
            this.moneyAdd.active = false;
        }, 1000);
    }

        // 更新钞票方法
        updateMoney() {
            const dataMgr = EMLHJ_DataManager.Instance;
            this.lblMoney.string = dataMgr.money.toString();
        }
    
    // 更新剩余次数方法
    updateRemaining() {
        const dataMgr = EMLHJ_DataManager.Instance;
        this.lblRemaining.string = `剩余次数：${dataMgr.remaining}`;
    }
    
    // 中奖方法
    onWinReward() {
        const dataMgr = EMLHJ_DataManager.Instance;
        
        
        if (dataMgr.currentRewards?.total !== 0) {
            // 显示奖励遮罩
            this.totalRewardMask.active = true;
            this.lblTotal.string = dataMgr.currentRewards.total.toString();
            
            // 开始描边闪烁动画
            this.startBlinkAnimation();
            
            // 2秒后关闭并更新金币
            setTimeout(() => {
                this.totalRewardMask.active = false;
                // 停止动画
                this.stopBlinkAnimation();
                dataMgr.coinAdd = dataMgr.currentRewards.total;
                // 发射更新金币事件
                EventManager.Scene.emit(EMLHJ_GameEvents.UPDATE_COIN_ADD);
                // 重置奖励
                dataMgr.resetCurrentRewards();

                if(dataMgr.remaining == 0){
                    dataMgr.calculateInterest();
                // 显示结束面板
                  this.showbtnATMAnim();
                  this.showNoCountMask();
                  
                }
                else{
                    // 恢复按钮交互
                    this.leverButton.interactable = true;
                }
      
            }, 1400);
        }
        else{
            if(dataMgr.remaining == 0){
                this.scheduleOnce(()=>{
                    dataMgr.calculateInterest();
                // 显示结束面板
                    this.showbtnATMAnim();
                    this.showNoCountMask();
                },1)
            }
            else{
                // 恢复按钮交互
                this.leverButton.interactable = true;
            }
        }
    }


  showbtnATMAnim() {
        // 保存原始缩放值
        const originalScale = this.btnATMPanel.scale.clone();
        
        // 创建循环缩放动画
        this.tween = new Tween(this.btnATMPanel)
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
    // 开始描边闪烁动画
    startBlinkAnimation() {
        // 初始颜色设为紫色
        let isPurple = true;
        this.setLabelOutlineColor(new Color("2A54FC"));
        
        // 1秒切换一次颜色
        this.schedule(() => {
            isPurple = !isPurple;
            this.setLabelOutlineColor(isPurple ? new Color("2A54FC") : Color.RED);
        }, 0.7);
    }
    
    // 停止描边闪烁动画
    stopBlinkAnimation() {
        this.unscheduleAllCallbacks();
        // 重置颜色为默认
        this.setLabelOutlineColor(Color.WHITE);
    }
    
    // 设置标签描边颜色
    setLabelOutlineColor(color: Color) {
        if (this.lblTotalText) this.lblTotalText.outlineColor = color;
        if (this.lblTotal) this.lblTotal.outlineColor = color;
    }
    
    // 拉杆方法
    onLeverPull() {
        if(this.tween5){
            this.tween5.stop();
            this.tween5 = null;
            this.leverButton.node.scale = new Vec3(1,1,1);
        }
        // 禁止按钮事件
        this.leverButton.interactable = false;
        
        // 保存初始位置
        const originalPos = this.lever.position.clone();
        
        // 发送开始旋转事件
        EventManager.Scene.emit(EMLHJ_GameEvents.START_SPIN);

        // 创建拉杆动画
        const tween = new Tween(this.lever)
            // 向下移动400
            .to(0.1, { position: new Vec3(originalPos.x, originalPos.y - 400, originalPos.z) })
            // 向上移动400回到原位
            .to(0.15, { position: originalPos })
            .call(() => {
            })
            .start();
        
        // 创建杆子缩放动画
        const poleTween = new Tween(this.pole)
            // 缩放从1到-1
            .to(0.1, { scale: new Vec3(1, -1, 1) })
            // 缩放从-1回到1
            .to(0.15, { scale: new Vec3(1, 1, 1) })
            .start();
    }


    showSelectAnim(){
        // 保存原始缩放值
         this.btnSelect_1.setScale(new Vec3(1,1,1));
        const originalScale1 = this.btnSelect_1.scale.clone();
        
        // 创建循环缩放动画
        this.tween3 = new Tween(this.btnSelect_1)
            .to(0.5, { scale: new Vec3(originalScale1.x * 1.05, originalScale1.y * 1.05, originalScale1.z) })
            .to(0.5, { scale: originalScale1 })
            .union()
            .repeatForever()
            .start();

              this.btnSelect_2.setScale(new Vec3(1,1,1));
        const originalScale = this.btnSelect_2.scale.clone();

                // 创建循环缩放动画
        this.tween4 = new Tween(this.btnSelect_2)
            .to(0.5, { scale: new Vec3(originalScale.x * 1.05, originalScale.y * 1.05, originalScale.z) })
            .to(0.5, { scale: originalScale })
            .union()
            .repeatForever()
            .start();
    }

    showLeverAnim(){
        // 保存原始缩放值
        const originalScale = this.lever.scale.clone();
        
        // 创建循环缩放动画
        this.tween5 = new Tween(this.leverButton.node)
            .to(0.5, { scale: new Vec3(originalScale.x * 1.2, originalScale.y * 1.2, originalScale.z) })
            .to(0.5, { scale: originalScale })
            .union()
            .repeatForever()
            .start();
    }

    onIconPanelClick(){
        EventManager.Scene.emit(EMLHJ_GameEvents.UI_SHOW_ICON_PANEL);
    }

    onRewardPanelClick(){
        EventManager.Scene.emit(EMLHJ_GameEvents.UI_SHOW_REWARD_PANEL);
    }

    onATMPanelClick(){
        if(this.tween){
            this.tween.stop();
            this.tween = null;
            this.btnATMPanel.scale = new Vec3(1,1,1);
        }
        EventManager.Scene.emit(EMLHJ_GameEvents.UI_SHOW_ATM_PANEL);
    }

    onShopPanelClick(){
        EventManager.Scene.emit(EMLHJ_GameEvents.UI_SHOW_SHOP_PANEL);
    }

    onBtnBackClick(){
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "恶魔老虎机");
            });
        });
    }
    
     // 注册事件监听
    registerEvents() {
        // 监听金币更新事件
        EventManager.on(EMLHJ_GameEvents.UPDATE_ROUND, this.updateRound, this);
        EventManager.on(EMLHJ_GameEvents.UPDATE_COIN, this.updateCoin, this);
        EventManager.on(EMLHJ_GameEvents.UPDATE_COIN_ADD, this.updateCoinAdd, this);
        // 监听钞票更新事件
        EventManager.on(EMLHJ_GameEvents.UPDATE_MONEY, this.updateMoney, this);
        EventManager.on(EMLHJ_GameEvents.UPDATE_MONEY_ADD, this.updateMoneyAdd, this);
        
        // 监听开始旋转事件
        EventManager.on(EMLHJ_GameEvents.UPDATE_REMAINING, this.updateRemaining, this);
        
        // 监听旋转结束事件
        EventManager.on(EMLHJ_GameEvents.SPIN_FINISHED, this.onWinReward, this);
        EventManager.on(EMLHJ_GameEvents.SHOW_NEW_DEBT, this.showNextRound, this);

        
        EventManager.on(EMLHJ_GameEvents.UI_SHOW_SELECT_COUNT, this.showSelectCount, this);
        EventManager.on(EMLHJ_GameEvents.UI_HIDE_SELECT_COUNT, this.hideSelectCount, this);

        EventManager.on(EMLHJ_GameEvents.SHOW_SELECT_ANIM, this.showSelectAnim, this);
        
    }
    
    addButtonListener(){
        // 设置拉杆按钮回调
        this.leverButton.node.on(Button.EventType.CLICK, this.onLeverPull, this);
        // 监听返回按钮点击事件
        this.btnBack.on(Button.EventType.CLICK, this.onBtnBackClick, this);

        // 监听选择按钮点击事件
        this.btnSelect_1.on(Button.EventType.CLICK, this.onSelectClick_1, this);
        this.btnSelect_2.on(Button.EventType.CLICK, this.onSelectClick_2, this);


        // 监听图标按钮点击事件
        this.btnIconPanel.on(Button.EventType.CLICK, this.onIconPanelClick, this);
        // 监听奖励按钮点击事件
        this.btnRewardPanel.on(Button.EventType.CLICK, this.onRewardPanelClick, this);
        // 监听ATM按钮点击事件
        this.btnATMPanel.on(Button.EventType.CLICK, this.onATMPanelClick, this);
        // 监听商店按钮点击事件
        this.btnShopPanel.on(Button.EventType.CLICK, this.onShopPanelClick, this);
    }

    onDestroy() {
        // 移除所有事件监听
        EventManager.off(EMLHJ_GameEvents.UPDATE_ROUND, this.updateRound, this);
        EventManager.off(EMLHJ_GameEvents.UPDATE_COIN_ADD, this.updateCoinAdd, this);
        EventManager.off(EMLHJ_GameEvents.UPDATE_COIN, this.updateCoin, this);
        EventManager.off(EMLHJ_GameEvents.UPDATE_MONEY, this.updateMoney, this);
        EventManager.off(EMLHJ_GameEvents.UPDATE_MONEY_ADD, this.updateMoneyAdd, this);
        EventManager.off(EMLHJ_GameEvents.UPDATE_REMAINING, this.updateRemaining, this);
        EventManager.off(EMLHJ_GameEvents.SPIN_FINISHED, this.onWinReward, this);
        EventManager.off(EMLHJ_GameEvents.SHOW_NEW_DEBT, this.showNextRound, this);

        EventManager.off(EMLHJ_GameEvents.UI_SHOW_SELECT_COUNT, this.showSelectCount, this);
        EventManager.off(EMLHJ_GameEvents.UI_HIDE_SELECT_COUNT, this.hideSelectCount, this);

        EventManager.off(EMLHJ_GameEvents.SHOW_SELECT_ANIM, this.showSelectAnim, this);

        // // 移除按钮点击事件监听
        // this.btnIconPanel.off(Button.EventType.CLICK, this.onIconPanelClick, this);
        // this.btnRewardPanel.off(Button.EventType.CLICK, this.onRewardPanelClick, this);
        // this.btnATMPanel.off(Button.EventType.CLICK, this.onATMPanelClick, this);
        // this.btnShopPanel.off(Button.EventType.CLICK, this.onShopPanelClick, this);

        // this.leverButton.node.off(Button.EventType.CLICK, this.onLeverPull, this);
         this.isAddedEvent = false;
    }
}


