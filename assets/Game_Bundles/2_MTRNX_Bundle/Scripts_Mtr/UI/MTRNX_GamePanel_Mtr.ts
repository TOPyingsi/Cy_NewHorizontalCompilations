import { _decorator, Button, Canvas, Component, Enum, find, game, instantiate, Label, Node, Prefab, ProgressBar, RichText, Tween, tween, UIOpacity, v3, Vec3 } from 'cc';
import { MTRNX_EventManager, MTRNX_MyEvent } from '../MTRNX_EventManager';
import { MTRNX_GameManager } from '../MTRNX_GameManager';
import { MTRNX_Constant, MTRNX_GameMode, MTRNX_JKType } from '../Data/MTRNX_Constant';
import { MTRNX_StartPanel } from './MTRNX_StartPanel';
import { MTRNX_Panel, MTRNX_UIManager } from '../MTRNX_UIManager';
import { MTRNX_ResourceUtil } from '../Utils/MTRNX_ResourceUtil';
import { MTRNX_JKItem } from './MTRNX_JKItem';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_GamePanel_Mtr')
export class MTRNX_GamePanel_Mtr extends Component {
    jkTypeContent: Node = null;
    jkTypeContent2: Node = null;

    redBloodBar: ProgressBar = null;
    redBloodLb: Label = null;
    blueBloodBar: ProgressBar = null;
    blueBloodLb: Label = null;

    dialog: Node = null;
    dialogLb: RichText = null;
    dialogOpacity: UIOpacity = null;

    endlessNd: Node = null;
    scoreBar: ProgressBar = null;
    score: Node = null;
    scoreLb: Label = null;

    protected onLoad(): void {
        this.jkTypeContent = find("JKTypeContent", this.node);
        this.jkTypeContent2 = find("JKTypeContent2", this.node);
        this.redBloodBar = find("RedBloodBar", this.node).getComponent(ProgressBar);
        this.redBloodLb = find("RedBloodBar/Label", this.node).getComponent(Label);
        this.blueBloodBar = find("BlueBloodBar", this.node).getComponent(ProgressBar);
        this.blueBloodLb = find("BlueBloodBar/Label", this.node).getComponent(Label);

        this.endlessNd = find("Endless", this.node);
        this.scoreBar = find("Endless/ProgressBar", this.node).getComponent(ProgressBar);
        this.score = find("Score", this.node);
        this.scoreLb = find("Score/Label", this.node).getComponent(Label);

        this.dialog = find("Dialog", this.node);
        this.dialogLb = find("Dialog/Label", this.node).getComponent(RichText);
        this.dialogOpacity = this.dialogLb.getComponent(UIOpacity);
    }

    protected onDisable(): void {
        MTRNX_EventManager.off(MTRNX_MyEvent.ScoreChanged, this.RefreshScore, this);
        MTRNX_EventManager.off(MTRNX_MyEvent.RefrshRedHp, this.RefreshRedBloodBar, this);
        MTRNX_EventManager.off(MTRNX_MyEvent.RefrshBlueHp, this.RefreshBlueBloodBar, this);
        MTRNX_EventManager.off(MTRNX_MyEvent.StartAddRewardTimer, this.StartAddRewardTimer, this);
        MTRNX_EventManager.off(MTRNX_MyEvent.ShowWarning, this.ShowWarning, this);
        MTRNX_EventManager.off(MTRNX_MyEvent.StopAddRewardTimer, this.StopAddRewardTimer, this);
    }

