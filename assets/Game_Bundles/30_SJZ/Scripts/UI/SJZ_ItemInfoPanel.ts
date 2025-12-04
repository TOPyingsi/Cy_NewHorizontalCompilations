import { _decorator, Component, Label, Node, Event, Prefab, instantiate, math, Vec2, v2, v3, Size, resources, Vec3, Sprite, SpriteFrame } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { SJZ_ItemData, SJZ_ItemType } from '../SJZ_Data';
import { SJZ_UIManager } from './SJZ_UIManager';
import { SJZ_Constant } from '../SJZ_Constant';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { SJZ_GameManager } from '../SJZ_GameManager';
import { SJZ_DataManager } from '../SJZ_DataManager';
import { SJZ_Audio, SJZ_AudioManager } from '../SJZ_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import SJZ_PlayerInventory from './SJZ_PlayerInventory';
const { ccclass, property } = _decorator;

@ccclass('SJZ_ItemInfoPanel')
export default class SJZ_ItemInfoPanel extends PanelBase {
    Panel: Node = null;
    Icon: Sprite = null;
    TitleLabel: Label = null;
    MoneyLabel: Label = null;
    DescLabel: Label = null;
    Buttons: Node = null;
    Button: Node = null;

    Button_GaiZhuang: Node = null;

    data: SJZ_ItemData = null;
    callback: Function = null;

    protected onLoad(): void {
        this.Panel = NodeUtil.GetNode("Panel", this.node);
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.TitleLabel = NodeUtil.GetComponent("TitleLabel", this.node, Label);
        this.MoneyLabel = NodeUtil.GetComponent("MoneyLabel", this.node, Label);
        this.DescLabel = NodeUtil.GetComponent("DescLabel", this.node, Label);
        this.Button = NodeUtil.GetNode("Button", this.node);
        this.Buttons = NodeUtil.GetNode("Buttons", this.node);

        this.Button_GaiZhuang = NodeUtil.GetNode("Button_GaiZhuang", this.node);
    }

    Reset() {
        this.DescLabel.string = ``;
    }

    Show(data: SJZ_ItemData, showButtons: boolean = false, callback: Function = null): void {
        super.Show(this.Panel);
        this.data = data;
        this.callback = callback;

        this.Reset();

        this.Button.active = !showButtons;
        this.Buttons.active = showButtons;

        this.Button_GaiZhuang.active = SJZ_ItemData.IsGun(data.Type);

        this.TitleLabel.string = `${data.Name}`;
        this.MoneyLabel.string = `${data.Price}`;

        if (data.Type == SJZ_ItemType.Weapon) {
            let ammoData = SJZ_DataManager.AmmoData.filter(e => e.Type == data.WeaponData.AmmoType);
            let ammoStr = ``;
            for (let i = 0; i < ammoData.length; i++) {
                ammoStr += `\t\t\t${ammoData[i].Name}\n`;
            }
            this.DescLabel.string = `子弹类型：\n${ammoStr}`;
        }

        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Res/Items/${data.ImageId}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
            SJZ_GameManager.SetImagePreferScale(this.Icon, 300, 300);
        });

        ProjectEventManager.emit(ProjectEvent.页面转换, GameManager.GameData.gameName);
    }

    OnButtonClick(event: Event) {
        SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.ButtonClick);

        switch (event.target.name) {
            case "Mask":
                SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.ItemInfoPanel);
                break;
            case "Button_Sell":
                this.callback && this.callback("Sell");
                SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.ItemInfoPanel);
                break;
            case "Button_Takeoff":
                this.callback && this.callback("Takeoff");
                SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.ItemInfoPanel);
                break;
            case "Button_GaiZhuang":
                BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `UI/PlayerInventory`).then((prefab: Prefab) => {
                    const spawnInverntory = (parent: Node) => {
                        let node = instantiate(prefab);
                        node.setParent(parent);
                        node.setPosition(Vec3.ZERO);
                        let inventory = node.getComponent(SJZ_PlayerInventory);
                        inventory.InitPlayerInventory();
                        return inventory;
                    }

                    SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.AccessoriesPanel, [this.data, spawnInverntory]);
                });

                break;
            case "CloseButton":
                SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.ItemInfoPanel);
                break;
            case "Button":
                this.callback && this.callback(this.data);
                SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.ItemInfoPanel);
                break;

        }
    }
}