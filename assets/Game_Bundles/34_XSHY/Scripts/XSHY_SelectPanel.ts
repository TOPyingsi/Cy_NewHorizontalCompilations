import { _decorator, Component, director, EventTouch, Node } from 'cc';
import { XSHY_EasyControllerEvent } from './XSHY_EasyController';
import { XSHY_GameManager } from './XSHY_GameManager';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { XSHY_AudioManager } from './XSHY_AudioManager';
import { XSHY_GameData } from './XSHY_GameData';
const { ccclass, property } = _decorator;

@ccclass('XSHY_SelectPanel')
export class XSHY_SelectPanel extends Component {

    protected onEnable(): void {
        XSHY_GameManager.TeamData = ["", "", "", "", "", ""];
        XSHY_GameManager.SkillData = [0, 0, 0, 0, 0, 0];
        director.getScene().emit(XSHY_EasyControllerEvent.通灵选择框选中, 0);
        director.getScene().emit(XSHY_EasyControllerEvent.角色选择框选中, 0);
        if (XSHY_GameData.Instance.GameData[2] == 0 && XSHY_GameManager.GameMode != "无尽试炼") {//如果没有完成新手引导
            this.node.parent.getChildByName("新手引导").active = true;
        }
    }

    start() {
        director.getScene().on(XSHY_EasyControllerEvent.选择界面切换页面, this.ChanggePage, this)
    }
    OnbuttonClick(Btn: EventTouch) {
        XSHY_AudioManager.globalAudioPlay("按钮点击");
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
                if (XSHY_GameManager.GameMode == "1V1" || XSHY_GameManager.GameMode == "演练" || XSHY_GameManager.GameMode == "强者挑战") {
                    findindex = [0, 3];
                }
                if (XSHY_GameManager.GameMode == "3V3") {
                    findindex = [0, 1, 2, 3, 4, 5];
                }
                if (XSHY_GameManager.GameMode == "无尽试炼") {
                    findindex = [0];
                }
                //判断是否已经选择单位和技能
                for (let index = 0; index < findindex.length; index++) {
                    if (XSHY_GameManager.TeamData[findindex[index]] == "") {
                        Isready = false;
                    }
                }
                if (Isready) {
                    XSHY_GameManager.ReSetData();
                    director.loadScene("XSHY_Game");
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
        XSHY_AudioManager.globalAudioPlay("按钮点击");
        this.node.active = false;
    }
}


