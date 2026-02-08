import { _decorator, Button, Component, instantiate, Label, Node, Sprite } from 'cc';
import { XGDY_DataManager, XGDY_MapJsonData } from '../Manager/XGDY_DataManager';
import { XGDY_LoadManager } from '../Manager/XGDY_LoadManager';
import { XGDY_GameManager } from '../Manager/XGDY_GameManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGDY_GameEvents } from '../Common/XGDY_GameEvents';
const { ccclass, property } = _decorator;

@ccclass('XGDY_MapPanel')
export class XGDY_MapPanel extends Component {


    @property(Button)
    btnMapType_0: Button = null!;  

    @property(Button)
    btnMapType_1: Button = null!;  



    @property(Node)
    type0Maps:Node[] = [];
    
    @property(Node)
    type1Maps:Node[] = [];



    @property(Node) 
    mapItem: Node = null!;  
    
    @property(Node) 
    mapContainer: Node = null!;  

    @property(Button) 
    btnBack: Button = null!;  

    isAddListener:boolean = false;
    
    init(){
        if(!this.isAddListener){
            this.addListener();
        }
        this.initMapList(0);
        this.onBtnMapTypeClick(0);
    }

    initMapList(mapType:number){
        const allMapsData = XGDY_DataManager.Instance.getAllMapsData();
        const mapSaveData = XGDY_DataManager.Instance.saveData.mapData;
         this.mapContainer.children.forEach((node,idx)=>{
            let mapItem = node;
            let mapData = allMapsData[node.name.split("_")[1]];
            let isUnlock = mapSaveData.indexOf(mapData.地图id) != -1;
          
            let spMap = mapItem.getChildByName("spMap").getComponent(Sprite);
            let lock = mapItem.getChildByName("lock");
            let lblLock = lock.getChildByName("lblLock").getComponent(Label);
            let lblMapName = mapItem.getChildByName("lblMapName").getComponent(Label);
            let lblSpecialFishes = mapItem.getChildByName("lblSpecialFishes").getComponent(Label);
            let lblDesc = mapItem.getChildByName("lblDesc").getComponent(Label);

            lblMapName.string = mapData.名称;
            lblSpecialFishes.string = "专属鱼:"+mapData.专属鱼.join("、");
            lblDesc.string = mapData.描述;
            lock.active = !isUnlock;
            lblLock.string = isUnlock?"":"LV"+mapData.解锁等级+"解锁";

            // 绑定角色项点击事件
            const btn = mapItem.getComponent(Button);
            btn.interactable = isUnlock;
            btn.node.off("click");
            btn.node.on("click", () => this.onMapItemClick(mapData.地图id));
         })
    }

    onMapItemClick(mapID:string){
        XGDY_DataManager.Instance.setCurrentMap(mapID);
        XGDY_GameManager.Instance.enterGame();
        EventManager.Scene.emit(XGDY_GameEvents.UI_ENTER_GAME);
        this.node.active = false;
    }

    onBtnMapTypeClick(mapType:number){
        this.type0Maps.forEach((node,idx)=>{
            node.active = mapType == 0;
        })
        this.type1Maps.forEach((node,idx)=>{
            node.active = mapType == 1;
        })
        this.btnMapType_0.node.getChildByName("selected").active = mapType == 0;
        this.btnMapType_1.node.getChildByName("selected").active = mapType == 1;
    }

    addListener(){
        this.isAddListener = true;
        this.btnBack.node.on("click", this.onBtnBackClick, this);
        this.btnMapType_0.node.on("click", ()=>this.onBtnMapTypeClick(0), this);
        this.btnMapType_1.node.on("click", ()=>this.onBtnMapTypeClick(1), this);
    }

    onBtnBackClick(){
        this.node.active = false;
    }

    protected onDestroy(): void {
    }

    
}