    Show(showScience: boolean = true) {
        this.onDisable();
        MTRNX_EventManager.on(MTRNX_MyEvent.RefrshRedHp, this.RefreshRedBloodBar, this);
        MTRNX_EventManager.on(MTRNX_MyEvent.ShowWarning, this.ShowWarning, this);
        MTRNX_EventManager.on(MTRNX_MyEvent.ScoreChanged, this.RefreshScore, this);

        this.blueBloodBar.node.active = MTRNX_GameManager.GameMode == MTRNX_GameMode.Normal || MTRNX_GameManager.GameMode == MTRNX_GameMode.背后能源;
        this.redBloodBar.node.active = !(MTRNX_GameManager.GameMode == MTRNX_GameMode.Massacre && MTRNX_StartPanel.IsBoss);
        this.endlessNd.active = MTRNX_GameManager.GameMode == MTRNX_GameMode.Endless;
        this.node.getChildByName("Science").active = showScience;
        let data;
        switch (MTRNX_GameManager.GameMode) {
            case MTRNX_GameMode.Normal:
                MTRNX_EventManager.on(MTRNX_MyEvent.RefrshBlueHp, this.RefreshBlueBloodBar, this);
                data = MTRNX_Constant.Dialog.find(e => e.Lv == MTRNX_GameManager.Lv);
                break;
            case MTRNX_GameMode.背后能源:
                MTRNX_EventManager.on(MTRNX_MyEvent.RefrshBlueHp, this.RefreshBlueBloodBar, this);
                this.node.getChildByPath("Science").getComponent(Button).enabled = false;
                this.node.getChildByPath("Science/Video").active = false;
                break;
            case MTRNX_GameMode.Endless:
                MTRNX_EventManager.on(MTRNX_MyEvent.StartAddRewardTimer, this.StartAddRewardTimer, this);
                MTRNX_EventManager.on(MTRNX_MyEvent.StopAddRewardTimer, this.StopAddRewardTimer, this);
                data = MTRNX_Constant.EndlessDialog.find(e => e.Lv == MTRNX_GameManager.Lv);
                break;
        }


        if (data && data.HaveDialog) {
            MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.DialogPanel, [data, () => {
                this.ShowWarning(MTRNX_WarningType.Begin, () => { });
                MTRNX_EventManager.Scene.emit(MTRNX_MyEvent.StartAddRewardTimer);
            }]);
        } else {
            this.ShowWarning(MTRNX_WarningType.Begin, () => { });
            MTRNX_EventManager.Scene.emit(MTRNX_MyEvent.StartAddRewardTimer);
        }

