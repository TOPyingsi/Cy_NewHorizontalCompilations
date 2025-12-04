import { _decorator, Component, EventTouch, instantiate, Node, Prefab } from 'cc';
import { XYRZZ_Panel, XYRZZ_UIManager } from './XYRZZ_UIManager';
import { XYRZZ_GameData } from './XYRZZ_GameData';
import { XYRZZ_Incident } from './XYRZZ_Incident';
import { XYRZZ_FishingBox } from './XYRZZ_FishingBox';
import { XYRZZ_AudioManager } from './XYRZZ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYRZZ_FishingPanel')
export class XYRZZ_FishingPanel extends Component {
    @property(Node)
    Content: Node = null;
    start() {

        this.Init();
    }
    Show() {

    }
    OnbuttonClick(btn: EventTouch) {
        XYRZZ_AudioManager.globalAudioPlay("鼠标嘟");
        switch (btn.target.name) {
            case "叉号":
                XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_FishingPanel);
                break;
        }

    }

    Init() {
        //初始化所有box
        XYRZZ_Incident.Loadprefab("Prefabs/XYRZZ_FishingBox").then((prefab: Prefab) => {
            XYRZZ_GameData.Instance.FishingPoleDataLevel.forEach((cd, index: number) => {
                let nd = instantiate(prefab);
                nd.setParent(this.Content);
                nd.getComponent(XYRZZ_FishingBox).Id = index;
                nd.getComponent(XYRZZ_FishingBox).ShowUI();
            })
        })
    }
}


