import { _decorator, Component, Node } from 'cc';
import { XZPQ_GameManager } from './XZPQ_GameManager';
import { XZPQ_AudioManager } from './XZPQ_AudioManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { AudioManager } from 'db://assets/Scripts/Framework/Managers/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XZPQ_AniCtrl2')
export class XZPQ_AniCtrl2 extends Component {

    StartAction() {
        this.schedule(this.QiaoZhiAction, 20);
    }
    QiaoZhiAction() {
        // this.qiaoZhi_Action = setTimeout(function () {
        //     this.qiaozhi_index = -1;
        //     XZPQ_GameManager.Instance.RefreashPigs();
        //     if (this.wearMask == false) {
        //         XZPQ_AudioManager.Instance.playAudio(this.lookyinxiao);
        //     }

        //     this.qiaoZhi_Action = setTimeout(function () {
        //         XZPQ_GameManager.Instance.QiaoZhiTuLian();
        //     }.bind(this), 6666);

        // }.bind(this), 40000);

        XZPQ_GameManager.Instance.qiaozhi_index = -1;
        this.RefreashPigs();
        if (XZPQ_GameManager.Instance.wearMask == false) {
            XZPQ_AudioManager.Instance.playAudio(XZPQ_GameManager.Instance.lookyinxiao);
        }

        this.schedule(this.QiaoZhiTuLian, 6);

    }

    unQiaoZhiAll() {
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.ResetPigs();
            this.RefreashPigs();
            this.StartAction();
        }, 0.3)
        // this.unschedule(this.QiaoZhiAction);
        // this.unschedule(this.QiaoZhiTuLian);
    }

    QiaoZhiTuLian() {

        if (!XZPQ_GameManager.Instance.wearMask) {
            this.Fail(false);
        } else {
            XZPQ_GameManager.Instance.qiaozhi_index = 3;
            this.RefreashPigs();
        }
    }

    RefreashPigs() {
        XZPQ_GameManager.Instance.mon_1.RefreashPig();
        XZPQ_GameManager.Instance.mon_2.RefreashPig();
        XZPQ_GameManager.Instance.mon_3.RefreashPig();
        XZPQ_GameManager.Instance.mon_4.RefreashPig();
        XZPQ_GameManager.Instance.mon_home.RefreashPig();
    }

    ResetPigs() {
        // XZPQ_GameManager.Instance.peiqi_clamb = false;
        // XZPQ_GameManager.Instance.peiqi_index = 2;
        XZPQ_GameManager.Instance.qiaozhi_index = 3;

        // this.unscheduleAllCallbacks();
        this.RefreashPigs();

    }

    Fail(isPeiQi: boolean) {

        if (XZPQ_GameManager.Instance.isGameOver) {
            return;
        }
        XZPQ_GameManager.Instance.isGameOver = true;

        XZPQ_GameManager.Instance.MaskButton.active = false;
        XZPQ_GameManager.Instance.MonButton.active = false;

        ProjectEventManager.emit(ProjectEvent.游戏结束, "小象佩妮");
        AudioManager.Instance.StopBGM();

        this.ResetPigs();
        if (isPeiQi) {
            XZPQ_AudioManager.Instance.playAudio(XZPQ_GameManager.Instance.pigAttackyinxiao);
            XZPQ_GameManager.Instance.peiQiTuLian.active = true;
        }
        else {
            XZPQ_AudioManager.Instance.playAudio(XZPQ_GameManager.Instance.qiaozhiAttackyinxiao);
            XZPQ_GameManager.Instance.qiaoZhiTuLian.active = true;
        }

        this.unscheduleAllCallbacks();

        this.scheduleOnce(() => {
            XZPQ_GameManager.Instance.failPanel.Show();
        }, 2);


    }
}


