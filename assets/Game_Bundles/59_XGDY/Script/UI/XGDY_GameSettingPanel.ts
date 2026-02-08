import { _decorator, Component, Label, Node, Sprite, tween, UITransform, v3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
import { XGDY_DataManager, XGDY_ItemType, XGDY_LevelJsonData } from '../Manager/XGDY_DataManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('XGDY_GameSettingPanel')
export class XGDY_GameSettingPanel extends Component {



    @property(Node) 
    btnAngler: Node = null!; // 角色项模板

    @property(Node) 
    btnFishes: Node = null!; // 角色项模板

    @property(Node) 
    btnSkills: Node = null!; // 角色项模板

    @property(Node) 
    btnFishRod: Node = null!; // 角色项模板

    @property(Node) 
    btnSeat: Node = null!; // 角色项模板

    @property(Label) 
    fishesValue:Label = null;

    @property(Node) 
    settingContainer: Node = null!; // 角色项模板

    @property(Label) 
    lblExpress:Label = null;

    @property(Sprite) 
    progressExpress:Sprite = null;

    @property(Label) 
    lblLv:Label = null;
    
    @property(Label) 
    lblHealth:Label = null;

    @property(Sprite) 
    progressHealth:Sprite = null;

     
    @property(Label) 
    lblWeight:Label = null;

    @property(Label) 
    lblMoney:Label = null;

    @property(Node) 
    nodeMoney:Node = null;
    
    
    @property(Node) 
    btnBackToMain: Node = null!; // 角色项模板
    
    @property(Node) 
    btnAddMoney: Node = null!; // 角色项模板
    

    isAddListener:boolean = false;


    init(){
        if(!this.isAddListener){
            this.addListener();
        }
       
        this.fishesValue.string ="已累计金币："+ XGDY_DataManager.Instance.dynamicData.currentFishesValue;
        this.UI_Update_Express();
        this.UI_Update_Health();
        this.UI_Update_Weight();
        this.UI_Update_Money();
        

        this.btnBackToMain.active = !XGDY_DataManager.Instance.dynamicData.isInGame;
    }

    onAnglerClick(){
        EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_ANGLER_PANEL);
    }

    onBtnFishClick(){
        EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_FISH_PANEL);
    }

    onBtnSkillClick(){
        EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_SKILL_PANEL);
    }

    onBtnFishRodClick(){
        EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_FISH_ROD_PANEL);
    }

    onBtnSeatClick(){
        EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_SEAT_PANEL);
    }

    updateValue(){
        this.fishesValue.string ="已累计金币："+ XGDY_DataManager.Instance.dynamicData.currentFishesValue;
    }

    hideSetting(){
        // let width = this.settingContainer.getComponent(UITransform).width;
        // let worldPos = this.settingContainer.worldPosition.clone();
        // tween(this.settingContainer)
        // .to(0.5,{worldPosition:v3(worldPos.x - width,worldPos.y,worldPos.z)})
        // .start();
        this.settingContainer.active = false;
        this.nodeMoney.active = false;
        // this.btnSignIn.active = false;
        // this.btnPool.active = false;

    }

    showSetting(){
        // let width = this.settingContainer.getComponent(UITransform).width;
        // let worldPos = this.settingContainer.worldPosition.clone();
        // tween(this.settingContainer)
        // .to(0.5,{worldPosition:v3(worldPos.x + width,worldPos.y,worldPos.z)})
        // .start();
        this.settingContainer.active = true;
        this.nodeMoney.active = true;
        // this.btnSignIn.active = true;
        // this.btnPool.active = true;
    }

    UI_Update_Express(){
        let Express = XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.Experience];  // 增加鱼的数量
        let currentLevel =  XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.Level];  
        let levelData= XGDY_DataManager.Instance.getItemDataById(`${XGDY_ItemType.Level}_${currentLevel}`) as XGDY_LevelJsonData;  // 获取鱼的数量
        let maxExp = XGDY_DataManager.Instance.calcUpgradeExp(currentLevel);
        this.lblExpress.string = Express+"/"+maxExp+"";
        this.progressExpress.fillRange = Express/maxExp;
        this.lblLv.string = "LV "+currentLevel
    }

    UI_Update_Health(){
        let currentLevel =  XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.Level];  
        let currentHealth =  XGDY_DataManager.Instance.dynamicData.currentHealth;
        let levelData= XGDY_DataManager.Instance.getItemDataById(`${XGDY_ItemType.Level}_${currentLevel}`) as XGDY_LevelJsonData;  // 获取鱼的数量
        let maxHealth = XGDY_DataManager.Instance.calculateHealth(currentLevel);
        this.lblHealth.string = currentHealth+"/"+maxHealth+"";
        this.progressHealth.fillRange = currentHealth/maxHealth;
    }

    UI_Update_Weight(){
        let weight = XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.Weight];
        let displayWeight: string;
        
        if (weight >= 10000) {
            // 超过万斤时转换为万斤单位并保留1位小数
            displayWeight = (weight / 10000).toFixed(1) + "万斤";
        } else {
            // 保留1位小数
            displayWeight = weight.toFixed(1) + "斤";
        }
        
        this.lblWeight.string = "上鱼总重：" + displayWeight;
    }

    UI_Update_Money(){
        let money = XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.Coin];
        let displayMoney: string;
        
        if (money >= 100000000) {
            // 超过亿时转换为亿单位并保留1位小数
            displayMoney = (money / 100000000).toFixed(1) + "亿";
        } else if (money >= 10000) {
            // 超过万时转换为万单位并保留1位小数
            displayMoney = (money / 10000).toFixed(1) + "万";
        } else {
            // 保留1位小数
            displayMoney = money.toFixed(0);
        }
        
        this.lblMoney.string = displayMoney;
    }


    passTime = 0;
    update(dt){
        this.passTime+=dt
        if(this.passTime > 2){
            this.passTime -= 2;
            let currentLevel =  XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.Level];  
            let currentHealth =  XGDY_DataManager.Instance.dynamicData.currentHealth;
            let levelData= XGDY_DataManager.Instance.getItemDataById(`${XGDY_ItemType.Level}_${currentLevel}`) as XGDY_LevelJsonData;  // 获取鱼的数量
            let maxHealth = XGDY_DataManager.Instance.calculateHealth(currentLevel);
            if(currentHealth<maxHealth){
                currentHealth += 2*(Math.ceil(currentLevel/10)+1);
                if(currentHealth>=maxHealth){
                    currentHealth = maxHealth;
                }
                XGDY_DataManager.Instance.dynamicData.currentHealth = currentHealth;
                this.UI_Update_Health();
            }
        } 
    }

    onbtnBackToMainClick(){
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                    ProjectEventManager.emit(ProjectEvent.返回主页, "钓魂");
            })
        });
        // UIManager.ShowPanel(Panel.ReturnPanel);
    }

    onAddMoneyClick(){
        EventManager.Scene.emit(XGDY_GameEvents.UI_SHOW_ADD_MONEY_PANEL);
    }


    addListener(){
        this.isAddListener = true;
        this.btnAngler.on("click",this.onAnglerClick,this);
        this.btnFishes.on("click",this.onBtnFishClick,this);
        this.btnSkills.on("click",this.onBtnSkillClick,this);
        this.btnFishRod.on("click",this.onBtnFishRodClick,this);
        this.btnSeat.on("click",this.onBtnSeatClick,this);
        this.btnBackToMain.on("click",this.onbtnBackToMainClick,this);
        this.btnAddMoney.on("click",this.onAddMoneyClick,this);



        EventManager.on(XGDY_GameEvents.UI_Update_Value,this.updateValue,this);
        EventManager.on(XGDY_GameEvents.UI_Hide_SettingBtn,this.hideSetting,this);
        EventManager.on(XGDY_GameEvents.UI_Show_SettingBtn,this.showSetting,this);
        EventManager.on(XGDY_GameEvents.UI_Update_Expression,this.UI_Update_Express,this);
        EventManager.on(XGDY_GameEvents.UI_Update_Health,this.UI_Update_Health,this);
        EventManager.on(XGDY_GameEvents.UI_Update_Weight,this.UI_Update_Weight,this);
        EventManager.on(XGDY_GameEvents.UI_Update_Money,this.UI_Update_Money,this);


    }

  
    removeListener(){
        EventManager.off(XGDY_GameEvents.UI_Update_Value,this.updateValue,this);
        EventManager.off(XGDY_GameEvents.UI_Hide_SettingBtn,this.hideSetting,this);
        EventManager.off(XGDY_GameEvents.UI_Show_SettingBtn,this.showSetting,this);
        EventManager.off(XGDY_GameEvents.UI_Update_Expression,this.UI_Update_Express,this);
        EventManager.off(XGDY_GameEvents.UI_Update_Health,this.UI_Update_Health,this);
        EventManager.off(XGDY_GameEvents.UI_Update_Weight,this.UI_Update_Weight,this);
        EventManager.off(XGDY_GameEvents.UI_Update_Money,this.UI_Update_Money,this);



    }

    protected onDestroy(): void {
        this.removeListener();
    }
}


