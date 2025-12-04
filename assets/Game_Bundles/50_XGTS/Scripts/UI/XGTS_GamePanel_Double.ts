import { _decorator, Component, Node, Label, Sprite, Touch, Event, Color, Tween, SpriteFrame, tween, EventTouch, Layers, v3, director, Prefab, instantiate, find, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { Panel, UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { GameManager } from '../../../../Scripts/GameManager';
import { EventManager } from '../../../../Scripts/Framework/Managers/EventManager';
import XGTS_HPBar from './XGTS_HPBar';
import { XGTS_Constant } from '../XGTS_Constant';
import { XGTS_UIManager } from './XGTS_UIManager';
import { XGTS_DataManager } from '../XGTS_DataManager';
import XGTS_PlayerInventory from './XGTS_PlayerInventory';
import { XGTS_ContainerType, XGTS_ItemData, XGTS_ItemType } from '../XGTS_Data';
import { XGTS_GameManager } from '../XGTS_GameManager';
import XGTS_CommonItem from './XGTS_CommonItem';
import { XGTS_PoolManager } from '../XGTS_PoolManager';
import XGTS_GameItemUI from './XGTS_GameItemUI';
import { XGTS_LvManager } from '../XGTS_LvManager';
import XGTS_CameraController from '../XGTS_CameraController';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { XGTS_Audio, XGTS_AudioManager } from '../XGTS_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import XGTS_ContainerInventory from './XGTS_ContainerInventory';
import { XGTS_LootManager } from '../XGTS_LootManager';

@ccclass('XGTS_GamePanel_Double')
export default class XGTS_GamePanel_Double extends Component {
    public static Instance: XGTS_GamePanel_Double = null;
    InteractButtons: Node[] | null = [];
    Evacuation: Node | null = null;
    EvacuationTitle: Label | null = null;
    EvacuationCountDownLabel: Label | null = null;
    EvacuationBG: Sprite | null = null;
    UseItem: Node | null = null;
    UseItemFill: Sprite | null = null;
    UseItemIcon: Sprite | null = null;
    MapButton: Node | null = null;
    BottomBar: Node | null = null;
    Joystick: Node | null = null;
    ReturnButton: Node | null = null;
    MoreGameButton: Node | null = null;

    BroadcastPosition: Node | null = null;

    // Weapon_0: XGTS_GameItemUI = null;
    // Weapon_1: XGTS_GameItemUI = null;
    // Pistol: XGTS_GameItemUI = null;
    // MeleeWeapon: XGTS_GameItemUI = null;

    ReloadButton: Node | null = null;
    AmmoButton: Node | null = null;
    AmmoScrollView: Node | null = null;//子弹列表

    UseMedicineButton: Node | null = null;
    MedicineButton: Node | null = null;
    MedicineScrollViews: Node[] | null = [];//医药列表

    NormalBar: Node | null = null;

    HPBar: XGTS_HPBar = null;
    mapMode: boolean = false;

    onLoad() {
        XGTS_GamePanel_Double.Instance = this;
        this.InteractButtons = [NodeUtil.GetNode("InteractButton_1", this.node), NodeUtil.GetNode("InteractButton_2", this.node)]
        this.Evacuation = NodeUtil.GetNode("Evacuation", this.node);
        this.EvacuationTitle = NodeUtil.GetComponent("EvacuationTitle", this.node, Label);
        this.EvacuationCountDownLabel = NodeUtil.GetComponent("EvacuationCountDownLabel", this.node, Label);
        this.EvacuationBG = NodeUtil.GetComponent("EvacuationBG", this.node, Sprite);
        this.UseItem = NodeUtil.GetNode("UseItem", this.node);
        this.UseItemFill = NodeUtil.GetComponent("UseItemFill", this.node, Sprite);
        this.UseItemIcon = NodeUtil.GetComponent("UseItemIcon", this.node, Sprite);
        this.MapButton = NodeUtil.GetNode("MapButton", this.node);
        this.BottomBar = NodeUtil.GetNode("BottomBar", this.node);
        this.Joystick = NodeUtil.GetNode("Joystick", this.node);
        this.ReturnButton = NodeUtil.GetNode("ReturnButton", this.node);
        this.MoreGameButton = NodeUtil.GetNode("MoreGameButton", this.node);
        this.BroadcastPosition = NodeUtil.GetNode("BroadcastPosition", this.node);
        this.NormalBar = NodeUtil.GetNode("NormalBar", this.node);

        this.HPBar = NodeUtil.GetComponent("HPBar", this.node, XGTS_HPBar);

        // this.Weapon_0 = NodeUtil.GetComponent("Weapon_0", this.node, XGTS_GameItemUI);
        // this.Weapon_1 = NodeUtil.GetComponent("Weapon_1", this.node, XGTS_GameItemUI);
        // this.Pistol = NodeUtil.GetComponent("Pistol", this.node, XGTS_GameItemUI);
        // this.MeleeWeapon = NodeUtil.GetComponent("MeleeWeapon", this.node, XGTS_GameItemUI);

        this.ReloadButton = NodeUtil.GetNode("ReloadButton", this.node);
        this.AmmoButton = NodeUtil.GetNode("AmmoButton", this.node);
        this.AmmoScrollView = NodeUtil.GetNode("AmmoScrollView", this.node);

        // this.UseMedicineButton = NodeUtil.GetNode("UseMedicineButton", this.node);
        this.MedicineButton = NodeUtil.GetNode("MedicineButton", this.node);
        this.MedicineScrollViews = [NodeUtil.GetNode("MedicineScrollView_1", this.node), NodeUtil.GetNode("MedicineScrollView_2", this.node)];


        this.node.on(Node.EventType.TOUCH_START, this.OnTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.OnTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.OnTouchEnd, this);
    }

    protected onDestroy(): void { }

    protected start(): void {

        // this.RefreshGameItemUI();

        this.ShowInteractButton_1(false);
        this.ShowInteractButton_2(false);

        this.MoreGameButton.active = XGTS_LvManager.Instance.MapName == "特勤处";
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.MoreGameButton);
    }

    interactCallbacks: Function[] = [];

    /**显示交互按钮 */
    ShowInteractButton_1(active: boolean, interactCallback: Function = null) {
        let playerNum = 1;
        if (interactCallback)
            this.interactCallbacks[0] = interactCallback.bind(playerNum);
        this.InteractButtons[playerNum - 1].active = active;
    }


    /**显示交互按钮 */
    ShowInteractButton_2(active: boolean, interactCallback: Function = null) {
        let playerNum = 2;
        if (interactCallback)
            this.interactCallbacks[1] = interactCallback.bind(playerNum);
        this.InteractButtons[playerNum - 1].active = active;
    }

    countDown: number = 5;
    startCount: boolean = false;

    ShowEvacuation(tip: string = "") {
        this.Evacuation.active = true;
        this.EvacuationCountDownLabel.string = ``;

        if (Tools.IsEmptyStr(tip)) {
            this.EvacuationTitle.string = `正在撤离`;
            this.startCount = true;
            this.countDown = 5;
        } else {
            this.EvacuationTitle.string = tip;
        }

        this.EvacuationBG.color = Tools.IsEmptyStr(tip) ? Color.GREEN : Color.RED;
    }

    HideEvacution() {
        this.Evacuation.active = false;
        this.countDown = 5;
        this.startCount = false;
    }

    // RefreshGameItemUI() {
    //     this.Weapon_0.Refresh();
    //     this.Weapon_1.Refresh();
    //     this.Pistol.Refresh();
    //     this.MeleeWeapon.Refresh();
    // }

    // RefreshAmmoCount() {
    //     this.Weapon_0.RefreshAmmoCount();
    //     this.Weapon_1.RefreshAmmoCount();
    //     this.Pistol.RefreshAmmoCount();
    // }

    //#region 药品道具和护甲道具

    medItems: XGTS_CommonItem[] = [];
    medTimer: number = 0;

    //换药菜单
    RefreshMedItems(playerNum: number) {
        this.medItems.forEach(e => XGTS_PoolManager.Instance.Put(e.node));
        this.medItems = [];

        let medData: XGTS_ItemData[] = XGTS_DataManager.PlayerDatas[playerNum].GetBackpackAllItemByType(XGTS_ItemType.MedicalItem);
        medData.push(...XGTS_DataManager.PlayerDatas[playerNum].GetBackpackAllItemByType(XGTS_ItemType.ArmorItem));

        if (medData.length > 0) {
            for (let i = 0; i < medData.length; i++) {
                let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.CommonItem, this.MedicineScrollViews[playerNum - 1].getChildByPath("view/MedicineContent"));
                let item = node.getComponent(XGTS_CommonItem);
                item.Init(medData[i], this.MedCallback.bind(this, playerNum));
                this.medItems.push(item);
            }
        }
    }

    //   Init(data: XGTS_ItemData, callback: Function) {
    //     this.data = data;
    //     this.callback = callback;
    //     this.Button.enabled = true;
    //     this.Refresh();
    // }

    // OnButtonMedClick() {
    //     XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.ButtonClick);

    //     this.callback && this.callback(this.data);
    // }

    MedCallback(playerNum: number, data: XGTS_ItemData) {
        if (data.Type == XGTS_ItemType.MedicalItem) {
            let player = XGTS_GameManager.Instance.players[playerNum - 1];;
            if (player && player.HP < player.MaxHP) {
                this.ShowUseItem(true, data, (data: XGTS_ItemData) => {
                    let addHP = player.MaxHP - player.HP;
                    if (addHP > data.ConsumableData.Durability) {
                        addHP = data.ConsumableData.Durability;
                        XGTS_DataManager.PlayerDatas[playerNum].RemoveItemFromBackpack(data);
                    } else {
                        data.ConsumableData.Durability -= addHP;
                    }

                    this.RefreshMedItems(playerNum);
                    player.HP += addHP;
                });
            } else {
                UIManager.ShowTip("血量已满");
            }
        }

        if (data.Type == XGTS_ItemType.ArmorItem) {
            if (XGTS_DataManager.PlayerDatas[playerNum].Weapon_Helmet != null && data.Name.includes(`头盔`)) {//TODO LCH_换弹药不使用玩家数据
                this.ShowUseItem(true, data, (data: XGTS_ItemData) => {
                    let equip = XGTS_DataManager.PlayerDatas[playerNum].Weapon_Helmet.EquipData;
                    let addDurability = equip.MaxDurability - equip.Durability;

                    if (addDurability > data.ConsumableData.Durability) {
                        addDurability = data.ConsumableData.Durability;
                        XGTS_DataManager.PlayerDatas[playerNum].RemoveItemFromBackpack(data);
                    } else {
                        data.ConsumableData.Durability -= addDurability;
                    }

                    equip.MaxDurability = Math.ceil(equip.MaxDurability - addDurability * (1 - equip.HpMaxLoss));
                    if (equip.Durability + addDurability > equip.MaxDurability) equip.Durability = equip.MaxDurability;
                    else equip.Durability += addDurability;
                    this.RefreshMedItems(playerNum);
                });
            } else if (XGTS_DataManager.PlayerDatas[playerNum].Weapon_BodyArmor != null && data.Name.includes(`护甲`)) {
                this.ShowUseItem(true, data, (data: XGTS_ItemData) => {
                    let equip = XGTS_DataManager.PlayerDatas[playerNum].Weapon_BodyArmor.EquipData;
                    let addDurability = equip.MaxDurability - equip.Durability;

                    if (addDurability > data.ConsumableData.Durability) {
                        addDurability = data.ConsumableData.Durability;
                        XGTS_DataManager.PlayerDatas[playerNum].RemoveItemFromBackpack(data);
                    } else {
                        data.ConsumableData.Durability -= addDurability;
                    }

                    equip.MaxDurability = Math.ceil(equip.MaxDurability - addDurability * (1 - equip.HpMaxLoss));
                    if (equip.Durability + addDurability > equip.MaxDurability) equip.Durability = equip.MaxDurability;
                    else equip.Durability += addDurability;
                    this.RefreshMedItems(playerNum);
                });

            } else {
                UIManager.ShowTip("未装备")
            }
        }
    }

    ShowUseItem(active: boolean, data: XGTS_ItemData = null, cb: Function = null) {
        this.UseItem.active = active;

        if (active) {
            Tween.stopAllByTarget(this.UseItemFill);

            this.UseItemFill.fillRange = 1;

            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/${data.ImageId}`).then((sf: SpriteFrame) => {
                this.UseItemIcon.spriteFrame = sf;
                XGTS_GameManager.SetImagePreferScale(this.UseItemIcon, 180, 180);
            });

            tween(this.UseItemFill).to(data.ConsumableData.CostTime, { fillRange: 0 }).call(() => {
                cb && cb(data);
                this.ShowUseItem(false);
            }).start();
        } else {
            Tween.stopAllByTarget(this.UseItemFill);
        }
    }

    //endregion

    //#region 换弹逻辑

    ammoItems: XGTS_CommonItem[] = [];

    Reload() {
        if (XGTS_GameManager.Instance.player.weapon) {
            const weaponData = XGTS_GameManager.Instance.player.weapon.WeaponData;
            let needCount = weaponData.Clip;

            if (weaponData.Ammo) {
                needCount = weaponData.Clip - weaponData.Ammo.Count
            }

            if (needCount == 0) return;//满子弹不让换

            let ammoData = XGTS_DataManager.PlayerDatas[1].GetAmmoByType(weaponData.AmmoType, needCount);
            if (ammoData) {
                XGTS_GameManager.Instance.player.Reload(() => {
                    if (ammoData.Count > needCount) {
                        ammoData.Count -= needCount;
                    } else {
                        needCount = ammoData.Count;
                    }

                    if (!XGTS_GameManager.Instance.player.weapon.WeaponData.Ammo) {
                        XGTS_GameManager.Instance.player.weapon.WeaponData.Ammo = Tools.Clone(ammoData);
                    }

                    XGTS_GameManager.Instance.player.weapon.WeaponData.Ammo.Count += needCount;
                    EventManager.Scene.emit(XGTS_Constant.Event.REFRESH_WEAON_CONTENT);
                });
            } else {
                UIManager.ShowTip(`没有弹药`);
            }
        } else {
            UIManager.ShowTip(`未装备武器`);
        }
    }

    //换弹菜单
    RefreshAmmoItems() {
        this.ammoItems.forEach(e => XGTS_PoolManager.Instance.Put(e.node));
        this.ammoItems = [];

        let ammoData: XGTS_ItemData[] = XGTS_DataManager.PlayerDatas[1].GetBackpackAllItemByType(XGTS_ItemType.Ammo);

        if (ammoData.length > 0) {
            for (let i = 0; i < ammoData.length; i++) {
                let node = XGTS_PoolManager.Instance.Get(XGTS_Constant.Prefab.CommonItem, this.AmmoScrollView.getChildByPath("view/AmmoContent"));
                let item = node.getComponent(XGTS_CommonItem);
                item.Init(ammoData[i], this.AmmoItemCallback.bind(this));
                this.ammoItems.push(item);
            }
        }
    }

    AmmoItemCallback(data: XGTS_ItemData) {
        let weaponData = XGTS_GameManager.Instance.player.weapon.WeaponData;

        if (weaponData) {
            if (data.AmmoData.Type == weaponData.AmmoType) {
                XGTS_GameManager.Instance.player.Reload(() => {

                    let needCount = weaponData.Clip;

                    if (weaponData.Ammo) {
                        needCount = weaponData.Clip - weaponData.Ammo.Count
                    }

                    if (needCount == 0) return;//满子弹不让换

                    if (data.Count > needCount) {
                        data.Count -= needCount;
                    } else {
                        needCount = data.Count;
                        XGTS_DataManager.PlayerDatas[1].RemoveItemFromBackpack(data);
                        this.RefreshAmmoItems();
                    }

                    if (!XGTS_GameManager.Instance.player.weapon.WeaponData.Ammo) {
                        XGTS_GameManager.Instance.player.weapon.WeaponData.Ammo = Tools.Clone(data);
                    }

                    XGTS_GameManager.Instance.player.weapon.WeaponData.Ammo.Count += needCount;
                    EventManager.Scene.emit(XGTS_Constant.Event.REFRESH_WEAON_CONTENT);
                    this.RefreshAmmoItems();
                });
            } else {
                UIManager.ShowTip("换弹失败");
            }
        } else {
            UIManager.ShowTip("换弹失败");
        }
    }

    //#endregion

    RefreshHPBar(value: number) {
        this.HPBar.Set(value);
    }

    protected update(dt: number): void {
        if (this.startCount) {
            this.countDown -= dt;
            if (this.countDown <= 0) {
                this.countDown = 0;
                this.startCount = false;

                XGTS_LvManager.Instance.matchData.Reward = XGTS_DataManager.PlayerDatas[1].GetTotalValue();
                XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.GameOverPanel, [true, XGTS_LvManager.Instance.matchData]);
            }
            this.EvacuationCountDownLabel.string = `${this.countDown.toFixed(2)}`;
        }
    }

    touchs: Touch[] = [];

    OnTouchStart(event: Touch) {
        if (!this.mapMode) return;
        // if (!this.touchs.find(e => e == event)) {
        //     this.touchs.push(event);
        // }
    }

    OnTouchMove(event: Touch) {
        if (!this.mapMode) return;
        XGTS_CameraController.Instance.Move(v3(event.getDelta().clone().x, event.getDelta().clone().y));

        // if (this.touchs.length == 1) {
        // }

        // if (this.touchs.length >= 2) {
        //     return;
        //     let gap_0 = this.touchs[this.touchs.length - 1].getStartLocation().clone().subtract(this.touchs[this.touchs.length - 2].getStartLocation().clone()).length();
        //     let gap_1 = this.touchs[this.touchs.length - 1].getLocation().clone().subtract(this.touchs[this.touchs.length - 2].getLocation().clone()).length();
        //     let len = gap_1 - gap_0;
        //     let ratio = len * 0.00005 + CameraController.Instance.camera.orthoHeight;
        //     ratio = ZTool_Mtr.Clamp(ratio, 0.2, 1);
        //     CameraController.Instance.camera.orthoHeight = ratio;
        // }
    }
    OnTouchEnd(event: Touch) {
        if (!this.mapMode) return;
        // this.touchs = this.touchs.filter(e => e != event);
    }

    OnMapButtonClick() {
        this.mapMode = !this.mapMode;
        this.BottomBar.active = !this.mapMode;
        this.Joystick.active = !this.mapMode;

        if (this.mapMode) {
            XGTS_CameraController.Instance.stopFollow = true;
            XGTS_CameraController.Instance.ZoomOut(2000, () => { });
        } else {
            this.touchs = [];
            XGTS_CameraController.Instance.stopFollow = false;
            XGTS_CameraController.Instance.ZoomIn();
        }
    }

    OnBackpackButtonClick(playerNum: number) {
        if (XGTS_LvManager.Instance.MapName == "特勤处") {
            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `UI/PlayerInventory`).then((prefab: Prefab) => {
                const spawnInverntory = (parent: Node) => {
                    let node = instantiate(prefab);
                    node.setParent(parent);
                    node.setPosition(Vec3.ZERO);
                    let inventory = node.getComponent(XGTS_PlayerInventory)
                    inventory.InitPlayerInventory();
                    return inventory;
                }

                if (XGTS_GameManager.IsDoubleMode) {
                    XGTS_GameManager.currentBackpackNum = playerNum;
                    XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.InventoryPanel_Double, [spawnInverntory, playerNum]);
                }
                else {
                    XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.InventoryPanel, [spawnInverntory]);
                }
            });
        } else {
            if (XGTS_GameManager.IsDoubleMode) {
                if (playerNum == 1) {
                    XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.InventoryPanel_Left, [null, playerNum]);
                }
                else {
                    XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.InventoryPanel_Right, [null, playerNum]);
                }

            }
            else {
                XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.InventoryPanel, [null]);//TODO LCH_双人背包
            }

        }
    }

    OnButtonClick(event: Event) {
        XGTS_AudioManager.Instance.PlaySFX(XGTS_Audio.ButtonClick);

        switch (event.target.name) {
            case "InteractButton_1":
                this.interactCallbacks[0] && this.interactCallbacks[0]();
                break;
            case "InteractButton_2":
                this.interactCallbacks[1] && this.interactCallbacks[1]();
                break;
            // case "Weapon_0":
            //     if (XGTS_DataManager.PlayerDatas[1].Weapon_Primary) {
            //         XGTS_GameManager.Instance.player.SetGun(XGTS_DataManager.PlayerDatas[1].Weapon_Primary);
            //     }
            //     break;
            // case "Weapon_1":
            //     if (XGTS_DataManager.PlayerDatas[1].Weapon_Secondary) {
            //         XGTS_GameManager.Instance.player.SetGun(XGTS_DataManager.PlayerDatas[1].Weapon_Secondary);
            //     }
            //     break;
            // case "Pistol":
            //     if (XGTS_DataManager.PlayerDatas[1].Weapon_Pistol) {
            //         XGTS_GameManager.Instance.player.SetGun(XGTS_DataManager.PlayerDatas[1].Weapon_Pistol);
            //     }
            //     break;
            // case "MeleeWeapon":
            //     XGTS_GameManager.Instance.player.SetMeelee();
            //     break;

            // case "MedicineButton":
            case "UseMedicineButton_1":
                this.MedicineScrollViews[0].active = !this.MedicineScrollViews[0].active;

                if (this.MedicineScrollViews[0].active) {
                    this.RefreshMedItems(1);
                }

                //this.MedicineButton.getChildByName("MedicineButtonIcon").setScale(this.MedicineScrollViews[0].active ? 0.4 : -0.4, 0.4, 1);
                break;
            case "UseMedicineButton_2":
                this.MedicineScrollViews[1].active = !this.MedicineScrollViews[1].active;

                if (this.MedicineScrollViews[1].active) {
                    this.RefreshMedItems(2);
                }

                //this.MedicineButton.getChildByName("MedicineButtonIcon").setScale(this.MedicineScrollViews[1].active ? 0.4 : -0.4, 0.4, 1);
                break;
            // case "ReloadButton":
            //     this.Reload();
            //     break;
            // case "AmmoButton":
            //     this.AmmoScrollView.active = !this.AmmoScrollView.active;

            //     if (this.AmmoScrollView.active) {
            //         this.RefreshAmmoItems();
            //     }

            //     this.AmmoButton.getChildByName("AmmoButtonIcon").setScale(this.AmmoScrollView.active ? 0.4 : -0.4, 0.4, 1);
            //     break;
            case "BackpackButton_1":
                this.OnBackpackButtonClick(1)
                break;
            case "BackpackButton_2"://TODO 双人背包区分
                this.OnBackpackButtonClick(2)
                break;
            case "UseItemCancelButton":
                this.ShowUseItem(false, null, null);
                break;
            case "ReturnButton":
                // let type = XGTS_ContainerType.BirdNest;
                // let data = Tools.Clone(XGTS_DataManager.ContainerData.find(e => e.Type == type));
                // data.ItemData = XGTS_LootManager.GetContainerResult(type);
                // const showPanel = () => {
                //     BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `UI/ContainerInventory`).then((prefab: Prefab) => {
                //         const spawnInverntory = (parent: Node) => {
                //             let node = instantiate(prefab);
                //             node.setParent(parent);
                //             node.setPosition(Vec3.ZERO);
                //             let inventory = node.getComponent(XGTS_ContainerInventory);
                //             inventory.InitContainer(data);
                //             return inventory;
                //         }

                //         XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.InventoryPanel, [spawnInverntory]);
                //     });
                // }

                // showPanel();

                if (director.getScene().name == "XGTS_Start" || director.getScene().name == "XGTS_Tutorial") {
                    ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                        UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                            ProjectEventManager.emit(ProjectEvent.返回主页, "修狗逃生");
                        });
                    });
                } else {
                    XGTS_UIManager.Instance.ShowPanel(XGTS_Constant.Panel.ExitPanel);
                }
                break;

        }
    }

    protected onEnable(): void {
        EventManager.Scene.on(XGTS_Constant.Event.SHOW_INTERACT_BUTTON_1, this.ShowInteractButton_1, this);
        EventManager.Scene.on(XGTS_Constant.Event.SHOW_INTERACT_BUTTON_2, this.ShowInteractButton_2, this);

        EventManager.Scene.on(XGTS_Constant.Event.SHOW_EVACUATION, this.ShowEvacuation, this);
        EventManager.Scene.on(XGTS_Constant.Event.HIDE_EVACUATION, this.HideEvacution, this);
        // EventManager.Scene.on(XGTS_Constant.Event.REFRESH_GAME_ITEM_UI, this.RefreshGameItemUI, this);
        // EventManager.Scene.on(XGTS_Constant.Event.REFRESH_WEAON_CONTENT, this.RefreshAmmoCount, this);
    }

    protected onDisable(): void {
        EventManager.Scene.off(XGTS_Constant.Event.SHOW_INTERACT_BUTTON_1, this.ShowInteractButton_1, this);
        EventManager.Scene.off(XGTS_Constant.Event.SHOW_INTERACT_BUTTON_2, this.ShowInteractButton_2, this);

        EventManager.Scene.off(XGTS_Constant.Event.SHOW_EVACUATION, this.ShowEvacuation, this);
        EventManager.Scene.off(XGTS_Constant.Event.HIDE_EVACUATION, this.HideEvacution, this);
        // EventManager.Scene.off(XGTS_Constant.Event.REFRESH_GAME_ITEM_UI, this.RefreshGameItemUI, this);
        // EventManager.Scene.off(XGTS_Constant.Event.REFRESH_WEAON_CONTENT, this.RefreshAmmoCount, this);
    }
}