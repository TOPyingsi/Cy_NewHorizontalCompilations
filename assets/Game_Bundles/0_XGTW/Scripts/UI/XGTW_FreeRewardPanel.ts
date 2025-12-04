import { _decorator, Component, Event } from 'cc';
const { ccclass, property } = _decorator;

import { XGTW_AudioManager } from '../XGTW_AudioManager';
import { XGTW_Constant } from '../Framework/Const/XGTW_Constant';
import { XGTW_UIManager } from '../Framework/Managers/XGTW_UIManager';
import PrefsManager from '../../../../Scripts/Framework/Managers/PrefsManager';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { XGTW_DataManager } from '../Framework/Managers/XGTW_DataManager';
import { ProjectEventManager, ProjectEvent } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from 'db://assets/Scripts/GameManager';

@ccclass('XGTW_FreeRewardPanel')
export default class XGTW_FreeRewardPanel extends Component {
    Show() {
        ProjectEventManager.emit(ProjectEvent.弹出窗口, GameManager.GameData.gameName);
    }
    OnButtonClick(event: Event) {
        XGTW_AudioManager.AudioClipPlay(XGTW_Constant.Audio.ButtonClick);

        switch (event.target.name) {
            case "Mask":
            case "CloseButton":
                XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.FreeRewardPanel);
                break;
            case "Button":
                if (PrefsManager.GetBool(XGTW_Constant.Key.FreeReward)) {
                    UIManager.ShowTip("已领取过");
                    return;
                }
                if (XGTW_DataManager.JunXuItems.find(e => e.Name == "RPK16-神秘图腾")) {
                    let data = Tools.Clone(XGTW_DataManager.JunXuItems.find(e => e.Name == "RPK16-神秘图腾"));
                    XGTW_DataManager.AddPlayerItem(data);
                    XGTW_UIManager.Instance.HidePanel(XGTW_Constant.Panel.FreeRewardPanel);
                    XGTW_UIManager.Instance.ShowPanel(XGTW_Constant.Panel.RewardPanel, [data])
                    PrefsManager.SetBool(XGTW_Constant.Key.FreeReward, true);
                }
                break;

        }
    }
}