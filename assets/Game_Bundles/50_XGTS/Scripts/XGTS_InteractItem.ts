import { _decorator, Component, Sprite, Node, BoxCollider2D, SpriteFrame, Layers, v3, Vec3, view, Collider2D, IPhysics2DContact, Contact2DType } from 'cc';
const { ccclass, property } = _decorator;

import { XGTS_Constant } from './XGTS_Constant';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { XGTS_UIManager } from './UI/XGTS_UIManager';
import { XGTS_DataManager } from './XGTS_DataManager';
import { XGTS_WorkbenchType } from './XGTS_Data';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { XGTS_GameManager } from './XGTS_GameManager';

@ccclass('XGTS_InteractItem')
export default class XGTS_InteractItem extends Component {
    @property
    generateBox: boolean = false;
    collider: BoxCollider2D | null = null;
    taken: boolean = false;

    onLoad() {
        this.collider = this.node.getComponent(BoxCollider2D);
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        this.collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }


    start() {
        if (this.generateBox) {
            this.Init();
        }
    }

    //自然生成的箱子
    Init() {

    }
    //    //敌人的死亡箱
    InitDieBox(name: string, killedGun, itemDatas) {

    }
    Take() {

    }

    ShowSuppliesItems(active: boolean) {
    }

    ItemCallback(data) { }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == XGTS_Constant.Group.Player) {
            let eventLaseName = "";
            let playerNum = 0;
            if(XGTS_GameManager.IsDoubleMode){
                eventLaseName = "_"+ otherCollider.node.name.split("_")[1];
                playerNum = parseInt(otherCollider.node.name.split("_")[1]);
            }
            switch (this.node.name) {
                case "停机坪":
                    EventManager.Scene.emit(XGTS_Constant.Event.SHOW_INTERACT_BUTTON + eventLaseName, true, () => {
                        XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.SelectMapPanel,[playerNum]);
                    });
                    break;

                case "NPC_商人":
                    EventManager.Scene.emit(XGTS_Constant.Event.SHOW_INTERACT_BUTTON + eventLaseName, true, () => {
                        XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.ShopPanel,[playerNum]);
                    });
                    break;

                case "NPC_出售商人":
                    EventManager.Scene.emit(XGTS_Constant.Event.SHOW_INTERACT_BUTTON + eventLaseName, true, () => {
                        XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.SellPanel,[playerNum]);
                    });
                    break;

                case "NPC_皮肤商人":
                    EventManager.Scene.emit(XGTS_Constant.Event.SHOW_INTERACT_BUTTON + eventLaseName, true, () => {
                        XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.SkinShopPanel,[playerNum]);
                    });
                    break;

                case "武器台":
                    EventManager.Scene.emit(XGTS_Constant.Event.SHOW_INTERACT_BUTTON + eventLaseName, true, () => {

                        XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.WorkbenchPanel, ["武器台：可以制作武器。",
                            {
                                cb: () => {
                                    XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.UpgradePanel, [XGTS_WorkbenchType.Weapon,playerNum]);
                                },
                                text: "升级"
                            },
                            {
                                cb: () => {
                                    let lv = XGTS_DataManager.PlayerDatas[playerNum].GetWorkbenchLv(XGTS_WorkbenchType.Weapon);
                                    if (lv == 0) {
                                        UIManager.ShowTip(`武器台等级为0，无法进行制造。`);
                                    } else {
                                        XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.OutputPanel, [XGTS_WorkbenchType.Weapon,playerNum]);
                                    }
                                },
                                text: "使用"
                            },
                            {
                                cb: () => {
                                    XGTS_UIManager.Instance.HidePanel(XGTS_Constant.Panel.WorkbenchPanel);
                                },
                                text: "离开"
                            }
                        ]);


                    });
                    break;

                case "护甲台":
                    EventManager.Scene.emit(XGTS_Constant.Event.SHOW_INTERACT_BUTTON + eventLaseName, true, () => {

                        XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.WorkbenchPanel, ["护甲台：可以制作护甲。",
                            {
                                cb: () => {
                                    XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.UpgradePanel, [XGTS_WorkbenchType.Armor,playerNum]);
                                },
                                text: "升级"
                            },
                            {
                                cb: () => {
                                    let lv = XGTS_DataManager.PlayerDatas[playerNum].GetWorkbenchLv(XGTS_WorkbenchType.Armor);
                                    if (lv == 0) {
                                        UIManager.ShowTip(`护甲台等级为0，无法进行制造。`);
                                    } else {
                                        XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.OutputPanel, [XGTS_WorkbenchType.Armor,playerNum]);
                                    }
                                },
                                text: "使用"
                            },
                            {
                                cb: () => {
                                    XGTS_UIManager.Instance.HidePanel(XGTS_Constant.Panel.WorkbenchPanel);
                                },
                                text: "离开"
                            }
                        ]);
                    });
                    break;

                case "子弹台":
                    EventManager.Scene.emit(XGTS_Constant.Event.SHOW_INTERACT_BUTTON + eventLaseName, true, () => {
                        let lv = XGTS_DataManager.PlayerDatas[playerNum].GetWorkbenchLv(XGTS_WorkbenchType.Ammo);

                        XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.WorkbenchPanel, ["子弹台：可以制作子弹。",
                            {
                                cb: () => {
                                    XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.UpgradePanel, [XGTS_WorkbenchType.Ammo,playerNum]);
                                },
                                text: "升级"
                            },
                            {
                                cb: () => {
                                    let lv = XGTS_DataManager.PlayerDatas[playerNum].GetWorkbenchLv(XGTS_WorkbenchType.Ammo);
                                    if (lv == 0) {
                                        UIManager.ShowTip(`子弹台等级为0，无法进行制造。`);
                                    } else {
                                        XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.OutputPanel, [XGTS_WorkbenchType.Ammo,playerNum]);
                                    }
                                },
                                text: "使用"
                            },
                            {
                                cb: () => {
                                    XGTS_UIManager.Instance.HidePanel(XGTS_Constant.Panel.WorkbenchPanel);
                                },
                                text: "离开"
                            }
                        ]);
                    });
                    break;

                case "药品台":
                    EventManager.Scene.emit(XGTS_Constant.Event.SHOW_INTERACT_BUTTON + eventLaseName, true, () => {
                        let lv = XGTS_DataManager.PlayerDatas[playerNum].GetWorkbenchLv(XGTS_WorkbenchType.Medical);

                        XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.WorkbenchPanel, ["药品台：可以制作药品。",
                            {
                                cb: () => {
                                    XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.UpgradePanel, [XGTS_WorkbenchType.Medical,playerNum]);
                                },
                                text: "升级"
                            },
                            {
                                cb: () => {
                                    let lv = XGTS_DataManager.PlayerDatas[playerNum].GetWorkbenchLv(XGTS_WorkbenchType.Medical);
                                    if (lv == 0) {
                                        UIManager.ShowTip(`药品台等级为0，无法进行制造。`);
                                    } else {
                                        XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.OutputPanel, [XGTS_WorkbenchType.Medical,playerNum]);
                                    }
                                },
                                text: "使用"
                            },
                            {
                                cb: () => {
                                    XGTS_UIManager.Instance.HidePanel(XGTS_Constant.Panel.WorkbenchPanel);
                                },
                                text: "离开"
                            }
                        ]);
                    });
                    break;

                default:
                    break;
            }
        }
    }

    onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let eventLaseName = "";
        if(XGTS_GameManager.IsDoubleMode){
            eventLaseName = "_"+ otherCollider.node.name.split("_")[1];
        }
        
        if (otherCollider.group == XGTS_Constant.Group.Player) {
            EventManager.Scene.emit(XGTS_Constant.Event.SHOW_INTERACT_BUTTON + eventLaseName, false);
        }
    }

}