import { _decorator, Button, Component, instantiate, Label, Node, Sprite } from 'cc';
import { XGDY_CarType, XGDY_DataManager, XGDY_MapJsonData } from '../Manager/XGDY_DataManager';
import { XGDY_LoadManager } from '../Manager/XGDY_LoadManager';
import { XGDY_GameManager } from '../Manager/XGDY_GameManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
import Banner from 'db://assets/Scripts/Banner';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('XGDY_SeatPanel')
export class XGDY_SeatPanel extends Component {

    
    @property(Node) 
    seatContainer: Node = null!;  

    @property(Button) 
    btnBack: Button = null!;  

    isAddListener:boolean = false;
    
    init(){
        if(!this.isAddListener){
            this.addListener();
        }
        this.initMapList();
                  ProjectEventManager.emit(ProjectEvent.弹出窗口, "修勾钓鱼");
    }

    initMapList(){
         this.seatContainer.children.forEach((node,idx)=>{
            if(!XGDY_DataManager.Instance.saveData.itemData[node.name]){
                XGDY_DataManager.Instance.saveData.itemData[node.name] = 0;
            }

            XGDY_DataManager.Instance.saveData.itemData[XGDY_DataManager.Instance.saveData.carType] = 1;

            
            let btnVideo = node.getChildByName("btnVideo");
            btnVideo.active = XGDY_DataManager.Instance.saveData.itemData[node.name] == 0;

            let btnSet = node.getChildByName("btnSet");
            btnSet.active = XGDY_DataManager.Instance.saveData.carType != node.name;

            let nodeSelect = node.getChildByName("nodeSelected");
            nodeSelect.active = XGDY_DataManager.Instance.saveData.carType == node.name;
            
            btnSet.off("click");
            btnSet.on("click", () => this.onBtnSetClick(node.name));
           
            btnVideo.off("click");
            btnVideo.on("click", () => this.onBtnVideoClick(node.name));
         })
    }


    onBtnSetClick(carType:string){
        XGDY_DataManager.Instance.saveData.carType = carType as XGDY_CarType;
        XGDY_DataManager.Instance.saveToStorage();
        EventManager.Scene.emit(XGDY_GameEvents.UI_Update_CarType);
        this.initMapList();
    }

    onBtnVideoClick(mapID:string){
        Banner.Instance.ShowVideoAd(()=>{
            XGDY_DataManager.Instance.saveData.itemData[mapID] = 1;
            XGDY_DataManager.Instance.saveToStorage();
            this.initMapList();
        })
    }

    addListener(){
        this.isAddListener = true;
        this.btnBack.node.on("click", this.onBtnBackClick, this);
    }

    onBtnBackClick(){
        this.node.active = false;
    }

    protected onDestroy(): void {
    }

    
}


