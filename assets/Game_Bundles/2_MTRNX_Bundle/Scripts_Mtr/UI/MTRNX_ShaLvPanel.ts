import { _decorator, Component, director, Node } from 'cc';

import Banner from '../../../../Scripts/Banner';
import { ProjectEvent, ProjectEventManager } from '../../../../Scripts/Framework/Managers/ProjectEventManager';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
import { MTRNX_Panel, MTRNX_UIManager } from '../MTRNX_UIManager';
import { MTRNX_GameDate } from '../MTRNX_GameDate';
import { MTRNX_Include } from '../MTRNX_Include';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_ShaLvPanel')
export class MTRNX_ShaLvPanel extends Component {

    //打开BOss模式
    OnBossButtonClick() {
        MTRNX_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.ChallengePanel);
        ProjectEventManager.emit(ProjectEvent.页面转换, "山海经逆袭");
    }
    //打开商店
    Open_Shop() {
        MTRNX_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.Shopping);
        ProjectEventManager.emit(ProjectEvent.页面转换, "山海经逆袭");
    }
    //打开超级角色
    Open_ChaoJiJueSe() {
        MTRNX_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.SuperShop);
        ProjectEventManager.emit(ProjectEvent.页面转换, "山海经逆袭");
    }
    //打开限定角色
    Open_XianDingjueSe() {
        MTRNX_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.limitPanel);
        ProjectEventManager.emit(ProjectEvent.页面转换, "山海经逆袭");
    }
    //签到点击
    OnQianDaoClick() {
        MTRNX_AudioManager.AudioClipPlay("按钮点击");
        if (MTRNX_GameDate.Instance.TimeDate[3] == 1) {
            //签到
            MTRNX_GameDate.Instance.TimeDate[3] = 0;
            MTRNX_Include.AddPoint(300);
        } else {
            MTRNX_UIManager.HopHint("今天已经签到过了！");
        }
    }

    //点击抽奖按钮
    OnLotteryButtonClick() {
        MTRNX_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.LotteryPanel);
        ProjectEventManager.emit(ProjectEvent.页面转换, "山海经逆袭");
    }
    //杀戮模式
    OnMassacreButtonClick() {
        MTRNX_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.SeletGamePanel);
        ProjectEventManager.emit(ProjectEvent.页面转换, "山海经逆袭");
    }
    //打开进化
    OnevolutionButtonClick() {
        MTRNX_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.evolutionPanel);
        ProjectEventManager.emit(ProjectEvent.页面转换, "山海经逆袭");
    }
    //关闭
    OnExitClick() {
        this.node.active = false;
    }
}