        this.score.active = MTRNX_GameManager.GameMode == MTRNX_GameMode.Endless || MTRNX_GameManager.GameMode == MTRNX_GameMode.Massacre;
        this.InitJKItems();

    }

    InitJKItems() {
        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Massacre) return;
        let data: number[][];
        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Normal) {  //关卡卡牌数据初始化
            data = MTRNX_Constant.SceneJKData[MTRNX_GameManager.Lv];
        }
        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Endless) {
            data = MTRNX_Constant.SceneEndlessJKData[MTRNX_GameManager.Lv];
        }
        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.背后能源) {
            data = MTRNX_Constant.MiniSceneJKData[0];
        }

        for (let i = 0; i < data[0].length; i++) {
            MTRNX_ResourceUtil.LoadPrefab("UI/JKItem").then((prefab: Prefab) => {
                let node = instantiate(prefab);
                node.setParent(this.jkTypeContent);
                let item = node.getComponent(MTRNX_JKItem);
                item.Init(data[0][i], this.OnJKItemCallback);
            });
        }
        for (let i = 0; i < data[1].length; i++) {
            MTRNX_ResourceUtil.LoadPrefab("UI/JKItem").then((prefab: Prefab) => {
                let node = instantiate(prefab);
                node.setParent(this.jkTypeContent2);
                let item = node.getComponent(MTRNX_JKItem);
                item.Init(data[1][i], this.OnJKItemCallback);
            });
        }
    }

    RefreshRedBloodBar(currentHp: number, totalHp: number) {
        this.redBloodLb.string = `${currentHp}/${totalHp}`;
        this.redBloodBar.progress = currentHp / totalHp;
    }

    RefreshBlueBloodBar(currentHp: number, totalHp: number) {
        this.blueBloodLb.string = `${currentHp}/${totalHp}`;
        this.blueBloodBar.progress = currentHp / totalHp;
    }

    OnJKItemCallback(type: MTRNX_JKType) {
        console.log(MTRNX_JKType[type]);
        if (MTRNX_GameManager.Instance.GameNode.getChildByName("我方单位").children.length <= 30) {
            MTRNX_ResourceUtil.LoadPrefab("Unit/" + MTRNX_JKType[type]).then((prefab: Prefab) => {
                if (MTRNX_JKType[type] == "激光监控人") {
                    for (let i = 0; i < 4; i++) {
                        let pre = instantiate(prefab);
                        pre.setParent(MTRNX_GameManager.Instance.GameNode.getChildByName("我方单位"));
                        pre.setPosition(pre.position.add(v3(-100 + i * 100)));
                    }
                } else {
                    instantiate(prefab).setParent(MTRNX_GameManager.Instance.GameNode.getChildByName("我方单位"));
                }
                if (MTRNX_JKType[type] == "泰坦监控人" || MTRNX_JKType[type] == "泰坦监控人2") {
                    MTRNX_AudioManager.AudioClipPlay("精英监控召唤");
                }
                else {
                    MTRNX_AudioManager.AudioClipPlay("普通监控召唤");
                }
            });
        }
        else {
            MTRNX_UIManager.HopHint("我方单位数量已达上限!");
        }
    }



    //#region 分数

    rewardTimer: number = 0;

    RefreshScore() {
        this.scoreLb.string = `${MTRNX_GameManager.Instance.Score}`;
    }

    RefreshReward() {
        this.scoreBar.progress = this.rewardTimer / MTRNX_Constant.MaxScoreReward;
    }

    AddRewardTimer() {
        this.rewardTimer++;
        if (this.rewardTimer >= MTRNX_Constant.MaxScoreReward) {
            this.rewardTimer = 0;
            MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.RewardPanel);
        }

        this.RefreshReward();
    }

    StartAddRewardTimer() {
        this.schedule(this.AddRewardTimer, 1);
    }

    StopAddRewardTimer() {
        this.unschedule(this.AddRewardTimer);
    }

    //#endregion

    //#region 宣言

    dialogIndex: number = 0;
    dialogs = [];
    dialogSizes = [];
    dialogEndCb: Function = null;
    dialogDone: boolean = false;
    warningType: MTRNX_WarningType;

    ShowWarning(type: MTRNX_WarningType, endCb: Function) {
        this.dialogDone = false;
        this.dialogEndCb = endCb;
        this.warningType = type;
        this.dialogIndex = 0;

        switch (type) {
            case MTRNX_WarningType.Begin:
                this.dialogs = MTRNX_Constant.WarningBegin;
                this.dialogSizes = MTRNX_Constant.WarningBeginSize;
                break;

            case MTRNX_WarningType.Win:
                this.dialogs = MTRNX_Constant.WarningWin;
                this.dialogSizes = MTRNX_Constant.WarningWinSize;
                break;

            case MTRNX_WarningType.Fail:
                this.dialogs = MTRNX_Constant.WarningFail;
                this.dialogSizes = MTRNX_Constant.WarningFailSize;
                break;
        }
        this.dialog.active = true;
        this.SetDialog();
    }

    SetDialog() {
        if (this.dialogIndex >= this.dialogs.length) {
            this.dialogDone = true;
            return;
        }

        Tween.stopAllByTarget(this.dialogOpacity);
        Tween.stopAllByTarget(this.dialogLb.node);

        this.dialogOpacity.opacity = 255;
        this.dialogLb.node.setScale(Vec3.ONE);
        this.dialogLb.lineHeight = this.dialogSizes[this.dialogIndex];
        this.dialogLb.string = `<size=${this.dialogSizes[this.dialogIndex]}><b><outline color=#880000 width = 15><color=#FF0000>${this.dialogs[this.dialogIndex]}</color></outline></b></size>`

        if (this.dialogIndex == this.dialogs.length - 1 && (this.warningType == MTRNX_WarningType.Fail || this.warningType == MTRNX_WarningType.Win)) {
            this.dialogDone = true;
            return;
        }

        tween(this.dialogOpacity).to(1, { opacity: 0 }).start();
        tween(this.dialogLb.node).to(1, { scale: v3(0.4, 0.4, 0.4) }).call(() => {
            this.dialogIndex++;

            if (this.dialogIndex == this.dialogs.length && this.warningType == MTRNX_WarningType.Begin) {
                this.dialog.active = false;
                this.dialogEndCb && this.dialogEndCb();
            }

            this.SetDialog();
        }).start();
    }

    OnDialogButtonClick() {
        if (this.dialogDone) {
            switch (this.warningType) {
                case MTRNX_WarningType.Begin:
                    this.dialog.active = false;
                    break;
            }

            this.dialogEndCb && this.dialogEndCb();
        }
    }

    //#endregion

}

export enum MTRNX_WarningType {
    Begin,
    Fail,
    Win
}