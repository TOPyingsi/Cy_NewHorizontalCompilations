import { _decorator, Component, director, Node } from 'cc';

import Banner from '../../../../Scripts/Banner';
import { ProjectEvent, ProjectEventManager } from '../../../../Scripts/Framework/Managers/ProjectEventManager';
import { MTRNX_Water_AudioManager } from '../MTRNX_Water_AudioManager';
import { MTRNX_Water_Panel, MTRNX_Water_UIManager } from '../MTRNX_Water_UIManager';
import { MTRNX_Water_GameDate } from '../MTRNX_Water_GameDate';
import { MTRNX_Water_Include } from '../MTRNX_Water_Include';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_ShaLvPanel')
export class MTRNX_Water_ShaLvPanel extends Component {

    //打开BOss模式
    OnBossButtonClick() {
        MTRNX_Water_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_Water_UIManager.Instance.ShowPanel(MTRNX_Water_Panel.ChallengePanel);
        ProjectEventManager.emit(ProjectEvent.页面转换, "山海经逆袭");
    }
    //打开商店
    Open_Shop() {
        MTRNX_Water_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_Water_UIManager.Instance.ShowPanel(MTRNX_Water_Panel.Shopping);
        ProjectEventManager.emit(ProjectEvent.页面转换, "山海经逆袭");
    }
    //打开超级角色
    Open_ChaoJiJueSe() {
        MTRNX_Water_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_Water_UIManager.Instance.ShowPanel(MTRNX_Water_Panel.SuperShop);
        ProjectEventManager.emit(ProjectEvent.页面转换, "山海经逆袭");
    }
    //打开限定角色
    Open_XianDingjueSe() {
        MTRNX_Water_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_Water_UIManager.Instance.ShowPanel(MTRNX_Water_Panel.limitPanel);
        ProjectEventManager.emit(ProjectEvent.页面转换, "山海经逆袭");
    }
    //签到点击
    OnQianDaoClick() {
        MTRNX_Water_AudioManager.AudioClipPlay("按钮点击");
        if (MTRNX_Water_GameDate.Instance.TimeDate[3] == 1) {
            //签到
            MTRNX_Water_GameDate.Instance.TimeDate[3] = 0;
            MTRNX_Water_Include.AddPoint(300);
        } else {
            MTRNX_Water_UIManager.HopHint("今天已经签到过了！");
        }
    }

    //点击抽奖按钮
    OnLotteryButtonClick() {
        MTRNX_Water_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_Water_UIManager.Instance.ShowPanel(MTRNX_Water_Panel.LotteryPanel);
        ProjectEventManager.emit(ProjectEvent.页面转换, "山海经逆袭");
    }
    //杀戮模式
    OnMassacreButtonClick() {
        MTRNX_Water_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_Water_UIManager.Instance.ShowPanel(MTRNX_Water_Panel.SeletGamePanel);
        ProjectEventManager.emit(ProjectEvent.页面转换, "山海经逆袭");
    }
    //打开进化
    OnevolutionButtonClick() {
        MTRNX_Water_AudioManager.AudioClipPlay("按钮点击");
        MTRNX_Water_UIManager.Instance.ShowPanel(MTRNX_Water_Panel.evolutionPanel);
        ProjectEventManager.emit(ProjectEvent.页面转换, "山海经逆袭");
    }
    //关闭
    OnExitClick() {
        this.node.active = false;
    }
}


