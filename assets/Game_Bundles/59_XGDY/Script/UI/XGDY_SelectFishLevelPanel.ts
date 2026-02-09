import { _decorator, Button, Component, instantiate, Label, Node, Sprite } from 'cc';
import { XGDY_DataManager, XGDY_ItemType, XGDY_MapJsonData } from '../Manager/XGDY_DataManager';
import { XGDY_LoadManager } from '../Manager/XGDY_LoadManager';
import { XGDY_GameManager } from '../Manager/XGDY_GameManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
import { XGDY_Constant } from '../Common/XGDY_Constant';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('XGDY_SelectFishLevelPanel')
export class XGDY_SelectFishLevelPanel extends Component {

    @property(Node)
    levelItemContainer:Node = null;

    @property(Button)
    btnClose:Button = null;

    isAddListener:boolean = false;
    
    init(){
        if(!this.isAddListener){
            this.addListener();
        }
        this.initFishLevelList()
                  ProjectEventManager.emit(ProjectEvent.弹出窗口, "修勾钓鱼");
    }

    initFishLevelList(){
        const allMapsData = XGDY_DataManager.Instance.getAllMapsData();
        const unlockFishesData = XGDY_DataManager.Instance.saveData.unlockFishes;

        // let maxFishLevel = 0;
        let unlockLevels = [];
        
        unlockFishesData.forEach(fishId=>{
            if(XGDY_Constant.SpecialFishId.includes(fishId)){
                return;
            }
            // maxFishLevel = Math.max(maxFishLevel,parseInt(fishId.split("_")[1]));
            let fishLevel = parseInt(fishId.split("_")[1]);
            if(!unlockLevels.includes(fishLevel)){
                unlockLevels.push(fishLevel);
            }
        })
         this.levelItemContainer.children.forEach((node,idx)=>{
            if(!unlockLevels.includes(idx)){
                // node.active = false;
                const btn = node.getChildByName("btnBuy").getComponent(Button);
                btn.interactable = false;
                btn.node.getComponent(Sprite).grayscale = true;
                return;
            }
            node.active = true;
            let item = node;
            const btn = item.getChildByName("btnBuy").getComponent(Button);
            btn.interactable = true;
            btn.node.getComponent(Sprite).grayscale = false;
            // btn.interactable = isUnlock;
            btn.node.off("click");
            btn.node.on("click", () => this.onLevelItemClick(idx));
         })
    }

    onLevelItemClick(idx:number){
        if(XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.Coin] >= XGDY_Constant.MAP_101_Challenge[idx].price){
            XGDY_DataManager.Instance.saveData.itemData[XGDY_ItemType.Coin] -= XGDY_Constant.MAP_101_Challenge[idx].price;
            EventManager.Scene.emit(XGDY_GameEvents.UI_Update_Money);
            XGDY_DataManager.Instance.saveToStorage();
        }
        else{
            EventManager.Scene.emit(XGDY_GameEvents.Show_Tip,"金币不足");
            return;
        }
        

        let allLevelFishDatas = XGDY_DataManager.Instance.getAllFishsData()[idx.toString()];
        let currentMapFishs = []
        Object.keys(allLevelFishDatas).forEach(idx=>{
            if(XGDY_DataManager.Instance.saveData.unlockFishes.includes(allLevelFishDatas[idx].id)){
                if(!XGDY_Constant.SpecialFishId.includes(allLevelFishDatas[idx].id)){
                    currentMapFishs.push(allLevelFishDatas[idx].id);
                }
            }
        })
        XGDY_DataManager.Instance.dynamicData.currentMapFishs = currentMapFishs;
        let probability = 1/currentMapFishs.length;
        XGDY_DataManager.Instance.dynamicData.currentMapFishsProbility =[] ;
        XGDY_DataManager.Instance.dynamicData.currentMapFishs.forEach((fishId)=>{
            XGDY_DataManager.Instance.dynamicData.currentMapFishsProbility.push(probability) ;
        })
        XGDY_DataManager.Instance.dynamicData.currentMapFishs = currentMapFishs;
        XGDY_DataManager.Instance.dynamicData.isMapCanFishing = true;
        XGDY_DataManager.Instance.dynamicData.isMap101Challengeing = true;
        XGDY_DataManager.Instance.dynamicData.remainingTime = 10*60;
        XGDY_DataManager.Instance.dynamicData.mapPassTime = 0;
        EventManager.Scene.emit(XGDY_GameEvents.SpecialNPC_Update_Label);
        this.node.active = false;
    }

    addListener(){
        this.isAddListener = true;
        this.btnClose.node.on("click", this.onBtnCloseClick, this);
    }

    onBtnCloseClick(){
        this.node.active = false;
    }

    protected onDestroy(): void {
    }

    
}


