import { _decorator, Node, Event, tween, v3, Tween, Label, Sprite, SpriteFrame, Vec3 } from 'cc';
import { AudioManager, Audios } from 'db://assets/Scripts/Framework/Managers/AudioManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { Bacon_Constant } from './Bacon_Constant';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

const { ccclass, property } = _decorator;

@ccclass('Bacon_PausePanel')
export default class Bacon_PausePanel extends PanelBase {

    Panel: Node = null;
    Buttons: Node = null;

    positions: Vec3[] = [];

    protected onLoad(): void {
        this.Panel = NodeUtil.GetNode("Panel", this.node);
        this.Buttons = NodeUtil.GetNode("Buttons", this.node);
        this.Buttons.children.forEach(e => this.positions.push(e.position.clone()));
    }

    Show() {
        super.Show(this.Panel);
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);

        this.Buttons.children.forEach(e => e.setPosition(0, -500));

        for (let i = 0; i < this.Buttons.children.length; i++) {
            const node = this.Buttons.children[i];
            const delay = 0.1 * (i + 1);
            tween(node).to(0.3, { position: this.positions[i] }, { easing: "backOut" }).delay(delay).start();
        }
    }

    OnButtonClick(event: Event) {
        AudioManager.Instance.PlayCommonSFX(Audios.ButtonClick);

        switch (event.target.name) {
            case "ReturnButton":
                UIManager.ShowPanel(Panel.MoreGamePanel);
                break;
            case "ResumeButton":
            case "Mask":
            case "CloseButton":
                UIManager.HidePanel(`${GameManager.GameData.DefaultBundle}/${Bacon_Constant.UI.BaconPausePanel}`);
                break;

        }
    }
}
