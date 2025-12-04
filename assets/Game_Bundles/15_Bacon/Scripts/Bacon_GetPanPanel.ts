import { _decorator, Node, Event, tween, v3, Tween, Label, Sprite, SpriteFrame } from 'cc';
import { AudioManager, Audios } from 'db://assets/Scripts/Framework/Managers/AudioManager';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { Bacon_Constant } from './Bacon_Constant';
import Banner from 'db://assets/Scripts/Banner';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { Bacon_Manager } from './Bacon_Manager';

const { ccclass, property } = _decorator;

@ccclass('Bacon_GetPanPanel')
export default class Bacon_GetPanPanel extends PanelBase {

    Panel: Node = null;
    NameLb: Label = null;
    Icon: Sprite = null;

    pan: string = "";

    protected onLoad(): void {
        this.Panel = NodeUtil.GetNode("Panel", this.node);
        this.NameLb = NodeUtil.GetComponent("NameLb", this.node, Label);
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
    }

    Show(name: string) {
        super.Show(this.Panel);
        this.pan = name;
        this.NameLb.string = `${name}`;

        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Sprites/Skins/Pan_${name}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        });
    }

    OnButtonClick(event: Event) {
        AudioManager.Instance.PlayCommonSFX(Audios.ButtonClick);

        switch (event.target.name) {
            case "FreeGetButton":
                Banner.Instance.ShowVideoAd(() => {
                    Bacon_Manager.SetPanUnlock(this.pan);
                    Bacon_Manager.SetDefaultPan(this.pan);
                    UIManager.HidePanel(`${GameManager.GameData.DefaultBundle}/${Bacon_Constant.UI.BaconGetPanPanel}`);
                });
                break;
            case "Mask":
            case "CloseButton":
                UIManager.HidePanel(`${GameManager.GameData.DefaultBundle}/${Bacon_Constant.UI.BaconGetPanPanel}`);
                break;

        }
    }
}
