import { _decorator, Component, Label, Node, Sprite, Event, SpriteFrame, UITransform } from 'cc';
const { ccclass, property } = _decorator;

import XGTW_InventoryPanel from "./XGTW_InventoryPanel";
import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import NodeUtil from '../../../../Scripts/Framework/Utils/NodeUtil';
import XGTW_GameManager from '../XGTW_GameManager';
import { XGTW_ItemType, XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { GameManager } from '../../../../Scripts/GameManager';
import { XGTW_ItemData } from '../Datas/XGTW_Data';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

@ccclass('XGTW_EquipInfoPanel')
export default class XGTW_EquipInfoPanel extends Component {
    NameLabel: Label | null = null;
    WeightLabel: Label | null = null;
    Durable: Node | null = null;
    DurableLabel: Label | null = null;
    ConfirmButtonLabel: Label | null = null;
    Icon: Sprite | null = null;
    QualityBar: Node | null = null;
    Accessories: Node | null = null;
    data: XGTW_ItemData = null;
    protected onLoad(): void {
        this.NameLabel = NodeUtil.GetComponent("NameLabel", this.node, Label);
        this.WeightLabel = NodeUtil.GetComponent("WeightLabel", this.node, Label);
        this.DurableLabel = NodeUtil.GetComponent("DurableLabel", this.node, Label);
        this.ConfirmButtonLabel = NodeUtil.GetComponent("ConfirmButtonLabel", this.node, Label);
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.Durable = NodeUtil.GetNode("Durable", this.node);
        this.QualityBar = NodeUtil.GetNode("QualityBar", this.node);
        this.Accessories = NodeUtil.GetNode("Accessories", this.node);
    }
    Show(data: XGTW_ItemData) {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);

        if (!this.node.active) this.node.active = true;

        this.data = data;

        this.NameLabel.string = `${XGTW_ItemData.GetFullName(data)}`;

        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${data.Type}/${data.Name.replace(/^\./, '')}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        });

        this.QualityBar.getComponent(Sprite).color = XGTW_GameManager.GetQualityColor(data.Quality);

        this.DurableLabel.string = `${data.Durable}/${data.MaxDurable}`;
        this.Durable.active = data.Durable != -1;

        let showAccessories = XGTW_ItemData.GetAssories(XGTW_ItemData.GetItemType(data.Type)).length > 0;
        this.Accessories.active = showAccessories;
        if (showAccessories) {
            this.RefreshAssories();
        }

        let height = (showAccessories || XGTW_ItemData.IsConsumables(XGTW_ItemType[data.Type])) ? 900 : 700;
        this.node.getComponent(UITransform).setContentSize(650, height);

        this.node.active = false;
        this.node.active = true;
    }
    Hide() {
        if (this.node.active) this.node.active = false;
    }
    //展示枪支配件
    RefreshAssories() {
        let as = XGTW_ItemData.GetAssories(XGTW_ItemData.GetItemType(this.data.Type));
        for (let i = 0; i < this.Accessories.children.length; i++) {
            const node = this.Accessories.children[i];
            node.active = as.find(f => f == node.name)
            if (node.active) {
                node.getChildByName("Icon").getComponent(Sprite).spriteFrame = null;
                let a = (this.data as any).Assories.find(f => f.Type == node.name);
                if (a) {
                    BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Sprites/Items/${a.Type}/${a.Name}`).then((sf: SpriteFrame) => {
                        node.getChildByName("Icon").getComponent(Sprite).spriteFrame = sf;
                    });
                }
            }
        }
    }
    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        switch (event.target.name) {
            case "ConfirmButton":
                if (XGTW_DataManager.RemovePlayerEquippedItem(this.data)) {
                    XGTW_DataManager.AddPlayerItem(this.data);
                }
                XGTW_InventoryPanel.Instance.RefreshEquipButtons();
                this.Hide();
                break;
            case "枪口":
            case "握把":
            case "弹匣":
            case "枪托":
            case "瞄具":
                if (!this.data) return;
                let d = XGTW_DataManager.UnequipAssorie(this.data, event.target.name);
                if (d) XGTW_DataManager.AddPlayerItem(d, false);
                this.RefreshAssories();
                break;
            case "ReturnButtton":
                this.Hide();
                break;


        }
    }
    protected onEnable(): void {
    }
    protected onDisable(): void {

    }
}