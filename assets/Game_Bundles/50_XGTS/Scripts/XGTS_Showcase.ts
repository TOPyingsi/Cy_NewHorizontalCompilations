import { _decorator, Component, Sprite, Node, BoxCollider2D, SpriteFrame, Layers, v3, Vec3, view, Collider2D, IPhysics2DContact, Contact2DType, CCString, Label, tween } from 'cc';
const { ccclass, property } = _decorator;

import NodeUtil from '../../../Scripts/Framework/Utils/NodeUtil';
import { XGTS_Constant } from './XGTS_Constant';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { XGTS_GameManager } from './XGTS_GameManager';
import { EasingType } from 'db://assets/Scripts/Framework/Utils/TweenUtil';
import { XGTS_DataManager } from './XGTS_DataManager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGTS_ItemData } from './XGTS_Data';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';

@ccclass('XGTS_Showcase')
export default class XGTS_Showcase extends Component {
    Label: Label = null;
    Icon: Sprite = null;
    collider: BoxCollider2D | null = null;
    taken: boolean = false;

    data: XGTS_ItemData = null;

    putcallback: Function = null;

    onLoad() {
        this.Label = NodeUtil.GetComponent("Label", this.node, Label);
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);

        this.collider = this.node.getComponent(BoxCollider2D);
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }

    Init(data: XGTS_ItemData) {
        this.data = data;
        this.Label.string = `${data.Name}`;

        this.Icon.spriteFrame = null;
        this.Refresh();

        // BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/${data.ImageId}`).then((sf: SpriteFrame) => {
        //     this.Icon.spriteFrame = sf;
        //     XGTS_GameManager.SetImagePreferScale(this.Icon, 180, 180);
        // });

        // tween(this.Icon.node)
        //     .to(3, { position: new Vec3(0, 10, 0) }, { easing: EasingType.sineOut })
        //     .to(3, { position: new Vec3(0, -50, 0) }, { easing: EasingType.sineIn })
        //     .union() // 合并为一个动作
        //     .repeatForever() // 无限循环
        //     .start();
    }

    Refresh() {
        let playerNum = 0;
        if(XGTS_GameManager.IsDoubleMode){
            playerNum = 1;
        }
        let data = XGTS_DataManager.PlayerDatas[playerNum].ShowcaseData.find(e => e.Name == this.data.Name);
        this.Icon.spriteFrame = null;

        if (data) {
            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/${data.ImageId}`).then((sf: SpriteFrame) => {
                this.Icon.spriteFrame = sf;
                XGTS_GameManager.SetImagePreferScale(this.Icon, 180, 180);
            });

            tween(this.Icon.node)
                .to(3, { position: new Vec3(0, 10, 0) }, { easing: EasingType.sineOut })
                .to(3, { position: new Vec3(0, -50, 0) }, { easing: EasingType.sineIn })
                .union() // 合并为一个动作
                .repeatForever() // 无限循环
                .start();
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == XGTS_Constant.Group.Player) {
            let eventLaseName = ""
            let playerNum = 0;
            if(XGTS_GameManager.IsDoubleMode){
                eventLaseName = "_"+otherCollider.node.name.split("_")[1];
                playerNum = 1;
            }
            
            EventManager.Scene.emit(XGTS_Constant.Event.SHOW_INTERACT_BUTTON + eventLaseName, true, () => {

                //如果展览中有物品，移除该物品添加到仓库里
                let data = XGTS_DataManager.PlayerDatas[playerNum].ShowcaseData.find(e => e.ID == this.data.ID);
                if (data) {
                    XGTS_DataManager.PlayerDatas[playerNum].RemoveItemFromShowcase(data);
                    XGTS_DataManager.PlayerDatas[playerNum].AddItemToInventory(data);
                } else {
                    //如果展览没有，从仓库移除该物品
                    data = XGTS_DataManager.PlayerDatas[playerNum].InventoryItemData.find(e => e.Name == this.data.Name);

                    if (data) {
                        XGTS_DataManager.PlayerDatas[playerNum].RemoveItemFromInventory(data);
                        XGTS_DataManager.PlayerDatas[playerNum].AddItemToShowcase(data);
                        this.putcallback && this.putcallback();
                    } else {
                        UIManager.ShowTip(`仓库里没有找到${this.data.Name}`);
                    }
                }

                this.Refresh();
            });
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == XGTS_Constant.Group.Player) {
            let eventLaseName = ""
            if(XGTS_GameManager.IsDoubleMode){
                eventLaseName = "_"+otherCollider.node.name.split("_")[1];
            }
            
            EventManager.Scene.emit(XGTS_Constant.Event.SHOW_INTERACT_BUTTON + eventLaseName, false);
        }
    }

}