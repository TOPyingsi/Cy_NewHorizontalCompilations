import { _decorator, Component, Node, Label, Button, EventHandler, Prefab, instantiate } from 'cc';
import { XGDY_DataManager, XGDY_ItemType, XGDY_NpcJsonData } from '../Manager/XGDY_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
import { XGDY_Constant } from '../Common/XGDY_Constant';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('XGDY_DialougePanel')
export class XGDY_DialougePanel extends Component {

    @property(Label)
    private nameLabel: Label = null;  // 显示对话内容的Label组件

    @property(Label)
    private contentLabel: Label = null;  // 显示对话内容的Label组件

    @property(Button)
    private skipButton: Button = null;   // 跳过按钮组件

    @property(Button)
    private closeButton: Button = null;  // 关闭按钮组件

    @property(Node)
    private optionsContainer: Node = null;  // 选项按钮容器

    private optionButtonPrefab: Node = null;  // 选项按钮预制体

    // @property(EventHandler)
    // private onTypingComplete: EventHandler[] = [];  // 打字完成回调事件

    @property
    private typingSpeed: number = 0.05;  // 打字速度（秒/字）

    currentNpcId: string = null;  // 当前NPC ID
    private currentDialogId: string = "0";  // 当前对话ID，默认从0开始
    private currentContent: string = null;  // 当前对话内容
    private currentOptions: XGDY_NpcJsonData['对话对象'][string]['选项数组'] = [];  // 当前对话选项
    private npcData: XGDY_NpcJsonData = null;  // 当前NPC数据
    private typingTimer: number = 0;  // 打字计时器
    private currentCharIndex: number = 0;  // 当前显示的字符索引
    private isTyping: boolean = false;  // 是否正在打字中
    private isAddListener: boolean = false;  // 是否已添加监听事件

    onLoad() {

    }

    /**
     * 初始化对话面板
     */
    init() {

        if(!this.isAddListener){
            this.optionButtonPrefab = this.optionsContainer.children[0];
            this.optionButtonPrefab.active = false;
            this.optionButtonPrefab.setParent(this.node);
            this.addListener();
        }
        // 获取当前NPC ID
        this.currentNpcId = XGDY_DataManager.Instance.dynamicData.currentNpcId;
        // 获取NPC数据
        this.npcData = XGDY_DataManager.Instance.getItemDataById(this.currentNpcId) as XGDY_NpcJsonData;
        
        // 设置默认对话ID为0
        this.currentDialogId =""+ XGDY_DataManager.Instance.dynamicData.currentDialogId;
        XGDY_DataManager.Instance.dynamicData.currentDialogId = "0";
        
        // 开始对话
        this.startDialog(this.currentDialogId);
                  ProjectEventManager.emit(ProjectEvent.弹出窗口, "修勾钓鱼");
    }
    
    /**
     * 开始指定ID的对话
     * @param dialogId 对话ID
     */
    private startDialog(dialogId: string) {
        if (!this.npcData || !this.npcData.对话对象 || !this.npcData.对话对象[dialogId]) {
            console.error(`对话ID ${dialogId} 不存在`);
            return;
        }
        
        // 更新当前对话ID
        this.currentDialogId = dialogId;

        this.nameLabel.string = this.npcData.名称
        
        // 获取对话内容和选项
        const dialog = this.npcData.对话对象[dialogId];
        this.currentContent = dialog.内容;
        this.currentOptions = dialog.选项数组;
        
        // 清空之前的选项按钮
        this.clearOptions();
        
        // 隐藏关闭按钮
        if (this.closeButton) {
            this.closeButton.node.active = false;
        }
        
        // 开始打字效果
        this.startTyping();
    }

    /**
     * 开始打字效果
     */
    private startTyping() {
        if (!this.contentLabel || !this.currentContent) return;

        // 重置状态
        this.contentLabel.string = "";
        this.currentCharIndex = 0;
        this.isTyping = true;
        this.typingTimer = 0;

        // 显示跳过按钮
        if (this.skipButton) {
            this.skipButton.node.active = true;
        }
    }

