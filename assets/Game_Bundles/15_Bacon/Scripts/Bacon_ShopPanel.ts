import { _decorator, Node, Event, tween, v3, Tween, Label, Sprite, SpriteFrame, Vec3, Prefab, instantiate } from 'cc';
import { AudioManager, Audios } from 'db://assets/Scripts/Framework/Managers/AudioManager';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { Bacon_Constant } from './Bacon_Constant';
import Banner from 'db://assets/Scripts/Banner';
import { Bacon_PanItem } from './Bacon_PanItem';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

const { ccclass, property } = _decorator;

@ccclass('Bacon_ShopPanel')
export default class Bacon_ShopPanel extends PanelBase {
    Panel: Node = null;
    Content: Node = null;
    panItems: Bacon_PanItem[] = [];

    protected onLoad(): void {
        this.Panel = NodeUtil.GetNode("Panel", this.node);
        this.Content = NodeUtil.GetNode("Content", this.node);
    }

    Show() {
        super.Show(this.Panel);
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);

        for (let i = 0; i < this.panItems.length; i++) {
            this.panItems[i].node.destroy();
        }
        this.panItems = [];

        for (let i = 0; i < Bacon_Constant.Pans.length; i++) {
            const pan = Bacon_Constant.Pans[i];

            BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, `PanItem`).then((prefab: Prefab) => {
                let node = instantiate(prefab);
                node.setParent(this.Content);
                let item = node.getComponent(Bacon_PanItem);
                item.Init(pan, this.BaconItemCallback.bind(this));
                this.panItems.push(item);
            });
        }

    }

    BaconItemCallback() {
        for (let i = 0; i < this.panItems.length; i++) {
            this.panItems[i].Refresh();
        }

    }

    OnButtonClick(event: Event) {
        AudioManager.Instance.PlayCommonSFX(Audios.ButtonClick);

        switch (event.target.name) {
            case "FreeGetButton":
                Banner.Instance.ShowVideoAd(() => {

                });
                break;
            case "Mask":
            case "CloseButton":
                UIManager.HidePanel(`${GameManager.GameData.DefaultBundle}/${Bacon_Constant.UI.BaconShopPanel}`);
                break;

        }
    }
}
