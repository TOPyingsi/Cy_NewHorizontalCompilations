import { _decorator, Component,  Node,  RigidBody } from 'cc';
import { TKJWL_DataManager } from '../Manager/TKJWL_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { TKJWL_GameEvents } from '../Common/TKJWL_GameEvents';
import { TKJWL_ItemType } from '../Common/TKJWL_ItemType';
import { TKJWL_Physics_Group } from '../Common/TKJWL_PHY_GROUP';
const { ccclass, property } = _decorator;

@ccclass('TKJWL_ItemBase')
export class TKJWL_ItemBase extends Component {

    @property(Node)
    protected noramlNodes: Node[]=[];

    protected onLoad(): void {
        this.addListenerBase();
        this.node.getChildByName("selected").active = false;
        this.getComponent(RigidBody).group = TKJWL_Physics_Group.ITEM;
        this.noramlNodes.forEach(node => {
            node.layer = 1 << 30;
            node.children.forEach(child => {
                child.layer = 1 << 30;
            });
        });

        let items:string[] = [
            "item_Kettle2",
            "item_FullKettle",
            "item_GasStove",
            "item_FullKettle2",
            "item_OpenKnob",
            "item_Garbage_2",
            "item_CookingKettle",
            "item_FrozenDumplings",
            "item_CookEndDumplings",
            "item_Table1",
            "item_Table2",
            "item_BeforeEatDumplings_6",
            "item_AfterEatDumplings_7",
        ]
        // let itemType = this.node.name.split("_")[1];
        if(items.includes(this.node.name)){
            this.node.active = false;
        }
    }
    


    protected onLookAt(): void {
        //选中
        this.node.getChildByName("selected").active = true;
        //显示按钮
        let itemType = this.node.name.split("_")[1];
        EventManager.Scene.emit(TKJWL_GameEvents.SHOW_UI_ITEM, itemType);
        this.noramlNodes.forEach(node => {
            node.layer = 1 << 23;
            node.children.forEach(child => {
                child.layer = 1 << 23;
            });
        });
    }

    protected onCanelLookAt(){
        //取消选中
        this.node.getChildByName("selected").active = false;
        this.noramlNodes.forEach(node => {
            node.layer = 1 << 30;
            node.children.forEach(child => {
                child.layer = 1 << 30;
            });
        });
    }



   private updateMaterial(): void {//只有看到新的道具或者取消才执行更新
        if(TKJWL_DataManager.Instance.lookAtItem == this.node){
            this.onLookAt();
        }else{
            this.onCanelLookAt();
        }
    }


    protected Interact(){

    }

    protected HoldItem(){

    }

    protected ReleaseItem(){

    }

    protected OpenFire(){

    }

    protected CloseFire(){

    }

    protected EatItem(){

    }

    protected StandUp(){

    }

    protected SitDown(){

    }


    addListenerBase(){
        this.addListener();
       EventManager.on(TKJWL_GameEvents.UPDATE_LOOKAT_ITEM, this.updateMaterial, this);

        EventManager.on(TKJWL_GameEvents.ITEM_HOLE_ON, this.HoldItem, this);
        EventManager.on(TKJWL_GameEvents.ITEM_RELEASE, this.ReleaseItem, this);
        EventManager.on(TKJWL_GameEvents.ITEM_INTERACT, this.Interact, this);
        EventManager.on(TKJWL_GameEvents.ITEM_OPEN_FIRE, this.OpenFire, this);
        EventManager.on(TKJWL_GameEvents.ITEM_CLOSE_FIRE, this.CloseFire, this);
        EventManager.on(TKJWL_GameEvents.ITEM_EAT, this.EatItem, this);
        EventManager.on(TKJWL_GameEvents.ITEM_STAND_UP, this.StandUp, this);
        EventManager.on(TKJWL_GameEvents.ITEM_SIT_DOWN, this.SitDown, this);

    }

    removeListenerBase(){
        this.removeListener();
        EventManager.off(TKJWL_GameEvents.UPDATE_LOOKAT_ITEM, this.updateMaterial, this);


        EventManager.off(TKJWL_GameEvents.ITEM_HOLE_ON, this.HoldItem, this);
        EventManager.off(TKJWL_GameEvents.ITEM_RELEASE, this.ReleaseItem, this);
        EventManager.off(TKJWL_GameEvents.ITEM_INTERACT, this.Interact, this);
        EventManager.off(TKJWL_GameEvents.ITEM_OPEN_FIRE, this.OpenFire, this);
        EventManager.off(TKJWL_GameEvents.ITEM_CLOSE_FIRE, this.CloseFire, this);
        EventManager.off(TKJWL_GameEvents.ITEM_EAT, this.EatItem, this);
        EventManager.off(TKJWL_GameEvents.ITEM_STAND_UP, this.StandUp, this);
        EventManager.off(TKJWL_GameEvents.ITEM_SIT_DOWN, this.SitDown, this);
    }
    
    protected removeListener(){
       
    }
    protected addListener(){
    }

    protected onDestroy(): void {
        this.removeListenerBase();
    }
}


