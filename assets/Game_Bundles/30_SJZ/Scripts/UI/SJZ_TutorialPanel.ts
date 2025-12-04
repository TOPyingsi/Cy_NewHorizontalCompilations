import { _decorator, Label, Node, Event, Sprite, SpriteFrame, Vec2, UITransform, CCString, misc, instantiate, Prefab, Vec3 } from 'cc';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { SJZ_UIManager } from './SJZ_UIManager';
import { SJZ_Constant } from '../SJZ_Constant';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { SJZ_Audio, SJZ_AudioManager } from '../SJZ_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import SJZ_PlayerInventory from './SJZ_PlayerInventory';
const { ccclass, property } = _decorator;

@ccclass('SJZ_TutorialPanel')
export default class SJZ_TutorialPanel extends PanelBase {
    Panel: Node = null;
    Pages: Node = null;
    NextPageButton: Node = null;
    LastPageButton: Node = null;
    ClosePageButton: Node = null;
    DescLabel: Label = null;

    descs: string[] = [
        "把战局内带出的物品放入到仓库里。",
        "搜索出的大红可以放到展览室。",
        "点击装备的枪械，装备芯片。",
        "点击改装。",
        "把芯片拖放到芯片配件栏里。"
    ];

    index: number = 0;
    showCloseButton: boolean = false;

    protected onLoad(): void {
        this.Panel = NodeUtil.GetNode("Panel", this.node);
        this.Pages = NodeUtil.GetNode("Pages", this.node);
        this.NextPageButton = NodeUtil.GetNode("NextPageButton", this.node);
        this.LastPageButton = NodeUtil.GetNode("LastPageButton", this.node);
        this.ClosePageButton = NodeUtil.GetNode("ClosePageButton", this.node);
        this.DescLabel = NodeUtil.GetComponent("DescLabel", this.node, Label);
    }

    Show(): void {
        super.Show(this.Panel);
        this.ClosePageButton.active = false;
        this.index = 0;
        this.showCloseButton = false;
        this.RefreshPanel();

        ProjectEventManager.emit(ProjectEvent.页面转换, GameManager.GameData.gameName);
    }

    RefreshPanel() {
        this.LastPageButton.active = this.index > 0;
        this.NextPageButton.active = this.index < this.descs.length - 1;

        for (let i = 0; i < this.Pages.children.length; i++) {
            this.Pages.children[i].active = this.index == i;
        }

        this.DescLabel.string = this.descs[this.index];
    }

    OnButtonClick(event: Event) {
        SJZ_AudioManager.Instance.PlaySFX(SJZ_Audio.ButtonClick);

        switch (event.target.name) {
            case "ClosePageButton":
                SJZ_UIManager.Instance.HidePanel(SJZ_Constant.Panel.TutorialPanel);

                BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `UI/PlayerInventory`).then((prefab: Prefab) => {
                    const spawnInverntory = (parent: Node) => {
                        let node = instantiate(prefab);
                        node.setParent(parent);
                        node.setPosition(Vec3.ZERO);
                        let inventory = node.getComponent(SJZ_PlayerInventory);
                        inventory.InitPlayerInventory();
                        return inventory;
                    }

                    SJZ_UIManager.Instance.ShowPanel(SJZ_Constant.Panel.InventoryPanel, [spawnInverntory]);
                });
                break;
            case "LastPageButton":
                this.index = misc.clampf(this.index - 1, 0, this.descs.length - 1);
                this.RefreshPanel();
                break;
            case "NextPageButton":
                this.index = misc.clampf(this.index + 1, 0, this.descs.length - 1);
                if (!this.showCloseButton && this.index == this.descs.length - 1) {
                    this.showCloseButton = true;
                    this.ClosePageButton.active = true;
                }
                this.RefreshPanel();
                break;
        }
    }
}