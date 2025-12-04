import { _decorator, Component, Node, Label, Sprite, Touch, Event, Color, Tween, SpriteFrame, tween, EventTouch, Layers, v3, director, Prefab, instantiate, find, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import { Panel, UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { GameManager } from '../../../../Scripts/GameManager';
import { EventManager } from '../../../../Scripts/Framework/Managers/EventManager';
import SJZ_HPBar from './SJZ_HPBar';
import { SJZ_Constant } from '../SJZ_Constant';
import { SJZ_UIManager } from './SJZ_UIManager';
import { SJZ_DataManager } from '../SJZ_DataManager';
import SJZ_PlayerInventory from './SJZ_PlayerInventory';
import { SJZ_ContainerType, SJZ_ItemData, SJZ_ItemType } from '../SJZ_Data';
import { SJZ_GameManager } from '../SJZ_GameManager';
import SJZ_CommonItem from './SJZ_CommonItem';
import { SJZ_PoolManager } from '../SJZ_PoolManager';
import SJZ_GameItemUI from './SJZ_GameItemUI';
import { SJZ_LvManager } from '../SJZ_LvManager';
import SJZ_CameraController from '../SJZ_CameraController';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { SJZ_Audio, SJZ_AudioManager } from '../SJZ_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

@ccclass('SJZ_GamePanel')
export default class SJZ_GamePanel extends Component {
    public static Instance: SJZ_GamePanel = null;
    InteractButton: Node | null = null;
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

    Weapon_0: SJZ_GameItemUI = null;
    Weapon_1: SJZ_GameItemUI = null;
    Pistol: SJZ_GameItemUI = null;
    MeleeWeapon: SJZ_GameItemUI = null;

    ReloadButton: Node | null = null;
    AmmoButton: Node | null = null;
    AmmoScrollView: Node | null = null;//子弹列表

    UseMedicineButton: Node | null = null;
    MedicineButton: Node | null = null;
    MedicineScrollView: Node | null = null;//医药列表

    NormalBar: Node | null = null;

    HPBar: SJZ_HPBar = null;
    mapMode: boolean = false;

    onLoad() {
        SJZ_GamePanel.Instance = this;
        this.InteractButton = NodeUtil.GetNode("InteractButton", this.node);
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

        this.HPBar = NodeUtil.GetComponent("HPBar", this.node, SJZ_HPBar);

        this.Weapon_0 = NodeUtil.GetComponent("Weapon_0", this.node, SJZ_GameItemUI);
        this.Weapon_1 = NodeUtil.GetComponent("Weapon_1", this.node, SJZ_GameItemUI);
        this.Pistol = NodeUtil.GetComponent("Pistol", this.node, SJZ_GameItemUI);
        this.MeleeWeapon = NodeUtil.GetComponent("MeleeWeapon", this.node, SJZ_GameItemUI);

        this.ReloadButton = NodeUtil.GetNode("ReloadButton", this.node);
        this.AmmoButton = NodeUtil.GetNode("AmmoButton", this.node);
        this.AmmoScrollView = NodeUtil.GetNode("AmmoScrollView", this.node);

        this.UseMedicineButton = NodeUtil.GetNode("UseMedicineButton", this.node);
        this.MedicineButton = NodeUtil.GetNode("MedicineButton", this.node);
        this.MedicineScrollView = NodeUtil.GetNode("MedicineScrollView", this.node);

        this.node.on(Node.EventType.TOUCH_START, this.OnTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.OnTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.OnTouchEnd, this);
    }

    protected onDestroy(): void { }

    protected start(): void {
        this.HPBar.Init(Color.WHITE);

        this.RefreshGameItemUI();

        this.ShowInteractButton(false);

        this.MoreGameButton.active = SJZ_LvManager.Instance.MapName == "特勤处";
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.MoreGameButton);
    }

    interactCallback: Function = null;

    /**显示交互按钮 */
    ShowInteractButton(active: boolean, interactCallback: Function = null) {
        this.interactCallback = interactCallback;
        this.InteractButton.active = active;
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

    RefreshGameItemUI() {
        this.Weapon_0.Refresh();
        this.Weapon_1.Refresh();
        this.Pistol.Refresh();
        this.MeleeWeapon.Refresh();
    }

    RefreshAmmoCount() {
        this.Weapon_0.RefreshAmmoCount();
        this.Weapon_1.RefreshAmmoCount();
        this.Pistol.RefreshAmmoCount();
    }

    //#region 药品道具和护甲道具

    medItems: SJZ_CommonItem[] = [];
    medTimer: number = 0;

    //换药菜单
    RefreshMedItems() {
        this.medItems.forEach(e => SJZ_PoolManager.Instance.Put(e.node));
        this.medItems = [];

        let medData: SJZ_ItemData[] = SJZ_DataManager.PlayerData.GetBackpackAllItemByType(SJZ_ItemType.MedicalItem);
        medData.push(...SJZ_DataManager.PlayerData.GetBackpackAllItemByType(SJZ_ItemType.ArmorItem));

        if (medData.length > 0) {
            for (let i = 0; i < medData.length; i++) {
                let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.CommonItem, this.MedicineScrollView.getChildByPath("view/MedicineContent"));
                let item = node.getComponent(SJZ_CommonItem);
                item.Init(medData[i], this.MedCallback.bind(this));
                this.medItems.push(item);
            }
        }
    }

    MedCallback(data: SJZ_ItemData) {
        if (data.Type == SJZ_ItemType.MedicalItem) {
            let player = SJZ_GameManager.Instance.player;
            if (player && player.HP < player.MaxHP) {
                this.ShowUseItem(true, data, (data: SJZ_ItemData) => {
                    let addHP = player.MaxHP - player.HP;
                    if (addHP > data.ConsumableData.Durability) {
                        addHP = data.ConsumableData.Durability;
                        SJZ_DataManager.PlayerData.RemoveItemFromBackpack(data);
                    } else {
                        data.ConsumableData.Durability -= addHP;
                    }

                    this.RefreshMedItems();
                    player.HP += addHP;
                });
            } else {
                UIManager.ShowTip("血量已满");
            }
        }

        if (data.Type == SJZ_ItemType.ArmorItem) {
            if (SJZ_DataManager.PlayerData.Weapon_Helmet != null && data.Name.includes(`头盔`)) {
                this.ShowUseItem(true, data, (data: SJZ_ItemData) => {
                    let equip = SJZ_DataManager.PlayerData.Weapon_Helmet.EquipData;
                    let addDurability = equip.MaxDurability - equip.Durability;

                    if (addDurability > data.ConsumableData.Durability) {
                        addDurability = data.ConsumableData.Durability;
                        SJZ_DataManager.PlayerData.RemoveItemFromBackpack(data);
                    } else {
                        data.ConsumableData.Durability -= addDurability;
                    }

                    equip.MaxDurability = Math.ceil(equip.MaxDurability - addDurability * (1 - equip.HpMaxLoss));
                    if (equip.Durability + addDurability > equip.MaxDurability) equip.Durability = equip.MaxDurability;
                    else equip.Durability += addDurability;
                    this.RefreshMedItems();
                });
            } else if (SJZ_DataManager.PlayerData.Weapon_BodyArmor != null && data.Name.includes(`护甲`)) {
                this.ShowUseItem(true, data, (data: SJZ_ItemData) => {
                    let equip = SJZ_DataManager.PlayerData.Weapon_BodyArmor.EquipData;
                    let addDurability = equip.MaxDurability - equip.Durability;

                    if (addDurability > data.ConsumableData.Durability) {
                        addDurability = data.ConsumableData.Durability;
                        SJZ_DataManager.PlayerData.RemoveItemFromBackpack(data);
                    } else {
                        data.ConsumableData.Durability -= addDurability;
                    }

                    equip.MaxDurability = Math.ceil(equip.MaxDurability - addDurability * (1 - equip.HpMaxLoss));
                    if (equip.Durability + addDurability > equip.MaxDurability) equip.Durability = equip.MaxDurability;
                    else equip.Durability += addDurability;
                    this.RefreshMedItems();
                });
            } else {
                UIManager.ShowTip("未装备")
            }
        }
    }

    ShowUseItem(active: boolean, data: SJZ_ItemData = null, cb: Function = null) {
        this.UseItem.active = active;

        if (active) {
            Tween.stopAllByTarget(this.UseItemFill);

            this.UseItemFill.fillRange = 1;

            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/${data.ImageId}`).then((sf: SpriteFrame) => {
                this.UseItemIcon.spriteFrame = sf;
                SJZ_GameManager.SetImagePreferScale(this.UseItemIcon, 180, 180);
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

    ammoItems: SJZ_CommonItem[] = [];

    Reload() {
        if (SJZ_GameManager.Instance.player.weapon) {
            const weaponData = SJZ_GameManager.Instance.player.weapon.WeaponData;
            let needCount = weaponData.Clip;

            if (weaponData.Ammo) {
                needCount = weaponData.Clip - weaponData.Ammo.Count
            }

            if (needCount == 0) return;//满子弹不让换

            let ammoData = SJZ_DataManager.PlayerData.GetAmmoByType(weaponData.AmmoType, needCount);
            if (ammoData) {
                SJZ_GameManager.Instance.player.Reload(() => {
                    if (ammoData.Count > needCount) {
                        ammoData.Count -= needCount;
                    } else {
                        needCount = ammoData.Count;
                    }

                    if (!SJZ_GameManager.Instance.player.weapon.WeaponData.Ammo) {
                        SJZ_GameManager.Instance.player.weapon.WeaponData.Ammo = Tools.Clone(ammoData);
                    }

                    SJZ_GameManager.Instance.player.weapon.WeaponData.Ammo.Count += needCount;
                    EventManager.Scene.emit(SJZ_Constant.Event.REFRESH_WEAON_CONTENT);
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
        this.ammoItems.forEach(e => SJZ_PoolManager.Instance.Put(e.node));
        this.ammoItems = [];

        let ammoData: SJZ_ItemData[] = SJZ_DataManager.PlayerData.GetBackpackAllItemByType(SJZ_ItemType.Ammo);

        if (ammoData.length > 0) {
            for (let i = 0; i < ammoData.length; i++) {
                let node = SJZ_PoolManager.Instance.Get(SJZ_Constant.Prefab.CommonItem, this.AmmoScrollView.getChildByPath("view/AmmoContent"));
                let item = node.getComponent(SJZ_CommonItem);
                item.Init(ammoData[i], this.AmmoItemCallback.bind(this));
                this.ammoItems.push(item);
            }
        }
    }

    AmmoItemCallback(data: SJZ_ItemData) {
        let weaponData = SJZ_GameManager.Instance.player.weapon.WeaponData;

        if (weaponData) {
            if (data.AmmoData.Type == weaponData.AmmoType) {
                SJZ_GameManager.Instance.player.Reload(() => {

                    let needCount = weaponData.Clip;

                    if (weaponData.Ammo) {
                        needCount = weaponData.Clip - weaponData.Ammo.Count
                    }

                    if (needCount == 0) return;//满子弹不让换

                    if (data.Count > needCount) {
                        data.Count -= needCount;
                    } else {
                        needCount = data.Count;
                        SJZ_DataManager.PlayerData.RemoveItemFromBackpack(data);
                        this.RefreshAmmoItems();
                    }

                    if (!SJZ_GameManager.Instance.player.weapon.WeaponData.Ammo) {
                        SJZ_GameManager.Instance.player.weapon.WeaponData.Ammo = Tools.Clone(data);
                    }

                    SJZ_GameManager.Instance.player.weapon.WeaponData.Ammo.Count += needCount;
                    EventManager.Scene.emit(SJZ_Constant.Event.REFRESH_WEAON_CONTENT);
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

                SJZ_LvManager.Instance.matchData.Reward = SJZ_DataManager.PlayerData.GetTotalValue();
                SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.GameOverPanel, [true, SJZ_LvManager.Instance.matchData]);
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
        SJZ_CameraController.Instance.Move(v3(event.getDelta().clone().x, event.getDelta().clone().y));

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
            SJZ_CameraController.Instance.stopFollow = true;
            SJZ_CameraController.Instance.ZoomOut(2000, () => { });
        } else {
            this.touchs = [];
            SJZ_CameraController.Instance.stopFollow = false;
            SJZ_CameraController.Instance.ZoomIn();
        }
    }

    OnButtonClick(event: Event) {
        SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.ButtonClick);

        switch (event.target.name) {
            case "InteractButton":
                this.interactCallback && this.interactCallback();
                break;
            case "RollButton":
                EventManager.Scene.emit(SJZ_Constant.Event.Roll);
                break;
            case "Weapon_0":
                if (SJZ_DataManager.PlayerData.Weapon_Primary) {
                    SJZ_GameManager.Instance.player.SetGun(SJZ_DataManager.PlayerData.Weapon_Primary);
                }
                break;
            case "Weapon_1":
                if (SJZ_DataManager.PlayerData.Weapon_Secondary) {
                    SJZ_GameManager.Instance.player.SetGun(SJZ_DataManager.PlayerData.Weapon_Secondary);
                }
                break;
            case "Pistol":
                if (SJZ_DataManager.PlayerData.Weapon_Pistol) {
                    SJZ_GameManager.Instance.player.SetGun(SJZ_DataManager.PlayerData.Weapon_Pistol);
                }
                break;
            case "MeleeWeapon":
                SJZ_GameManager.Instance.player.SetMeelee();
                break;

            case "MedicineButton":
            case "UseMedicineButton":
                this.MedicineScrollView.active = !this.MedicineScrollView.active;

                if (this.MedicineScrollView.active) {
                    this.RefreshMedItems();
                }

                this.MedicineButton.getChildByName("MedicineButtonIcon").setScale(this.MedicineScrollView.active ? 0.4 : -0.4, 0.4, 1);
                break;

            case "ReloadButton":
                this.Reload();
                break;
            case "AmmoButton":
                this.AmmoScrollView.active = !this.AmmoScrollView.active;

                if (this.AmmoScrollView.active) {
                    this.RefreshAmmoItems();
                }

                this.AmmoButton.getChildByName("AmmoButtonIcon").setScale(this.AmmoScrollView.active ? 0.4 : -0.4, 0.4, 1);
                break;
            case "BackpackButton":
                if (SJZ_LvManager.Instance.MapName == "特勤处") {
                    BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `UI/PlayerInventory`).then((prefab: Prefab) => {
                        const spawnInventory = (parent: Node) => {
                            let node = instantiate(prefab);
                            node.setParent(parent);
                            node.setPosition(Vec3.ZERO);
                            let inventory = node.getComponent(SJZ_PlayerInventory);
                            inventory.InitPlayerInventory();
                            return inventory;
                        }

                        SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.InventoryPanel, [spawnInventory]);
                    });
                } else {
                    SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.InventoryPanel, [null]);
                }
                break;
            case "UseItemCancelButton":
                this.ShowUseItem(false, null, null);
                break;
            case "ReturnButton":
                // let type = SJZ_ContainerType.BirdNest;
                // let data = Tools.Clone(SJZ_DataManager.ContainerData.find(e => e.Type == type));
                // data.ItemData = SJZ_LootManager.GetContainerResult(type);
                // const showPanel = () => {
                //     BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `UI/ContainerInventory`).then((prefab: Prefab) => {
                //         const spawnInverntory = (parent: Node) => {
                //             let node = instantiate(prefab);
                //             node.setParent(parent);
                //             node.setPosition(Vec3.ZERO);
                //             let inventory = node.getComponent(SJZ_ContainerInventory);
                //             inventory.InitContainer(data);
                //             return inventory;
                //         }

                //         SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.InventoryPanel, [spawnInverntory]);
                //     });
                // }

                // showPanel();

                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                        ProjectEventManager.emit(ProjectEvent.返回主页, "三角洲");
                    });
                });
                break;

        }
    }

    protected onEnable(): void {
        EventManager.Scene.on(SJZ_Constant.Event.SHOW_INTERACT_BUTTON, this.ShowInteractButton, this);
        EventManager.Scene.on(SJZ_Constant.Event.SHOW_EVACUATION, this.ShowEvacuation, this);
        EventManager.Scene.on(SJZ_Constant.Event.HIDE_EVACUATION, this.HideEvacution, this);
        EventManager.Scene.on(SJZ_Constant.Event.REFRESH_GAME_ITEM_UI, this.RefreshGameItemUI, this);
        EventManager.Scene.on(SJZ_Constant.Event.REFRESH_WEAON_CONTENT, this.RefreshAmmoCount, this);
    }

    protected onDisable(): void {
        EventManager.Scene.off(SJZ_Constant.Event.SHOW_INTERACT_BUTTON, this.ShowInteractButton, this);
        EventManager.Scene.off(SJZ_Constant.Event.SHOW_EVACUATION, this.ShowEvacuation, this);
        EventManager.Scene.off(SJZ_Constant.Event.HIDE_EVACUATION, this.HideEvacution, this);
        EventManager.Scene.off(SJZ_Constant.Event.REFRESH_GAME_ITEM_UI, this.RefreshGameItemUI, this);
        EventManager.Scene.off(SJZ_Constant.Event.REFRESH_WEAON_CONTENT, this.RefreshAmmoCount, this);
    }
}