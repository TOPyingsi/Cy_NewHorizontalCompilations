import { _decorator, Component, director, EventTouch, Node } from 'cc';
import { XSHZ_EasyControllerEvent } from './XSHZ_EasyController';
import { XSHZ_GameManager } from './XSHZ_GameManager';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { XSHZ_AudioManager } from './XSHZ_AudioManager';
import { XSHZ_GameData } from './XSHZ_GameData';
const { ccclass, property } = _decorator;

@ccclass('XSHZ_SelectPanel')
export class XSHZ_SelectPanel extends Component {

    protected onEnable(): void {
        XSHZ_GameManager.TeamData = ["", "", "", "", "", ""];
        XSHZ_GameManager.SkillData = [0, 0, 0, 0, 0, 0];
        director.getScene().emit(XSHZ_EasyControllerEvent.通灵选择框选中, 0);
        director.getScene().emit(XSHZ_EasyControllerEvent.角色选择框选中, 0);
        if (XSHZ_GameData.Instance.GameData[2] == 0 && XSHZ_GameManager.GameMode != "无尽试炼") {//如果没有完成新手引导
            this.node.parent.getChildByName("新手引导").active = true;
        }
    }

    start() {
        director.getScene().on(XSHZ_EasyControllerEvent.选择界面切换页面, this.ChanggePage, this)
    }
    OnbuttonClick(Btn: EventTouch) {
        XSHZ_AudioManager.globalAudioPlay("按钮点击");
        switch (Btn.target.name) {
            case "忍者":
                this.ChanggePage("忍者");
                break;
            case "通灵":
                this.ChanggePage("通灵");
                break;
            case "开战":
                let Isready: boolean = true;
                let findindex: number[] = [];
                if (XSHZ_GameManager.GameMode == "1V1" || XSHZ_GameManager.GameMode == "演练" || XSHZ_GameManager.GameMode == "强者挑战") {
                    findindex = [0, 3];
                }
                if (XSHZ_GameManager.GameMode == "3V3") {
                    findindex = [0, 1, 2, 3, 4, 5];
                }
                if (XSHZ_GameManager.GameMode == "无尽试炼") {
                    findindex = [0];
                }
                //判断是否已经选择单位和技能
                for (let index = 0; index < findindex.length; index++) {
                    if (XSHZ_GameManager.TeamData[findindex[index]] == "") {
                        Isready = false;
                    }
                }
                if (Isready) {
                    XSHZ_GameManager.ReSetData();
                    director.loadScene("XSHZ_Game");
                } else {
                    UIManager.ShowTip("请先选择角色和技能后再开战！");
                }
                break;
        }
    }
    //切换页面
    ChanggePage(name: string) {
        if (name == "忍者") {
            this.node.getChildByPath("忍者/选中").active = true;
            this.node.getChildByPath("通灵/选中").active = false;
            this.node.getChildByName("忍者选择区").active = true;
            this.node.getChildByName("通灵选择区").active = false;
        }
        if (name == "通灵") {
            this.node.getChildByPath("通灵/选中").active = true;
            this.node.getChildByPath("忍者/选中").active = false;
            this.node.getChildByName("忍者选择区").active = false;
            this.node.getChildByName("通灵选择区").active = true;
        }

    }

    OnReturn() {
        XSHZ_AudioManager.globalAudioPlay("按钮点击");
        this.node.active = false;
    }
}


