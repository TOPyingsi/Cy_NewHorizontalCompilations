import { _decorator, Component, Label, Node, Sprite, tween, UITransform, v3 } from 'cc';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { DH_GameEvents } from '../Common/DH_GameEvents';
import { DH_DataManager, DH_ItemType, DH_LevelJsonData } from '../Manager/DH_DataManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('DH_GameSettingPanel')
export class DH_GameSettingPanel extends Component {

     @property(Node) 
    btnAngler: Node = null!; // 角色项模板

    @property(Node) 
    btnFishes: Node = null!; // 角色项模板

        @property(Node) 
    btnSkills: Node = null!; // 角色项模板

    @property(Node) 
    btnFishRod: Node = null!; // 角色项模板

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
    btnBackToMain: Node = null!; // 角色项模板

    

    isAddListener:boolean = false;


    init(){
        if(!this.isAddListener){
            this.addListener();
        }
       
        this.fishesValue.string ="已累计金币："+ DH_DataManager.Instance.dynamicData.currentFishesValue;
        this.UI_Update_Express();
        this.UI_Update_Health();
        this.UI_Update_Weight();
        this.UI_Update_Money();
        

        this.btnBackToMain.active = !DH_DataManager.Instance.dynamicData.isInGame;
    }

    onAnglerClick(){
        EventManager.Scene.emit(DH_GameEvents.UI_SHOW_ANGLER_PANEL);
    }

    onBtnFishClick(){
        EventManager.Scene.emit(DH_GameEvents.UI_SHOW_FISH_PANEL);
    }

    onBtnSkillClick(){
        EventManager.Scene.emit(DH_GameEvents.UI_SHOW_SKILL_PANEL);
    }

    onBtnFishRodClick(){
        EventManager.Scene.emit(DH_GameEvents.UI_SHOW_FISH_ROD_PANEL);
    }

    updateValue(){
        this.fishesValue.string ="已累计金币："+ DH_DataManager.Instance.dynamicData.currentFishesValue;
    }

    hideSetting(){
        // let width = this.settingContainer.getComponent(UITransform).width;
        // let worldPos = this.settingContainer.worldPosition.clone();
        // tween(this.settingContainer)
        // .to(0.5,{worldPosition:v3(worldPos.x - width,worldPos.y,worldPos.z)})
        // .start();
        this.settingContainer.active = false;

    }

    showSetting(){
        // let width = this.settingContainer.getComponent(UITransform).width;
        // let worldPos = this.settingContainer.worldPosition.clone();
        // tween(this.settingContainer)
        // .to(0.5,{worldPosition:v3(worldPos.x + width,worldPos.y,worldPos.z)})
        // .start();
        this.settingContainer.active = true;
    }

    UI_Update_Express(){
        let Express = DH_DataManager.Instance.saveData.itemData[DH_ItemType.Experience];  // 增加鱼的数量
        let currentLevel =  DH_DataManager.Instance.saveData.itemData[DH_ItemType.Level];  
        let levelData= DH_DataManager.Instance.getItemDataById(`${DH_ItemType.Level}_${currentLevel}`) as DH_LevelJsonData;  // 获取鱼的数量
        let maxExp = DH_DataManager.Instance.calcUpgradeExp(currentLevel);
        this.lblExpress.string = Express+"/"+maxExp+"";
        this.progressExpress.fillRange = Express/maxExp;
        this.lblLv.string = "LV "+currentLevel
    }

    UI_Update_Health(){
        let currentLevel =  DH_DataManager.Instance.saveData.itemData[DH_ItemType.Level];  
        let currentHealth =  DH_DataManager.Instance.dynamicData.currentHealth;
        let levelData= DH_DataManager.Instance.getItemDataById(`${DH_ItemType.Level}_${currentLevel}`) as DH_LevelJsonData;  // 获取鱼的数量
        let maxHealth = DH_DataManager.Instance.calculateHealth(currentLevel);
        this.lblHealth.string = currentHealth+"/"+maxHealth+"";
        this.progressHealth.fillRange = currentHealth/maxHealth;
    }

    UI_Update_Weight(){
        let weight = DH_DataManager.Instance.saveData.itemData[DH_ItemType.Weight];
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
        let money = DH_DataManager.Instance.saveData.itemData[DH_ItemType.Coin];
        let displayMoney: string;
        
        if (money >= 100000000) {
            // 超过亿时转换为亿单位并保留1位小数
            displayMoney = (money / 100000000).toFixed(1) + "亿";
        } else if (money >= 10000) {
            // 超过万时转换为万单位并保留1位小数
            displayMoney = (money / 10000).toFixed(1) + "万";
        } else {
            // 保留1位小数
            displayMoney = money.toFixed(1);
        }
        
        this.lblMoney.string = displayMoney;
    }


    passTime = 0;
    update(dt){
        this.passTime+=dt
        if(this.passTime > 2){
            this.passTime -= 2;
            let currentLevel =  DH_DataManager.Instance.saveData.itemData[DH_ItemType.Level];  
            let currentHealth =  DH_DataManager.Instance.dynamicData.currentHealth;
            let levelData= DH_DataManager.Instance.getItemDataById(`${DH_ItemType.Level}_${currentLevel}`) as DH_LevelJsonData;  // 获取鱼的数量
            let maxHealth = DH_DataManager.Instance.calculateHealth(currentLevel);
            if(currentHealth<maxHealth){
                currentHealth += 2*(Math.ceil(currentLevel/10)+1);
                if(currentHealth>=maxHealth){
                    currentHealth = maxHealth;
                }
                DH_DataManager.Instance.dynamicData.currentHealth = currentHealth;
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

    addListener(){
        this.isAddListener = true;
        this.btnAngler.on("click",this.onAnglerClick,this);
        this.btnFishes.on("click",this.onBtnFishClick,this);
        this.btnSkills.on("click",this.onBtnSkillClick,this);
        this.btnFishRod.on("click",this.onBtnFishRodClick,this);
        this.btnBackToMain.on("click",this.onbtnBackToMainClick,this);

        EventManager.on(DH_GameEvents.UI_Update_Value,this.updateValue,this);
        EventManager.on(DH_GameEvents.UI_Hide_SettingBtn,this.hideSetting,this);
        EventManager.on(DH_GameEvents.UI_Show_SettingBtn,this.showSetting,this);
        EventManager.on(DH_GameEvents.UI_Update_Expression,this.UI_Update_Express,this);
        EventManager.on(DH_GameEvents.UI_Update_Health,this.UI_Update_Health,this);
        EventManager.on(DH_GameEvents.UI_Update_Weight,this.UI_Update_Weight,this);
        EventManager.on(DH_GameEvents.UI_Update_Money,this.UI_Update_Money,this);


    }

  
    removeListener(){
        EventManager.off(DH_GameEvents.UI_Update_Value,this.updateValue,this);
        EventManager.off(DH_GameEvents.UI_Hide_SettingBtn,this.hideSetting,this);
        EventManager.off(DH_GameEvents.UI_Show_SettingBtn,this.showSetting,this);
        EventManager.off(DH_GameEvents.UI_Update_Expression,this.UI_Update_Express,this);
        EventManager.off(DH_GameEvents.UI_Update_Health,this.UI_Update_Health,this);
        EventManager.off(DH_GameEvents.UI_Update_Weight,this.UI_Update_Weight,this);
        EventManager.off(DH_GameEvents.UI_Update_Money,this.UI_Update_Money,this);



    }

    protected onDestroy(): void {
        this.removeListener();
    }
}


