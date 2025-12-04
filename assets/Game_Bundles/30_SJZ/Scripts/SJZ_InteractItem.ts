import { _decorator, Component, Sprite, Node, BoxCollider2D, SpriteFrame, Layers, v3, Vec3, view, Collider2D, IPhysics2DContact, Contact2DType } from 'cc';
const { ccclass, property } = _decorator;

import { SJZ_Constant } from './SJZ_Constant';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { SJZ_UIManager } from './UI/SJZ_UIManager';
import { SJZ_DataManager } from './SJZ_DataManager';
import { SJZ_WorkbenchType } from './SJZ_Data';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';

@ccclass('SJZ_InteractItem')
export default class SJZ_InteractItem extends Component {
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
        if (otherCollider.group == SJZ_Constant.Group.Player) {
            switch (this.node.name) {
                case "停机坪":
                    EventManager.Scene.emit(SJZ_Constant.Event.SHOW_INTERACT_BUTTON, true, () => {
                        SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.SelectMapPanel);
                    });
                    break;

                case "NPC_商人":
                    EventManager.Scene.emit(SJZ_Constant.Event.SHOW_INTERACT_BUTTON, true, () => {
                        SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.ShopPanel);
                    });
                    break;

                case "NPC_出售商人":
                    EventManager.Scene.emit(SJZ_Constant.Event.SHOW_INTERACT_BUTTON, true, () => {
                        SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.SellPanel);
                    });
                    break;

                case "NPC_皮肤商人":
                    EventManager.Scene.emit(SJZ_Constant.Event.SHOW_INTERACT_BUTTON, true, () => {
                        SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.SkinShopPanel);
                    });
                    break;

                case "武器台":
                    EventManager.Scene.emit(SJZ_Constant.Event.SHOW_INTERACT_BUTTON, true, () => {

                        SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.WorkbenchPanel, ["武器台：可以制作武器。",
                            {
                                cb: () => {
                                    SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.UpgradePanel, [SJZ_WorkbenchType.Weapon]);
                                },
                                text: "升级"
                            },
                            {
                                cb: () => {
                                    let lv = SJZ_DataManager.PlayerData.GetWorkbenchLv(SJZ_WorkbenchType.Weapon);
                                    if (lv == 0) {
                                        UIManager.ShowTip(`武器台等级为0，无法进行制造。`);
                                    } else {
                                        SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.OutputPanel, [SJZ_WorkbenchType.Weapon]);
                                    }
                                },
                                text: "使用"
                            },
                            {
                                cb: () => {
                                    SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.WorkbenchPanel);
                                },
                                text: "离开"
                            }
                        ]);


                    });
                    break;

                case "护甲台":
                    EventManager.Scene.emit(SJZ_Constant.Event.SHOW_INTERACT_BUTTON, true, () => {

                        SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.WorkbenchPanel, ["护甲台：可以制作护甲。",
                            {
                                cb: () => {
                                    SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.UpgradePanel, [SJZ_WorkbenchType.Armor]);
                                },
                                text: "升级"
                            },
                            {
                                cb: () => {
                                    let lv = SJZ_DataManager.PlayerData.GetWorkbenchLv(SJZ_WorkbenchType.Armor);
                                    if (lv == 0) {
                                        UIManager.ShowTip(`护甲台等级为0，无法进行制造。`);
                                    } else {
                                        SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.OutputPanel, [SJZ_WorkbenchType.Armor]);
                                    }
                                },
                                text: "使用"
                            },
                            {
                                cb: () => {
                                    SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.WorkbenchPanel);
                                },
                                text: "离开"
                            }
                        ]);
                    });
                    break;

                case "子弹台":
                    EventManager.Scene.emit(SJZ_Constant.Event.SHOW_INTERACT_BUTTON, true, () => {
                        let lv = SJZ_DataManager.PlayerData.GetWorkbenchLv(SJZ_WorkbenchType.Ammo);

                        SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.WorkbenchPanel, ["子弹台：可以制作子弹。",
                            {
                                cb: () => {
                                    SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.UpgradePanel, [SJZ_WorkbenchType.Ammo]);
                                },
                                text: "升级"
                            },
                            {
                                cb: () => {
                                    let lv = SJZ_DataManager.PlayerData.GetWorkbenchLv(SJZ_WorkbenchType.Ammo);
                                    if (lv == 0) {
                                        UIManager.ShowTip(`子弹台等级为0，无法进行制造。`);
                                    } else {
                                        SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.OutputPanel, [SJZ_WorkbenchType.Ammo]);
                                    }
                                },
                                text: "使用"
                            },
                            {
                                cb: () => {
                                    SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.WorkbenchPanel);
                                },
                                text: "离开"
                            }
                        ]);
                    });
                    break;

                case "药品台":
                    EventManager.Scene.emit(SJZ_Constant.Event.SHOW_INTERACT_BUTTON, true, () => {
                        let lv = SJZ_DataManager.PlayerData.GetWorkbenchLv(SJZ_WorkbenchType.Medical);

                        SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.WorkbenchPanel, ["药品台：可以制作药品。",
                            {
                                cb: () => {
                                    SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.UpgradePanel, [SJZ_WorkbenchType.Medical]);
                                },
                                text: "升级"
                            },
                            {
                                cb: () => {
                                    let lv = SJZ_DataManager.PlayerData.GetWorkbenchLv(SJZ_WorkbenchType.Medical);
                                    if (lv == 0) {
                                        UIManager.ShowTip(`药品台等级为0，无法进行制造。`);
                                    } else {
                                        SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.OutputPanel, [SJZ_WorkbenchType.Medical]);
                                    }
                                },
                                text: "使用"
                            },
                            {
                                cb: () => {
                                    SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.WorkbenchPanel);
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
        if (otherCollider.group == SJZ_Constant.Group.Player) {
            EventManager.Scene.emit(SJZ_Constant.Event.SHOW_INTERACT_BUTTON, false);
        }
    }

}