    update(deltaTime: number) {
        if (!this.isTyping) return;

        // 累积打字时间
        this.typingTimer += deltaTime;

        // 当累积时间超过打字速度时，显示下一个字符
        if (this.typingTimer >= this.typingSpeed) {
            this.typingTimer = 0;
            this.currentCharIndex++;

            // 更新显示文本
            if (this.contentLabel) {
                this.contentLabel.string = this.currentContent.substring(0, this.currentCharIndex);
            }

            // 检查是否打字完成
            if (this.currentCharIndex >= this.currentContent.length) {
                this.finishTyping();
            }
        }
    }

    /**
     * 跳过按钮点击事件
     */
    private onSkipButtonClick() {
        this.skipTyping();
    }

    /**
     * 跳过打字效果，直接显示完整内容
     */
    skipTyping() {
        if (!this.isTyping || !this.contentLabel) return;

        // 直接显示完整内容
        this.contentLabel.string = this.currentContent;
        this.finishTyping();
    }

    /**
     * 完成打字效果
     */
    private finishTyping() {
        this.isTyping = false;
        this.currentCharIndex = this.currentContent.length;

        // 隐藏跳过按钮
        if (this.skipButton) {
            this.skipButton.node.active = false;
        }

        // 检查当前对话是否有选项
        if (this.currentOptions && this.currentOptions.length > 0) {
            // 有选项，创建选项按钮
            this.createOptions();
        } else {
            // 没有选项，显示关闭按钮
            if (this.closeButton) {
                this.closeButton.node.active = true;
            }
        }

        // // 触发打字完成回调
        // if (this.onTypingComplete && this.onTypingComplete.length > 0) {
        //     EventHandler.emitEvents(this.onTypingComplete, this.currentNpcId);
        // }
    }
    
    /**
     * 创建选项按钮
     */
    private createOptions() {
        if (!this.optionsContainer || !this.optionButtonPrefab || !this.currentOptions) return;
        
        // 显示选项容器
        this.optionsContainer.active = true;
        
        // 为每个选项创建按钮
        this.currentOptions.forEach((option, index) => {
            // 实例化选项按钮
            const optionButtonNode = instantiate(this.optionButtonPrefab);
            if (!optionButtonNode) return;
            
            // 设置按钮文本
            const optionLabel = optionButtonNode.getComponentInChildren(Label);
            if (optionLabel) {
                optionLabel.string = option.按钮内容;
            }
            
            // 获取按钮组件
            const optionButton = optionButtonNode.getComponent(Button);
            if (optionButton) {
                // 根据选项的回调类型注册对应的回调函数
                optionButton.node.on(Button.EventType.CLICK, () => this.onOptionButtonClick(option), this);
            }
            
            // 将按钮添加到容器中
            this.optionsContainer.addChild(optionButtonNode);
            optionButtonNode.active = true;
        });
    }
    
    /**
     * 选项按钮点击事件
     * @param option 选项数据
     */
    private onOptionButtonClick(option: XGDY_NpcJsonData['对话对象'][string]['选项数组'][0]) {
        // 清空选项
        this.clearOptions();
        
        // 根据选项的回调类型执行不同的操作
        switch (option.选项回调类型) {
            case '下一对话':
                // 跳转到下一对话
                this.startDialog(option.下一对话id);
                break;
            
            case '关闭对话':
                // 关闭对话面板
                this.closeDialog();
                break;
            
            case '条件判断':
                // 执行条件判断
                this.executeConditionCheck(option);
                break;
            
            default:
                console.error(`未知的选项回调类型: ${option.选项回调类型}`);
                break;
        }
    }
    
