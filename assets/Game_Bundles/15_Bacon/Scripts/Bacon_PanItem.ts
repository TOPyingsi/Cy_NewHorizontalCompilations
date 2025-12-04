import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { AudioManager, Audios } from 'db://assets/Scripts/Framework/Managers/AudioManager';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { Bacon_Manager } from './Bacon_Manager';
import Banner from 'db://assets/Scripts/Banner';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('Bacon_PanItem')
export class Bacon_PanItem extends Component {
    Icon: Sprite = null;
    Locked: Node = null;
    Label: Label = null;
    Select: Node = null;
    panName: string = "";
    cb: Function = null;

    protected onLoad(): void {
        this.Icon = NodeUtil.GetComponent("Icon", this.node, Sprite);
        this.Label = NodeUtil.GetComponent("Label", this.node, Label);
        this.Locked = NodeUtil.GetNode("Locked", this.node);
        this.Select = NodeUtil.GetNode("Select", this.node);
    }

    Init(name: string, cb: Function): void {
        this.panName = name;
        this.Label.string = `${name}`;
        this.cb = cb;

        BundleManager.LoadSpriteFrame(GameManager.GameData.DefaultBundle, `Sprites/Skins/Pan_${name}`).then((sf: SpriteFrame) => {
            this.Icon.spriteFrame = sf;
        });

        this.Refresh();
    }

    Refresh() {
        this.Locked.active = !Bacon_Manager.GetPanUnlock(this.panName);
        this.Select.active = this.panName == Bacon_Manager.GetDefaultPan();
    }

    OnButtonClick() {
        AudioManager.Instance.PlayCommonSFX(Audios.ButtonClick);

        if (Bacon_Manager.GetPanUnlock(this.panName)) {
            Bacon_Manager.SetDefaultPan(this.panName);
            this.cb && this.cb();
        } else {
            Banner.Instance.ShowVideoAd(() => {
                Bacon_Manager.SetPanUnlock(this.panName);
                Bacon_Manager.SetDefaultPan(this.panName);
                this.cb && this.cb();
            });
        }
    }
}