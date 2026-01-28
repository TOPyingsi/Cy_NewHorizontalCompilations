import { _decorator, Component, find, Label, Node, RichText, Sprite, SpriteFrame } from 'cc';

import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import Banner from '../../../../Scripts/Banner';
import { MTRNX_Water_EventManager, MTRNX_Water_MyEvent } from '../MTRNX_Water_EventManager';
import { MTRNX_Water_Constant, MTRNX_Water_GameMode } from '../Data/MTRNX_Water_Constant';
import { MTRNX_Water_GameManager } from '../MTRNX_Water_GameManager';
import { MTRNX_Water_AudioManager } from '../MTRNX_Water_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_Science')
export class MTRNX_Water_Science extends Component {
    science: Sprite = null;
    video: Node = null;
    lvLabel: Label = null;
    speedLabel: Label = null;
    pointLabel: Label = null;
    upgrateText: RichText = null;

    protected onLoad(): void {
        this.science = this.node.getComponent(Sprite);
        this.lvLabel = find("LvLabel", this.node).getComponent(Label);
        this.speedLabel = find("SpeedLabel", this.node).getComponent(Label);
        this.pointLabel = find("Point/PointLabel", this.node).getComponent(Label);
        this.upgrateText = find("UpgrateLabel", this.node).getComponent(RichText);
        this.video = find("Video", this.node);
        MTRNX_Water_EventManager.on(MTRNX_Water_MyEvent.PointChanged, this.PointChanged, this);
    }

    protected start(): void {
        this.Refresh();
        this.PointChanged();
        if (MTRNX_Water_GameManager.GameMode == MTRNX_Water_GameMode.背后能源) {
            this.schedule(() => {
                this.PointChanged();
            }, 0.5)
        }
    }

    protected onDisable(): void {
        MTRNX_Water_EventManager.off(MTRNX_Water_MyEvent.PointChanged, this.PointChanged, this);
    }

    PointChanged() {
        this.pointLabel.string = `${MTRNX_Water_GameManager.Instance.Point}`;

        if (MTRNX_Water_GameManager.Instance.scienceLv < MTRNX_Water_Constant.MaxScience) {

        }

        if (MTRNX_Water_GameManager.Instance.scienceLv < MTRNX_Water_Constant.MaxScience) {
            this.upgrateText.string = `<b><outline color=black width=3><color=${MTRNX_Water_GameManager.Instance.Point >= MTRNX_Water_Constant.ScienceCost[MTRNX_Water_GameManager.Instance.scienceLv] ? "#FFFFFF" : "#FF0000"}>升级（${MTRNX_Water_Constant.ScienceCost[MTRNX_Water_GameManager.Instance.scienceLv]}）</color></outline></b>`;

            if (this.video.active != MTRNX_Water_GameManager.Instance.Point < MTRNX_Water_Constant.ScienceCost[MTRNX_Water_GameManager.Instance.scienceLv]) {
                this.video.active = MTRNX_Water_GameManager.Instance.Point < MTRNX_Water_Constant.ScienceCost[MTRNX_Water_GameManager.Instance.scienceLv];
            }
        }
    }

    OnUpgrateButtonClick() {
        //看视频加等级
        MTRNX_Water_AudioManager.AudioClipPlay("按钮点击");
        if (MTRNX_Water_GameManager.Instance.scienceLv < MTRNX_Water_Constant.MaxScience && MTRNX_Water_GameManager.Instance.Point < MTRNX_Water_Constant.ScienceCost[MTRNX_Water_GameManager.Instance.scienceLv]) {
            Banner.Instance.ShowVideoAd(() => {
                MTRNX_Water_GameManager.Instance.scienceLv += 1;
                MTRNX_Water_AudioManager.AudioClipPlay("科技升级");
                this.Refresh();
            });
            return;
        }

        if (MTRNX_Water_GameManager.Instance.scienceLv < MTRNX_Water_Constant.MaxScience && MTRNX_Water_GameManager.Instance.Point >= MTRNX_Water_Constant.ScienceCost[MTRNX_Water_GameManager.Instance.scienceLv]) {
            MTRNX_Water_GameManager.Instance.Point -= MTRNX_Water_Constant.ScienceCost[MTRNX_Water_GameManager.Instance.scienceLv];
            MTRNX_Water_GameManager.Instance.scienceLv += 1;
            MTRNX_Water_AudioManager.AudioClipPlay("科技升级");
            this.Refresh();
        }
    }

    Refresh() {
        this.lvLabel.string = `科技等级${MTRNX_Water_GameManager.Instance.scienceLv}`;
        this.speedLabel.string = `${MTRNX_Water_GameManager.Instance.GetAddPointPreSecond()}/s`;

        BundleManager.LoadSpriteFrame("56_MTRNX_Water_Bundle", `Icons/Science_${MTRNX_Water_GameManager.Instance.scienceLv}`).then((sp: SpriteFrame) => {
            this.science.spriteFrame = sp;
        })

        if (MTRNX_Water_GameManager.Instance.scienceLv >= MTRNX_Water_Constant.MaxScience) {
            this.upgrateText.string = `<b><outline color=black width=3><color=#FF0000>已满级</color></outline></b>`;
            this.video.active = false;
        }
    }

}


