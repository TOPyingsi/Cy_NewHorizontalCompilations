import { _decorator, Component, Node, Label, Sprite, Touch, Event, Color, Tween, SpriteFrame, tween, EventTouch, Layers, v3, director } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_CameraController from "../XGTW_CameraController";
import XGTW_DroppedItem from "../XGTW_DroppedItem";
import XGTW_Supplies from "../XGTW_Supplies";
import XGTW_GameItemUI from "./XGTW_GameItemUI";
import XGTW_HPBar from "./XGTW_HPBar";
import { InventoryType } from "./XGTW_InventoryPanel";
import XGTW_SItem from "./XGTW_SItem";
import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import { XGTW_ItemType, XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import XGTW_GameManager, { GameMode } from '../XGTW_GameManager';
import { Panel, UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import UI_SkillCooldown from '../../../../Scripts/Framework/UI/UI_SkillCooldown';
import { GameManager } from '../../../../Scripts/GameManager';
import { EventManager } from '../../../../Scripts/Framework/Managers/EventManager';
import { XGTW_Event } from '../Framework/Managers/XGTW_Event';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { XGTW_ItemData } from '../Datas/XGTW_Data';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

@ccclass('XGTW_GamePanel')
export default class XGTW_GamePanel extends Component {
    public static Instance: XGTW_GamePanel = null;
    TakeSuppliesButton: Node | null = null;
    Evacuation: Node | null = null;
    TakeSuppliesButtonLabel: Label | null = null;
    EvacuationCountDownLabel: Label | null = null;
    Weapon_0: XGTW_GameItemUI = null;
    Weapon_1: XGTW_GameItemUI = null;
    Pistol: XGTW_GameItemUI = null;
    MeleeWeapon: XGTW_GameItemUI = null;
    UseItem: Node | null = null;
    UseItemFill: Sprite | null = null;
    UseItemIcon: Sprite | null = null;
    MapButton: Node | null = null;
    TeamScore: Node | null = null;
    RedTeamScoreLabel: Label | null = null;
    BlueTeamScoreLabel: Label | null = null;
    BottomBar: Node | null = null;
    Joystick: Node | null = null;
    ReturnButton: Node | null = null;
    Medicine: Node | null = null;
    Medicine_0: Node | null = null;
    Medicine_1: Node | null = null;
    Medicines: Node | null = null;
    ReloadButton: Node | null = null;
    BroadcastPosition: Node | null = null;

    NormalBar: Node | null = null;
    JJBar: Node | null = null;
    JJBarBulletCountLb: Label | null = null;
    JJBarMissileItems: Node | null = null;
    Left_JJ: Node | null = null;

    HPBar: XGTW_HPBar = null;
    mapMode: boolean = false;

    onLoad() {
        XGTW_GamePanel.Instance = this;
        this.TakeSuppliesButton = NodeUtil.GetNode("TakeSuppliesButton", this.node);
        this.Evacuation = NodeUtil.GetNode("Evacuation", this.node);
        this.TakeSuppliesButtonLabel = NodeUtil.GetComponent("TakeSuppliesButtonLabel", this.node, Label);
        this.HPBar = NodeUtil.GetComponent("HPBar", this.node, XGTW_HPBar);
        this.Weapon_0 = NodeUtil.GetComponent("Weapon_0", this.node, XGTW_GameItemUI);
        this.Weapon_1 = NodeUtil.GetComponent("Weapon_1", this.node, XGTW_GameItemUI);
        this.Pistol = NodeUtil.GetComponent("Pistol", this.node, XGTW_GameItemUI);
        this.MeleeWeapon = NodeUtil.GetComponent("MeleeWeapon", this.node, XGTW_GameItemUI);
        this.EvacuationCountDownLabel = NodeUtil.GetComponent("EvacuationCountDownLabel", this.node, Label);
        this.UseItem = NodeUtil.GetNode("UseItem", this.node);
        this.UseItemFill = NodeUtil.GetComponent("UseItemFill", this.node, Sprite);
        this.UseItemIcon = NodeUtil.GetComponent("UseItemIcon", this.node, Sprite);
        this.TeamScore = NodeUtil.GetNode("TeamScore", this.node);
        this.RedTeamScoreLabel = NodeUtil.GetComponent("RedTeamScoreLabel", this.node, Label);
        this.BlueTeamScoreLabel = NodeUtil.GetComponent("BlueTeamScoreLabel", this.node, Label);
        this.MapButton = NodeUtil.GetNode("MapButton", this.node);
        this.BottomBar = NodeUtil.GetNode("BottomBar", this.node);
        this.Joystick = NodeUtil.GetNode("Joystick", this.node);
        this.ReturnButton = NodeUtil.GetNode("ReturnButton", this.node);
        this.ReloadButton = NodeUtil.GetNode("ReloadButton", this.node);
        this.BroadcastPosition = NodeUtil.GetNode("BroadcastPosition", this.node);

        this.NormalBar = NodeUtil.GetNode("NormalBar", this.node);
        this.JJBar = NodeUtil.GetNode("JJBar", this.node);
        this.JJBarMissileItems = NodeUtil.GetNode("JJBarMissileItems", this.node);
        this.Left_JJ = NodeUtil.GetNode("Left_JJ", this.node);
        this.JJBarBulletCountLb = NodeUtil.GetComponent("JJBarBulletCountLb", this.node, Label);

        this.Medicine = NodeUtil.GetNode("Medicine", this.node);
        this.Medicine_0 = NodeUtil.GetNode("Medicine_0", this.node);
        this.Medicine_1 = NodeUtil.GetNode("Medicine_1", this.node);
        this.Medicines = NodeUtil.GetNode("Medicines", this.node);

        this.Weapon_0.Set(InventoryType.Weapon_0);
        this.Weapon_1.Set(InventoryType.Weapon_1);
        this.Pistol.Set(InventoryType.Pistol);
        this.MeleeWeapon.Set(InventoryType.MeleeWeapon);
        // AudioManager.PlayNormalBGM(XGTW_Constant.Audio.BG2);
        this.MapButton.on(Node.EventType.TOUCH_START, () => { EventManager.Scene.emit(XGTW_Event.CameraZoomOut, 0.2); }, this);
        this.MapButton.on(Node.EventType.TOUCH_END, () => { EventManager.Scene.emit(XGTW_Event.CameraZoomIn); }, this);
        this.MapButton.on(Node.EventType.TOUCH_CANCEL, () => { EventManager.Scene.emit(XGTW_Event.CameraZoomIn); }, this);

        this.node.on(Node.EventType.TOUCH_START, this.OnTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.OnTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.OnTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.OnTouchEnd, this);

        this.MapButton.active = XGTW_GameManager.GameMode == GameMode.ESCAPE;
        this.ReturnButton.active = XGTW_GameManager.GameMode == GameMode.TEAM;
    }

    protected onDestroy(): void {
        // AudioManager.StopBGM(XGTW_Constant.Audio.BG2);
    }

    protected start(): void {
        this.SetJJPanel(XGTW_GameManager.JJMode);
        this.HPBar.Init(Color.WHITE);
        this.TeamScore && (this.TeamScore.active = XGTW_GameManager.GameMode == GameMode.TEAM);

        this.RefreshGameItemUI();
        this.RefreshMedicine(false);
        this.RefreshReload(false);
    }

    supplies: XGTW_Supplies = null;
    droppedItem: XGTW_DroppedItem = null;
    ShowTakeSupplies(active: boolean, supplies: XGTW_Supplies = null) {
        if (this.supplies) {
            this.supplies.ShowSuppliesItems(false);
        }

        this.TakeSuppliesButton.active = active;
        this.supplies = supplies;
        this.droppedItem = null;

        if (active) {
            console.log(supplies.data);
            this.TakeSuppliesButtonLabel.string = `${Tools.IsEmptyStr(supplies.data.PlayerName) ? supplies.data.Name : supplies.data.PlayerName}`;
        }
    }

    SetJJPanel(active: boolean = false) {
        this.NormalBar.active = !active;
        this.JJBar.active = active;
        this.Left_JJ.active = active;
    }

    ShowTakeItem(active: boolean, droppedItem: any) {
        this.TakeSuppliesButton.active = active;
        this.supplies = null;
        this.droppedItem = droppedItem;

        if (active) {
            this.TakeSuppliesButtonLabel.string = `${droppedItem.itemData.Name}`;
        }
    }
    ShowUseItem(active: boolean, data = null, cb: Function = null) {
        this.UseItem.active = active;

        if (active) {
            Tween.stopAllByTarget(this.UseItemFill);

            this.UseItemFill.fillRange = 1;

            BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${data.Type}/${data.Name}`).then((sf: SpriteFrame) => {
                this.UseItemIcon.spriteFrame = sf;
                this.UseItemIcon.node.setScale(XGTW_ItemData.GetScale(data.Type).multiplyScalar(0.7));
            });

            tween(this.UseItemFill).to(data.Time, { fillRange: 0 }).call(() => {
                cb && cb(data);
                this.ShowUseItem(false);
            }).start();
        } else {
            Tween.stopAllByTarget(this.UseItemFill);
        }

    }
    countDown: number = 5;
    startCount: boolean = false;
    ShowEvacuation(active: boolean) {
        this.Evacuation.active = active;
        if (active) {
            this.startCount = true;
            this.countDown = 5;
        } else {
            this.startCount = false;
        }
    }
    redTeamScore: number = 0
    blueTeamScore: number = 0
    RefreshTeamScore(addRed: number = 0, addBlue: number = 0) {
        if (XGTW_GameManager.IsGameOver) return;

        this.redTeamScore += addRed;
        this.blueTeamScore += addBlue;
        this.RedTeamScoreLabel.string = `${this.redTeamScore}`;
        this.BlueTeamScoreLabel.string = `${this.blueTeamScore}`;
        //胜利
        if (this.redTeamScore >= 10) {
            XGTW_GameManager.IsGameOver = true;
            XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.WinPanel);
        }
        //失败
        if (this.blueTeamScore >= 10) {
            XGTW_GameManager.IsGameOver = true;
            XGTW_DataManager.PlayerData.Clear();
            XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.FailPanel, [XGTW_GameManager.Instance.playerCtrl.hitBullet]);
        }
    }
    RefreshGameItemUI() {
        this.Weapon_0.Refresh();
        this.Weapon_1.Refresh();
        this.Pistol.Refresh();
        this.MeleeWeapon.Refresh();
    }
    RefreshBulletCount() {
        this.Weapon_0.RefreshBulletCount();
        this.Weapon_1.RefreshBulletCount();
        this.Pistol.RefreshBulletCount();
        this.MeleeWeapon.RefreshBulletCount();
    }
    RefreshMedicine(isOn: boolean) {
        this.Medicine_0.active = !isOn;
        this.Medicine_1.active = isOn;
        this.Medicines.active = isOn;

        if (isOn) {
            this.RefreshMeidcineItems();
        }
    }
    medicineItems: XGTW_SItem[] = [];
    RefreshMeidcineItems() {
        this.medicineItems.forEach(e => PoolManager.PutNode(e.node));
        let items = XGTW_DataManager.PlayerData.BackpackItems.filter(e => XGTW_ItemData.GetItemType(e.Type) == XGTW_ItemType.药品);
        if (items.length <= 0) {
            this.RefreshMedicine(false);
            UIManager.ShowTip("没有发现药品");
        } else {
            for (let i = 0; i < items.length; i++) {
                const data = items[i];
                PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/SItem", this.Medicines).then(e => {
                    let item = e.getComponent(XGTW_SItem);
                    item.Init(data, this.MedicineItemCallback.bind(this))
                    this.medicineItems.push(item);
                })
            }
        }
    }
    MedicineItemCallback(data) {
        this.ShowUseItem(true, data, (item) => {
            XGTW_GameManager.Instance.playerCtrl.HP += item.HP;
            XGTW_DataManager.RemoveItemFromBackpack(item);
            this.RefreshMeidcineItems();
        });
    }
    RefreshReload(isOn: boolean) {
        this.ReloadButton.getChildByName("ReloadButton_0").active = !isOn;
        this.ReloadButton.getChildByName("ReloadButton_1").active = isOn;
        this.ReloadButton.getChildByName("ReloadBullets").active = isOn;

        if (isOn) {
            this.RefreshReloadBulletItems();
        }
    }
    reloadBulletItems: XGTW_SItem[] = [];
    RefreshReloadBulletItems() {
        this.reloadBulletItems.forEach(e => PoolManager.PutNode(e.node));
        let items = XGTW_DataManager.PlayerData.BackpackItems.filter(e => XGTW_ItemData.GetItemType(e.Type) == XGTW_ItemType.子弹);

        if (XGTW_GameManager.Instance.playerCtrl.gun) {
            items = items.filter(e => e.Name == XGTW_GameManager.Instance.playerCtrl.gun.Desc);
        } else {
            items = [];
        }
        if (items.length <= 0) {
            this.RefreshReload(false);
            UIManager.ShowTip("没有备用弹药");
        } else {
            let parent = this.ReloadButton.getChildByName("ReloadBullets");
            for (let i = 0; i < items.length; i++) {
                const data = items[i];
                PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/SItem", parent).then(e => {
                    let item = e.getComponent(XGTW_SItem);
                    item.Init(data, this.ReloadBulletItemCallback.bind(this))
                    this.reloadBulletItems.push(item);
                })
            }
        }
    }
    ReloadBulletItemCallback(data) {
        if (XGTW_GameManager.Instance.playerCtrl.gun) {
            if (XGTW_GameManager.Instance.playerCtrl.gun.BulletCount <= 0) {
                XGTW_GameManager.Instance.playerCtrl.gun.BulletCount += data.Count;
                XGTW_GameManager.Instance.playerCtrl.Reload(data);
                XGTW_DataManager.RemoveItemFromBackpack(data);
                this.RefreshReload(false);
                return;
            }
        }

        UIManager.ShowTip("换弹失败");
    }
    RefreshHPBar(value: number) {
        this.HPBar.Set(value);
    }
    protected update(dt: number): void {
        if (this.startCount) {
            this.countDown -= dt;
            if (this.countDown <= 0) {
                this.countDown = 0;
                this.startCount = false;
                XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.WinPanel);
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
        XGTW_CameraController.Instance.Move(v3(event.getDelta().clone().x, event.getDelta().clone().y));
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
            XGTW_CameraController.Instance.stopFollow = true;
            XGTW_CameraController.Instance.ZoomOut(2000, () => { director.pause(); });
        } else {
            director.resume();
            XGTW_CameraController.Instance.stopFollow = false;
            this.touchs = [];
            XGTW_CameraController.Instance.ZoomIn();
        }
    }

    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        switch (event.target.name) {
            case "TakeSuppliesButton":
                if (this.supplies != null) {
                    this.supplies.ShowSuppliesItems(true);
                    this.supplies.Take();
                }

                if (this.droppedItem != null) {
                    if (XGTW_ItemData.IsMainGun(XGTW_ItemType[`${this.droppedItem.itemData.Type}`]) && (XGTW_DataManager.AddEquippedItem(InventoryType.Weapon_0, this.droppedItem.itemData) || XGTW_DataManager.AddEquippedItem(InventoryType.Weapon_1, this.droppedItem.itemData))) {
                        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.Equip);
                        this.droppedItem.node.destroy();
                        EventManager.Scene.emit(XGTW_Event.RefreshEquip);
                    } else if (XGTW_ItemType[`${this.droppedItem.itemData.Type}`] == XGTW_ItemType.手枪 && (XGTW_DataManager.AddEquippedItem(InventoryType.Pistol, this.droppedItem.itemData))) {
                        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.Equip);
                        EventManager.Scene.emit(XGTW_Event.RefreshEquip);
                        this.droppedItem.node.destroy();
                    } else if (XGTW_ItemType[`${this.droppedItem.itemData.Type}`] == XGTW_ItemType.头盔 && (XGTW_DataManager.AddEquippedItem(InventoryType.Helmet, this.droppedItem.itemData))) {
                        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.Equip);
                        EventManager.Scene.emit(XGTW_Event.RefreshEquip);
                        this.droppedItem.node.destroy();
                    } else if (XGTW_ItemType[`${this.droppedItem.itemData.Type}`] == XGTW_ItemType.防弹衣 && (XGTW_DataManager.AddEquippedItem(InventoryType.Bulletproof, this.droppedItem.itemData))) {
                        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.Equip);
                        EventManager.Scene.emit(XGTW_Event.RefreshEquip);
                        this.droppedItem.node.destroy();
                    } else if (XGTW_DataManager.AddItemToBackpack(this.droppedItem.itemData)) {
                        this.droppedItem.node.destroy();
                    } else {
                        UIManager.ShowTip("背包已满");
                    }
                }
                break;
            case "Weapon_0":
                if (XGTW_DataManager.PlayerData.Weapon_0) {
                    XGTW_GameManager.Instance.playerCtrl.LoadGun(XGTW_DataManager.PlayerData.Weapon_0);
                }
                break;
            case "Weapon_1":
                if (XGTW_DataManager.PlayerData.Weapon_1) {
                    XGTW_GameManager.Instance.playerCtrl.LoadGun(XGTW_DataManager.PlayerData.Weapon_1);
                }
                break;
            case "Pistol":
                if (XGTW_DataManager.PlayerData.Pistol) {
                    XGTW_GameManager.Instance.playerCtrl.LoadGun(XGTW_DataManager.PlayerData.Pistol);
                }
                break;
            case "MeleeWeapon":
                if (XGTW_DataManager.PlayerData.MeleeWeapon) {
                    XGTW_GameManager.Instance.playerCtrl.LoadGun(XGTW_DataManager.PlayerData.MeleeWeapon);
                }
                break;
            case "ReloadButton":
                this.RefreshReload(!this.ReloadButton.getChildByName("ReloadButton_1").active);
                break;
            case "BackpackButton":
                XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.GameBackpackPanel);
                break;
            case "UseItemCancelButton":
                this.ShowUseItem(false, null, null);
                break;
            case "ReturnButton":
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, [GameManager.GameData, "XGTW_Start"]);
                });
                break;
            case "Medicine":
                this.RefreshMedicine(!this.Medicine_1.active);
                break;

            //机甲维修按钮
            case "WXButton":
                XGTW_GameManager.Instance.playerCtrl.jjRevival = true;
                event.target.getChildByName("SkillCooldown")?.getComponent(UI_SkillCooldown).StartCooldown();
                break;
            //飞弹按钮
            case "MissileButton":
                XGTW_GameManager.Instance.playerCtrl.FireMissile();
                event.target.getChildByName("SkillCooldown")?.getComponent(UI_SkillCooldown).StartCooldown();
                break;
            //动力突进按钮
            case "DLTJButton":
                XGTW_GameManager.Instance.playerCtrl.jjSpeedUp = true;
                event.target.getChildByName("SkillCooldown")?.getComponent(UI_SkillCooldown).StartCooldown();
                break;
        }
    }
    protected onEnable(): void {
        EventManager.on(XGTW_Event.ShowTakeSupplies, this.ShowTakeSupplies, this);
        EventManager.on(XGTW_Event.ShowTakeItem, this.ShowTakeItem, this);
        EventManager.on(XGTW_Event.RefreshEquip, this.RefreshGameItemUI, this);
        EventManager.on(XGTW_Event.RefreshBulletCount, this.RefreshBulletCount, this);
        EventManager.on(XGTW_Event.Evacuation, this.ShowEvacuation, this);
        EventManager.on(XGTW_Event.RefreshHP, this.RefreshHPBar, this);
    }
    protected onDisable(): void {
        EventManager.off(XGTW_Event.ShowTakeSupplies, this.ShowTakeSupplies, this);
        EventManager.off(XGTW_Event.RefreshEquip, this.RefreshGameItemUI, this);
        EventManager.off(XGTW_Event.ShowTakeItem, this.ShowTakeItem, this);
        EventManager.off(XGTW_Event.RefreshBulletCount, this.RefreshBulletCount, this);
        EventManager.off(XGTW_Event.Evacuation, this.ShowEvacuation, this);
        EventManager.off(XGTW_Event.RefreshHP, this.RefreshHPBar, this);
    }
}