    /**
     * 执行条件判断
     * @param option 选项数据
     */
    private executeConditionCheck(option: XGDY_NpcJsonData['对话对象'][string]['选项数组'][0]) {
        if (!option.条件判断) {
            console.error('选项缺少条件判断配置');
            return;
        }
        
        const conditionCheck = option.条件判断;
        let isConditionMet = true;
        
        // 检查所有条件
        for (const [key, value] of Object.entries(conditionCheck.条件)) {
            if(!XGDY_DataManager.Instance.judgeItemCondition(key,value)){
                isConditionMet = false;
                break;
            }
        }
        
        if (isConditionMet) {
            // 条件达成，触发剧情事件
            this.eventHandel(option.条件判断.条件达成发射剧情事件,this.currentNpcId)
            // 这里需要实现触发剧情事件的逻辑
            this.closeDialog();
        } else {
            // 条件未达成，显示失败对话
            const failDialogId = conditionCheck.条件未达成显示失败对话并点击关闭;
            if (failDialogId && this.npcData.对话对象[failDialogId]) {
                // 显示失败对话
                this.startDialog(failDialogId);
            } else {
                // 没有失败对话，直接关闭
                this.closeDialog();
            }
        }
    }
    
    /**
     * 清空选项按钮
     */
    private clearOptions() {
        if (!this.optionsContainer) return;
        
        // 隐藏选项容器
        this.optionsContainer.active = false;
        
        // 移除所有子节点
        this.optionsContainer.removeAllChildren();
    }
    
    /**
     * 关闭按钮点击事件
     */
    private onCloseButtonClick() {
        this.closeDialog();
    }
    
    /**
     * 关闭对话面板
     */
    private closeDialog() {
        // 清空选项
        this.clearOptions();
        
        // 隐藏关闭按钮
        if (this.closeButton) {
            this.closeButton.node.active = false;
        }

        this.node.active = false;
        
        // 可以在这里添加关闭对话面板的逻辑
        // 例如：隐藏面板、触发关闭回调等
        console.log('对话已关闭');
    }


