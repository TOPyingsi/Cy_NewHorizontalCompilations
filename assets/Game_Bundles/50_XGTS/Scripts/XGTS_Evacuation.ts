import { _decorator, Component, Sprite, Node, BoxCollider2D, SpriteFrame, Layers, v3, Vec3, view, Collider2D, IPhysics2DContact, Contact2DType, instantiate, Prefab, Enum, CCString } from 'cc';
import { XGTS_Constant } from './XGTS_Constant';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGTS_LvManager } from './XGTS_LvManager';
import { XGTS_DataManager } from './XGTS_DataManager';
import { XGTS_GameManager } from './XGTS_GameManager';
const { ccclass, property } = _decorator;


@ccclass('XGTS_Evacuation')
export default class XGTS_Evacuation extends Component {
    collider: BoxCollider2D | null = null;

    @property(CCString)
    EvacuationSite: string = "";

    onLoad() {
        this.collider = this.node.getComponent(BoxCollider2D);
    }

 onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == XGTS_Constant.Group.Player) {
            XGTS_LvManager.Instance.matchData.EvacuationSite = this.EvacuationSite;
            let tip = "";
            let result = false;
            let playerNum = 0;
                // if(XGTS_GameManager.IsDoubleMode){
                    let result0 = XGTS_DataManager.PlayerDatas[0].GetBackpackItem("摄影机")  ;
                    let result1 = XGTS_DataManager.PlayerDatas[1].GetBackpackItem("摄影机")  ;
                    let result2 = XGTS_DataManager.PlayerDatas[2].GetBackpackItem("摄影机")  ;
                    result = (result0 ||result1 || result2)?true:false;

                //    playerNum = parseInt(otherCollider.node.name.split("_")[1]);
                // }
                // else{
                //     // playerNum = 0;
                // result = XGTS_DataManager.PlayerDatas[playerNum].GetBackpackItem("摄影机")?true:false;

                // }
        
            // XGTS_LvManager.Instance.matchData.EvacuationSite = this.EvacuationSite;
            // let tip = "";
            // let result = XGTS_DataManager.PlayerDatas[playerNum].GetBackpackItem("摄影机") ;
            if (XGTS_LvManager.Instance.MapName == "训练场") {
                if (!result) tip = "还有容器没被搜索";
            }
            EventManager.Scene.emit(XGTS_Constant.Event.SHOW_EVACUATION, tip);
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == XGTS_Constant.Group.Player) {
            EventManager.Scene.emit(XGTS_Constant.Event.HIDE_EVACUATION);
        }
    }

    protected onEnable(): void {
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    protected onDisable(): void {
        this.collider.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.collider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
}