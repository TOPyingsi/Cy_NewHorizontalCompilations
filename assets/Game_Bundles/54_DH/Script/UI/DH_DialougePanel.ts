import { _decorator, Component, Node, Label, Button, EventHandler, Prefab, instantiate } from 'cc';
import { DH_DataManager, DH_ItemType, DH_NpcJsonData } from '../Manager/DH_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { DH_GameEvents } from '../Common/DH_GameEvents';
import Banner from 'db://assets/Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('DH_DialougePanel')
export class DH_DialougePanel extends Component {

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
    private currentOptions: DH_NpcJsonData['对话对象'][string]['选项数组'] = [];  // 当前对话选项
    private npcData: DH_NpcJsonData = null;  // 当前NPC数据
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
        this.currentNpcId = DH_DataManager.Instance.dynamicData.currentNpcId;
        // 获取NPC数据
        this.npcData = DH_DataManager.Instance.getItemDataById(this.currentNpcId) as DH_NpcJsonData;
        
        // 设置默认对话ID为0
        this.currentDialogId = "0";
        
        // 开始对话
        this.startDialog(this.currentDialogId);
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
    private onOptionButtonClick(option: DH_NpcJsonData['对话对象'][string]['选项数组'][0]) {
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
    private executeConditionCheck(option: DH_NpcJsonData['对话对象'][string]['选项数组'][0]) {
        if (!option.条件判断) {
            console.error('选项缺少条件判断配置');
            return;
        }
        
        const conditionCheck = option.条件判断;
        let isConditionMet = true;
        
        // 检查所有条件
        for (const [key, value] of Object.entries(conditionCheck.条件)) {
            if(!DH_DataManager.Instance.judgeItemCondition(key,value)){
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

        Banner.Instance.ShowCustomAd();
        
        // 可以在这里添加关闭对话面板的逻辑
        // 例如：隐藏面板、触发关闭回调等
        console.log('对话已关闭');
    }


    eventHandel(eventId,npcId){
        switch (eventId) {
            case "事件_0_1"://常空
                 DH_DataManager.Instance.saveData.itemData[DH_ItemType.Coin] += 50000;
                EventManager.Scene.emit(DH_GameEvents.UI_Update_Money);
                DH_DataManager.Instance.saveData.itemData["鱼_1_2"] -= 1;
                DH_DataManager.Instance.saveData.fishData["鱼_1_2"] -= 1;
                DH_DataManager.Instance.dynamicData.currentFishesValue = DH_DataManager.Instance.calculateTotalFishValue();
                EventManager.Scene.emit(DH_GameEvents.UI_Update_Value);
                DH_DataManager.Instance.dynamicData.currentSellFishs =["鱼_1_2"];
                EventManager.Scene.emit(DH_GameEvents.Destory_Fish_Stole);
                DH_DataManager.Instance.executeEvent(eventId); 
                EventManager.Scene.emit(DH_GameEvents.Hide_Npc,npcId);
                break;
            case "事件_0_0":
                DH_DataManager.Instance.saveData.itemData[DH_ItemType.Coin] += 500000;
                EventManager.Scene.emit(DH_GameEvents.UI_Update_Money);
                DH_DataManager.Instance.saveData.itemData["鱼_2_0"] -= 1;
                DH_DataManager.Instance.saveData.fishData["鱼_2_0"] -= 1;
                DH_DataManager.Instance.saveData.itemData["鱼_2_1"] -= 1;
                DH_DataManager.Instance.saveData.fishData["鱼_2_1"] -= 1;
                DH_DataManager.Instance.saveData.itemData["鱼_2_2"] -= 1;
                DH_DataManager.Instance.saveData.fishData["鱼_2_2"] -= 1;
                DH_DataManager.Instance.saveData.itemData["鱼_2_3"] -= 1;
                DH_DataManager.Instance.saveData.fishData["鱼_2_3"] -= 1;
                DH_DataManager.Instance.executeEvent(eventId); 
                // EventManager.Scene.emit(DH_GameEvents.Hide_Npc,npcId);
                DH_DataManager.Instance.dynamicData.currentFishesValue = DH_DataManager.Instance.calculateTotalFishValue();
                EventManager.Scene.emit(DH_GameEvents.UI_Update_Value);
                EventManager.Scene.emit(DH_GameEvents.Hide_Npc,npcId);
                DH_DataManager.Instance.dynamicData.currentSellFishs =["鱼_2_0","鱼_2_1","鱼_2_2","鱼_2_3"];
                EventManager.Scene.emit(DH_GameEvents.Destory_Fish_Stole);
                break;

            case "事件_0_2":
                DH_DataManager.Instance.unlockAngler("钓友_3");
                DH_DataManager.Instance.executeEvent(eventId); 
                EventManager.Scene.emit(DH_GameEvents.Hide_Npc,npcId);
                         DH_DataManager.Instance.dynamicData.currentSellFishs =["鱼_2_0"];
                EventManager.Scene.emit(DH_GameEvents.Destory_Fish_Stole);
                
                break;
              
            case "事件_1_0"://常空
                DH_DataManager.Instance.unlockAngler("钓友_4");
                DH_DataManager.Instance.executeEvent(eventId); 
                EventManager.Scene.emit(DH_GameEvents.Hide_Npc,npcId);

                DH_DataManager.Instance.dynamicData.currentSellFishs =["鱼_3_3"];
                EventManager.Scene.emit(DH_GameEvents.Destory_Fish_Stole);
                break;
            case "事件_1_1":
                DH_DataManager.Instance.saveData.itemData[DH_ItemType.Coin] += 1000000;
                EventManager.Scene.emit(DH_GameEvents.UI_Update_Money);
                DH_DataManager.Instance.saveData.itemData["鱼_4_0"] -= 1;
                DH_DataManager.Instance.saveData.fishData["鱼_4_0"] -= 1;
                DH_DataManager.Instance.dynamicData.currentSellFishs =["鱼_4_0"];
                EventManager.Scene.emit(DH_GameEvents.Destory_Fish_Stole);
                DH_DataManager.Instance.dynamicData.currentFishesValue = DH_DataManager.Instance.calculateTotalFishValue();
                EventManager.Scene.emit(DH_GameEvents.UI_Update_Value);
                DH_DataManager.Instance.executeEvent(eventId);
                EventManager.Scene.emit(DH_GameEvents.Hide_Npc,npcId);
                break; 
            case "事件_2_0"://断甘
                DH_DataManager.Instance.unlockAngler("钓友_5");
                DH_DataManager.Instance.executeEvent(eventId); 
                EventManager.Scene.emit(DH_GameEvents.Hide_Npc,npcId);
                 DH_DataManager.Instance.dynamicData.currentSellFishs =["鱼_5_3"];
                EventManager.Scene.emit(DH_GameEvents.Destory_Fish_Stole);
                break;
            case "事件_3_0"://疯有钓
                DH_DataManager.Instance.unlockAngler("钓友_6");
                DH_DataManager.Instance.executeEvent(eventId); 
                EventManager.Scene.emit(DH_GameEvents.Hide_Npc,npcId);
                DH_DataManager.Instance.dynamicData.currentSellFishs =["鱼_6_4"];
                EventManager.Scene.emit(DH_GameEvents.Destory_Fish_Stole);
                break;
            case "事件_4_0"://北冥
                DH_DataManager.Instance.unlockAngler("钓友_7");
                DH_DataManager.Instance.executeEvent(eventId); 
                EventManager.Scene.emit(DH_GameEvents.Hide_Npc,npcId);
                DH_DataManager.Instance.dynamicData.currentSellFishs =["鱼_7_3"];
                EventManager.Scene.emit(DH_GameEvents.Destory_Fish_Stole);
                break;
            case "事件_5_0"://曾天国
                DH_DataManager.Instance.unlockAngler("钓友_8");
                DH_DataManager.Instance.executeEvent(eventId); 
                EventManager.Scene.emit(DH_GameEvents.Hide_Npc,npcId);
                DH_DataManager.Instance.dynamicData.currentSellFishs =["鱼_5_1"];
                EventManager.Scene.emit(DH_GameEvents.Destory_Fish_Stole);
                break;
            case "事件_6_0"://姜老
                DH_DataManager.Instance.unlockAngler("钓友_9");
                DH_DataManager.Instance.executeEvent(eventId); 
                EventManager.Scene.emit(DH_GameEvents.Hide_Npc,npcId);
                break;
            case "事件_7_0"://南罡
                DH_DataManager.Instance.unlockAngler("钓友_10");
                DH_DataManager.Instance.executeEvent(eventId); 
                EventManager.Scene.emit(DH_GameEvents.Hide_Npc,npcId);
                break;
            case "事件_8_0"://贺钓帝
                DH_DataManager.Instance.unlockAngler("钓友_11");
                DH_DataManager.Instance.executeEvent(eventId); 
                EventManager.Scene.emit(DH_GameEvents.Hide_Npc,npcId);
                break; 
        }
            DH_DataManager.Instance.saveToStorage();
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


