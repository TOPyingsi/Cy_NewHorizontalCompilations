import { _decorator, Node, Event, tween, v3, Tween, Label, Sprite, SpriteFrame } from 'cc';
import { AudioManager, Audios } from 'db://assets/Scripts/Framework/Managers/AudioManager';
import { UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import NodeUtil from 'db://assets/Scripts/Framework/Utils/NodeUtil';
import { Bacon_Constant } from './Bacon_Constant';
import Banner from 'db://assets/Scripts/Banner';
import { Bacon_Manager } from './Bacon_Manager';
import { EventManager } from 'db://assets/Scripts/Framework/Managers/EventManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';

const { ccclass, property } = _decorator;

@ccclass('Bacon_GetPanel')
export default class Bacon_GetPanel extends PanelBase {

    Panel: Node = null;
    AdCountLb: Label = null;

    protected onLoad(): void {
        this.Panel = NodeUtil.GetNode("Panel", this.node);
        this.AdCountLb = NodeUtil.GetComponent("AdCountLb", this.node, Label);
    }

    Show() {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);
        super.Show(this.Panel);
        this.Refresh();
    }

    Refresh(): void {
        this.AdCountLb.string = `(${Bacon_Constant.WatchAdCount}/2)`;
    }

    OnButtonClick(event: Event) {
        AudioManager.Instance.PlayCommonSFX(Audios.ButtonClick);

        switch (event.target.name) {
            case "FreeGetButton":
                Banner.Instance.ShowVideoAd(() => {
                    Bacon_Manager.Bacon += 30;
                    UIManager.HidePanel(`${GameManager.GameData.DefaultBundle}/${Bacon_Constant.UI.BaconGetPanel}`);
                });
                break;
            case "InfiniteBaconButton":
                Banner.Instance.ShowVideoAd(() => {
                    Bacon_Constant.WatchAdCount += 1;
                    this.Refresh();

                    if (Bacon_Constant.WatchAdCount >= 2) {
                        Bacon_Constant.WatchAdCount = 0;
                        Bacon_Manager.InfiniteTime += 60 * 15;
                        UIManager.HidePanel(`${GameManager.GameData.DefaultBundle}/${Bacon_Constant.UI.BaconGetPanel}`);
                        EventManager.Scene.emit(Bacon_Constant.Event_StartInfiniteBacon);
                    }
                });
                break;
            case "Mask":
            case "CloseButton":
                UIManager.HidePanel(`${GameManager.GameData.DefaultBundle}/${Bacon_Constant.UI.BaconGetPanel}`);
                break;

        }
    }
}
