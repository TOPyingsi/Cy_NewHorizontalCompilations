import { _decorator, Button, Component, instantiate, Label, Node, Sprite } from 'cc';
import { DH_DataManager, DH_MapJsonData } from '../Manager/DH_DataManager';
import { DH_LoadManager } from '../Manager/DH_LoadManager';
import { DH_GameManager } from '../Manager/DH_GameManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { DH_GameEvents } from '../Common/DH_GameEvents';
const { ccclass, property } = _decorator;

@ccclass('DH_MapPanel')
export class DH_MapPanel extends Component {

    @property(Node) 
    mapItem: Node = null!;  
    
    @property(Node) 
    mapContainer: Node = null!;  

    @property(Button) 
    btnBack: Button = null!;  

    mapType:0;

    isAddListener:boolean = false;
    
    init(){
        if(!this.isAddListener){
            this.addListener();
        }
        this.initMapList(this.mapType)
    }

    initMapList(mapType:number){
        // this.mapContainer.children.forEach((node,idx)=>{
        //     if(idx !== 0){
        //         node.destroy();
        //     }
        //     else{
        //         node.active = false;
        //     }
        // })
        const allMapsData = DH_DataManager.Instance.getAllMapsData();
        const mapSaveData = DH_DataManager.Instance.saveData.mapData;
        Object.keys(allMapsData).forEach((key,idx) => {
            let mapData = allMapsData[key] as DH_MapJsonData;
            let isUnlock = mapSaveData.indexOf(mapData.地图id) != -1;
            let mapItem = this.mapContainer.children[idx];
            // mapItem.parent = this.mapContainer;
            // mapItem.active = true;

            let spMap = mapItem.getChildByName("spMap").getComponent(Sprite);
            let lock = mapItem.getChildByName("lock");
            let lblLock = lock.getChildByName("lblLock").getComponent(Label);
            let lblMapName = mapItem.getChildByName("lblMapName").getComponent(Label);
            let lblSpecialFishes = mapItem.getChildByName("lblSpecialFishes").getComponent(Label);
            let lblDesc = mapItem.getChildByName("lblDesc").getComponent(Label);

            // DH_LoadManager.Instance.getMapIconById(mapData.地图id, (frame) => {
            //     if (!frame) return;
            //     spMap.spriteFrame = frame;
            // });
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
        DH_DataManager.Instance.setCurrentMap(mapID);
        DH_GameManager.Instance.enterGame();
        EventManager.Scene.emit(DH_GameEvents.UI_ENTER_GAME);
        this.node.active = false;
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


