import { _decorator, Component, Node } from 'cc';
import { XZPQ_GameManager } from './XZPQ_GameManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { AudioManager } from 'db://assets/Scripts/Framework/Managers/AudioManager';
import { XZPQ_AudioManager } from './XZPQ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XZPQ_AniCtrl')
export class XZPQ_AniCtrl extends Component {


    StartAction() {
        this.schedule(this.PeiQiAction, 30);
        // this.PeiQiAction();
        // this.QiaoZhiAction();
    }

    PeiQiAction() {
        // this.peiQi_Action = setTimeout(function () {

        //     this.peiqi_index = 1;
        //     XZPQ_GameManager.Instance.RefreashPigs();

        //     this.schedule(function () {
        //         this.peiqi_clamb = true;
        //         XZPQ_GameManager.Instance.RefreashPigs();

        //         this.peiQi_Action = setTimeout(function () {
        //             XZPQ_GameManager.Instance.Fail(true);
        //         }.bind(this), 6666);

        //     }.bind(this), 25000);

        //}.bind(this), 30000);

        XZPQ_GameManager.Instance.peiqi_index = 1;
        this.RefreashPigs();

        this.schedule(this.unPeiqi, 20);

    }

    unPeiqi() {

        XZPQ_GameManager.Instance.peiqi_clamb = true;
        this.RefreashPigs();

        this.schedule(this.Fail(true), 6);

    }

    unPeiqiAll() {
        this.unscheduleAllCallbacks();

        // this.StartAction();
        // this.unschedule(this.PeiQiAction);
        // this.unschedule(this.unPeiqi);
        // this.unschedule(this.Fail);
    }

    RefreashPigs() {
        XZPQ_GameManager.Instance.mon_1.RefreashPig();
        XZPQ_GameManager.Instance.mon_2.RefreashPig();
        XZPQ_GameManager.Instance.mon_3.RefreashPig();
        XZPQ_GameManager.Instance.mon_4.RefreashPig();
        XZPQ_GameManager.Instance.mon_home.RefreashPig();
    }

    ResetPigs() {
        XZPQ_GameManager.Instance.peiqi_clamb = false;
        XZPQ_GameManager.Instance.peiqi_index = 2;
        // XZPQ_GameManager.Instance.qiaozhi_index = 3;

        // this.unscheduleAllCallbacks();
        this.RefreashPigs();

    }

    Fail(isPeiQi: boolean) {

        return () => {

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

    ele(callback?: () => void) {
        let toggle = false;
        this.schedule(() => {
            if (toggle) {
                XZPQ_GameManager.Instance.mon_1.pig_2.active = false;
                XZPQ_GameManager.Instance.mon_1.pig_3.active = true;
            } else {
                XZPQ_GameManager.Instance.mon_1.pig_2.active = true;
                XZPQ_GameManager.Instance.mon_1.pig_3.active = false;
            }
            toggle = !toggle;
        }, 0.1);

        this.schedule(() => {
            XZPQ_GameManager.Instance.mon_1.pig_2.active = true;
            XZPQ_GameManager.Instance.mon_1.pig_3.active = false;
            callback();
        }, 2); // 2秒后停止切换
    }
}


