import { _decorator, Component, director, find, game, native, Node, tween, v3, Vec3 } from 'cc';

import { QSSZG_AudioManager } from '../QSSZG_AudioManager';
import { QSSZG_Panel, QSSZG_ShowPanel } from '../Game/QSSZG_ShowPanel';
import Banner from '../../../../Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('QSSZG_StartPanel')
export class QSSZG_StartPanel extends Component {
    public static IsOnCe: boolean = true;//是否第一次到主页
    start() {
        //------广告-------------------------------------------------
        //-------------------------------------------------
        if (!QSSZG_StartPanel.IsOnCe) {
            if (Banner.RegionMask) {
                Banner.Instance.ShowCustomAd();
            }
        }
        QSSZG_StartPanel.IsOnCe = false;
        game.frameRate = 59;
        // if (Banner.IsAndroid() && !Banner.TestMode) {
        //     var result = native.reflection.callStaticMethod("com/cocos/game/MainActivity", "JudgeChannel", "()Ljava/lang/String;");
        //     switch (result) {
        //         case "VivoBtn":
        //             find("Canvas/StartPanel/联系客服").active = true;
        //             break;
        //         case "OppoBtn":
        //             find("Canvas/StartPanel/联系客服").active = true;
        //             find("Canvas/StartPanel/更多精彩").active = true;
        //             break;
        //         case "HuaweiBtn":
        //             find("Canvas/StartPanel/注销账号").active = true;
        //             break;
        //     }
        // }
        this.scheduleOnce(() => {
            QSSZG_ShowPanel.Instance.ShowPanel(QSSZG_Panel.LoadingPanel, ["QSSZG_Game"]);
        }, 1)
    }

    OnStartGameButtonClick() {
        // QSSZG_ShowPanel.Instance.ShowPanel(QSSZG_Panel.SelectLvPanel);
        QSSZG_ShowPanel.Instance.ShowPanel(QSSZG_Panel.LoadingPanel, ["QSSZG_Game"]);
    }



}