    eventHandel(eventId,npcId){
        switch (eventId) {
            case "事件_0_1"://常空
                 XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.Coin] += 50000;
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Money);
                XGDY_DataManager.Instance.saveData.itemData["鱼_1_2"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_1_2"] -= 1;
                XGDY_DataManager.Instance.dynamicData.currentFishesValue = XGDY_DataManager.Instance.calculateTotalFishValue();
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Value);
                XGDY_DataManager.Instance.dynamicData.currentSellFishs =["鱼_1_2"];
                EventManager.Scene.emit(XGDY_GameEvents.Destory_Fish_Stole);
                XGDY_DataManager.Instance.executeEvent(eventId); 
                EventManager.Scene.emit(XGDY_GameEvents.Hide_Npc,npcId);
                break;
            case "事件_0_0":
                XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.Coin] += 100000;
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Money);
                XGDY_DataManager.Instance.saveData.itemData["鱼_2_0"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_2_0"] -= 1;
                XGDY_DataManager.Instance.saveData.itemData["鱼_2_1"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_2_1"] -= 1;
                XGDY_DataManager.Instance.saveData.itemData["鱼_2_2"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_2_2"] -= 1;
                XGDY_DataManager.Instance.executeEvent(eventId); 
                // EventManager.Scene.emit(XGDY_GameEvents.Hide_Npc,npcId);
                XGDY_DataManager.Instance.dynamicData.currentFishesValue = XGDY_DataManager.Instance.calculateTotalFishValue();
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Value);
                EventManager.Scene.emit(XGDY_GameEvents.Hide_Npc,npcId);
                XGDY_DataManager.Instance.dynamicData.currentSellFishs =["鱼_2_0","鱼_2_1","鱼_2_2"];
                EventManager.Scene.emit(XGDY_GameEvents.Destory_Fish_Stole);
                break;

            case "事件_0_2":
                XGDY_DataManager.Instance.unlockAngler("钓友_3");
                XGDY_DataManager.Instance.executeEvent(eventId); 
                EventManager.Scene.emit(XGDY_GameEvents.Hide_Npc,npcId);

                XGDY_DataManager.Instance.saveData.itemData["鱼_2_0"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_2_0"] -= 1;
                XGDY_DataManager.Instance.dynamicData.currentFishesValue = XGDY_DataManager.Instance.calculateTotalFishValue();
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Value);
                XGDY_DataManager.Instance.dynamicData.currentSellFishs =["鱼_2_0"];
                EventManager.Scene.emit(XGDY_GameEvents.Destory_Fish_Stole);
                break;
              
            case "事件_1_0"://常空
                XGDY_DataManager.Instance.unlockAngler("钓友_4");
                XGDY_DataManager.Instance.executeEvent(eventId); 
                EventManager.Scene.emit(XGDY_GameEvents.Hide_Npc,npcId);

                XGDY_DataManager.Instance.saveData.itemData["鱼_1_3"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_1_3"] -= 1;
                XGDY_DataManager.Instance.dynamicData.currentFishesValue = XGDY_DataManager.Instance.calculateTotalFishValue();
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Value);
                XGDY_DataManager.Instance.dynamicData.currentSellFishs =["鱼_1_3"];
                EventManager.Scene.emit(XGDY_GameEvents.Destory_Fish_Stole);
                break;
            case "事件_1_1":
                XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.Coin] += 200000;
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Money);
                XGDY_DataManager.Instance.saveData.itemData["鱼_2_3"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_2_3"] -= 1;
                XGDY_DataManager.Instance.saveData.itemData["鱼_2_4"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_2_4"] -= 1;
                XGDY_DataManager.Instance.saveData.itemData["鱼_2_5"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_2_5"] -= 1;
                XGDY_DataManager.Instance.saveData.itemData["鱼_2_6"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_2_6"] -= 1;
                XGDY_DataManager.Instance.executeEvent(eventId); 
                // EventManager.Scene.emit(XGDY_GameEvents.Hide_Npc,npcId);
                XGDY_DataManager.Instance.dynamicData.currentFishesValue = XGDY_DataManager.Instance.calculateTotalFishValue();
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Value);
                EventManager.Scene.emit(XGDY_GameEvents.Hide_Npc,npcId);
                XGDY_DataManager.Instance.dynamicData.currentSellFishs =["鱼_2_3","鱼_2_4","鱼_2_5","鱼_2_6"];
                EventManager.Scene.emit(XGDY_GameEvents.Destory_Fish_Stole);
                break; 
            case "事件_2_0"://断甘
                XGDY_DataManager.Instance.unlockAngler("钓友_5");
                XGDY_DataManager.Instance.executeEvent(eventId); 
                EventManager.Scene.emit(XGDY_GameEvents.Hide_Npc,npcId);
                break;
            case "事件_3_0"://疯有钓
                XGDY_DataManager.Instance.unlockAngler("钓友_6");
                XGDY_DataManager.Instance.executeEvent(eventId); 
                EventManager.Scene.emit(XGDY_GameEvents.Hide_Npc,npcId);

                XGDY_DataManager.Instance.saveData.itemData["鱼_3_5"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_3_5"] -= 1;
                XGDY_DataManager.Instance.dynamicData.currentFishesValue = XGDY_DataManager.Instance.calculateTotalFishValue();
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Value);
                XGDY_DataManager.Instance.dynamicData.currentSellFishs =["鱼_3_5"];
                EventManager.Scene.emit(XGDY_GameEvents.Destory_Fish_Stole);
                break;
            case "事件_4_0"://北冥
                XGDY_DataManager.Instance.unlockAngler("钓友_7");
                XGDY_DataManager.Instance.executeEvent(eventId); 
                EventManager.Scene.emit(XGDY_GameEvents.Hide_Npc,npcId);

                XGDY_DataManager.Instance.saveData.itemData["鱼_5_0"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_5_0"] -= 1;
                XGDY_DataManager.Instance.dynamicData.currentFishesValue = XGDY_DataManager.Instance.calculateTotalFishValue();
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Value);
                XGDY_DataManager.Instance.dynamicData.currentSellFishs =["鱼_5_0"];
                EventManager.Scene.emit(XGDY_GameEvents.Destory_Fish_Stole);
                break;
            case "事件_5_0"://曾天国
                XGDY_DataManager.Instance.unlockAngler("钓友_8");
                XGDY_DataManager.Instance.executeEvent(eventId); 
                EventManager.Scene.emit(XGDY_GameEvents.Hide_Npc,npcId);
                
                XGDY_DataManager.Instance.saveData.itemData["鱼_5_3"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_5_3"] -= 1;
                XGDY_DataManager.Instance.dynamicData.currentFishesValue = XGDY_DataManager.Instance.calculateTotalFishValue();
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Value);
                XGDY_DataManager.Instance.dynamicData.currentSellFishs =["鱼_5_3"];
                EventManager.Scene.emit(XGDY_GameEvents.Destory_Fish_Stole);
                break;
            case "事件_6_0"://南罡
                XGDY_DataManager.Instance.unlockAngler("钓友_9");
                XGDY_DataManager.Instance.executeEvent(eventId); 
                EventManager.Scene.emit(XGDY_GameEvents.Hide_Npc,npcId);
                XGDY_DataManager.Instance.saveData.itemData["鱼_6_0"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_6_0"] -= 1;
                XGDY_DataManager.Instance.saveData.itemData["鱼_6_1"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_6_1"] -= 1;
                XGDY_DataManager.Instance.saveData.itemData["鱼_6_2"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_6_2"] -= 1;
                XGDY_DataManager.Instance.saveData.itemData["鱼_6_3"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_6_3"] -= 1;
                XGDY_DataManager.Instance.saveData.itemData["鱼_6_4"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_6_4"] -= 1;
                XGDY_DataManager.Instance.saveData.itemData["鱼_6_5"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_6_5"] -= 1;
                XGDY_DataManager.Instance.saveData.itemData["鱼_6_6"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_6_6"] -= 1;
                XGDY_DataManager.Instance.saveData.itemData["鱼_6_7"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_6_7"] -= 1;
                XGDY_DataManager.Instance.saveData.itemData["鱼_6_8"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_6_8"] -= 1;
                XGDY_DataManager.Instance.saveData.itemData["鱼_6_9"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_6_9"] -= 1;
                XGDY_DataManager.Instance.dynamicData.currentFishesValue = XGDY_DataManager.Instance.calculateTotalFishValue();
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Value);
                XGDY_DataManager.Instance.dynamicData.currentSellFishs = [...XGDY_Constant.MAP_7_SpecialFishList];
                EventManager.Scene.emit(XGDY_GameEvents.Destory_Fish_Stole);
                break;
            case "事件_7_0"://姜老
                XGDY_DataManager.Instance.unlockAngler("钓友_10");
                XGDY_DataManager.Instance.executeEvent(eventId); 
                EventManager.Scene.emit(XGDY_GameEvents.Hide_Npc,npcId);

                 XGDY_DataManager.Instance.saveData.itemData["鱼_7_1"] -= 1;
                XGDY_DataManager.Instance.saveData.fishData["鱼_7_1"] -= 1;
                XGDY_DataManager.Instance.dynamicData.currentFishesValue = XGDY_DataManager.Instance.calculateTotalFishValue();
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Value);
                XGDY_DataManager.Instance.dynamicData.currentSellFishs =["鱼_7_1"];
                EventManager.Scene.emit(XGDY_GameEvents.Destory_Fish_Stole);
                break;
            case "事件_8_0"://贺钓帝
                XGDY_DataManager.Instance.unlockAngler("钓友_11");
                XGDY_DataManager.Instance.executeEvent(eventId); 
                EventManager.Scene.emit(XGDY_GameEvents.Hide_Npc,npcId);
                break; 
            case "事件_101_0"://贺钓帝
                EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_SELECT_FISH_LEVEL_PANEL);
                break;
            case "事件_102_000"://挑战1
                XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.CelebrationCoin] -= 500;  
                EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"已支付500庆典币，开始挑战");
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_CelebrationCoin_Money);
                this.startCelebrationChallenge(1);

                break;
            case "事件_102_001"://挑战2
                XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.CelebrationCoin] -= 1000;  
                EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"已支付1000庆典币，开始挑战");
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_CelebrationCoin_Money);
                this.startCelebrationChallenge(2);
                break;
            case "事件_102_002"://挑战3
                XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.CelebrationCoin] -= 2000;  
                EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"已支付2000庆典币，开始挑战");
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_CelebrationCoin_Money);
                this.startCelebrationChallenge(3);
                break;
            case "事件_102_100"://打开庆典商店
                EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_CELEBRATION_PANEL);
                break;
            case "事件_102_101"://兑换一条银蛟鱼
                if(!XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.CelebrationCoin]){
                    XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.CelebrationCoin] = 0; 
                }
                XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.CelebrationCoin] += 200;  
                EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"获得200庆典币");
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_CelebrationCoin_Money);
                XGDY_DataManager.Instance.saveData.itemData["鱼_6_11"] -= 1; 
                XGDY_DataManager.Instance.saveData.fishData["鱼_6_11"] -= 1;
                XGDY_DataManager.Instance.dynamicData.currentFishesValue = XGDY_DataManager.Instance.calculateTotalFishValue();
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Value);
                XGDY_DataManager.Instance.dynamicData.currentSellFishs =["鱼_6_11"];
                EventManager.Scene.emit(XGDY_GameEvents.Destory_Fish_Stole);
                break;
            case "事件_102_102"://兑换所有银蛟鱼
                if(!XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.CelebrationCoin]){
                    XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.CelebrationCoin] = 0; 
                }
                let fishNum = XGDY_DataManager.Instance.saveData.itemData["鱼_6_11"];
                XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.CelebrationCoin] += 200 * fishNum;   
                EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"获得"+200*fishNum+"庆典币"); 
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_CelebrationCoin_Money);
                XGDY_DataManager.Instance.saveData.itemData["鱼_6_11"] = 0; 
                XGDY_DataManager.Instance.saveData.fishData["鱼_6_11"] = 0; 
                XGDY_DataManager.Instance.dynamicData.currentFishesValue = XGDY_DataManager.Instance.calculateTotalFishValue();
                EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Value);
                for(let i = 0;i<fishNum;i++){
                    XGDY_DataManager.Instance.dynamicData.currentSellFishs.push("鱼_6_11");
                }
                EventManager.Scene.emit(XGDY_GameEvents.Destory_Fish_Stole);
                break;
            case "事件_103_0"://开启预赛
                //设置当前地图专属鱼为目标鱼
                XGDY_DataManager.Instance.dynamicData.currentMapFishs = [XGDY_Constant.MAP_103_Challenge1_Data.targetFishId];
                XGDY_DataManager.Instance.dynamicData.currentMapFishsProbility = [1];
                //设置挑战状态
                XGDY_DataManager.Instance.dynamicData.is_Map103_Challenge_1_Challengeing = true;
                XGDY_DataManager.Instance.dynamicData.isMapCanFishing = true;
                //设置挑战目标数量
                XGDY_DataManager.Instance.dynamicData.Map103_Challenge_1_TargetFishCount = XGDY_Constant.MAP_103_Challenge1_Data.targetCount;
                XGDY_DataManager.Instance.dynamicData.Map103_challenge_1_Count = 0;
                //开始倒计时
                XGDY_DataManager.Instance.dynamicData.remainingTime = XGDY_Constant.MAP_103_Challenge1_Data.targetTime;
                XGDY_DataManager.Instance.dynamicData.mapPassTime = 0;
                EventManager.Scene.emit(XGDY_GameEvents.SpecialNPC_Update_Label);
                //提示
                EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"百强赛！开始！");
                break;
            case "事件_103_1"://开启预赛
                //设置当前地图专属鱼为目标鱼
                XGDY_DataManager.Instance.dynamicData.currentMapFishs = [XGDY_Constant.MAP_103_Challenge2_Data.targetFishId];
                XGDY_DataManager.Instance.dynamicData.currentMapFishsProbility = [1];
                //设置挑战状态
                XGDY_DataManager.Instance.dynamicData.is_Map103_Challenge_2_Challengeing = true;
                XGDY_DataManager.Instance.dynamicData.isMapCanFishing = true;
                //npc地图显示对话
                EventManager.Scene.emit(XGDY_GameEvents.SpecialNPC_Show_Challenge2_String);
                //提示
                EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"十强赛！开始！");
                break;
            case "事件_103_2"://开启预赛
                //设置当前地图专属鱼为目标鱼
                XGDY_DataManager.Instance.dynamicData.currentMapFishs = [XGDY_Constant.MAP_103_Challenge3_Data.targetFishId];
                XGDY_DataManager.Instance.dynamicData.currentMapFishsProbility = [1];
                //设置挑战状态
                XGDY_DataManager.Instance.dynamicData.is_Map103_Challenge_3_Challengeing = true;
                XGDY_DataManager.Instance.dynamicData.isMapCanFishing = true;
                //npc地图显示对话
                EventManager.Scene.emit(XGDY_GameEvents.SpecialNPC_Show_Challenge3_String);
                //提示
                EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"决赛！开始！");
                break;
        }
            XGDY_DataManager.Instance.saveToStorage();
    }



    startCelebrationChallenge(challengeId:number){

        let targetFishLevels = XGDY_Constant.MAP_102_TartgetFishLevels[challengeId.toString()];
        let currentMapFishs = []
        targetFishLevels.forEach((level)=>{
            let allLevelFishDatas = XGDY_DataManager.Instance.getAllFishsData()[level.toString()];
            Object.keys(allLevelFishDatas).forEach(idx=>{
                currentMapFishs.push(allLevelFishDatas[idx].id);
            })
        })

        XGDY_DataManager.Instance.dynamicData.currentMapFishs = currentMapFishs;
        let probability = 1/currentMapFishs.length;
        XGDY_DataManager.Instance.dynamicData.currentMapFishsProbility =[] ;
        XGDY_DataManager.Instance.dynamicData.currentMapFishs.forEach((fishId)=>{
            XGDY_DataManager.Instance.dynamicData.currentMapFishsProbility.push(probability) ;
        })
        XGDY_DataManager.Instance.dynamicData.currentMapFishs = currentMapFishs;
        XGDY_DataManager.Instance.dynamicData.remainingTime = 3*60;
        XGDY_DataManager.Instance.dynamicData.mapPassTime = 0;
        XGDY_DataManager.Instance.dynamicData.challengeWeightCount = 0;
        XGDY_DataManager.Instance.dynamicData.isMap102Challengeing = true;
        XGDY_DataManager.Instance.dynamicData.challengeTargetWeightCount = XGDY_Constant.MAP_102_TartgetWeight[challengeId.toString()];
        XGDY_DataManager.Instance.dynamicData.challengeTargetShopMoney = XGDY_Constant.MAP_102_RewardShopMoney[challengeId.toString()];
        EventManager.Scene.emit(XGDY_GameEvents.SpecialNPC_Update_Label);
        this.node.active = false;
    }













    addListener(){
        this.isAddListener = true;
       // 监听跳过按钮点击事件
        if (this.skipButton) {
            this.skipButton.node.on(Button.EventType.CLICK, this.onSkipButtonClick, this);
        }
        
        // 监听关闭按钮点击事件
        if (this.closeButton) {
            this.closeButton.node.on(Button.EventType.CLICK, this.onCloseButtonClick, this);
        }
    }
    
    
    removeListener(){
    }
    

    protected onDestroy(): void {
        this.removeListener();
    }
}


