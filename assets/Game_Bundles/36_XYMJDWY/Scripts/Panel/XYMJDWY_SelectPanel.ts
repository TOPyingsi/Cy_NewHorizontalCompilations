import { _decorator, Component, director, EventTouch, Node } from 'cc';
import { XYMJDWY_Constant } from '../XYMJDWY_Constant';
import { XYMJDWY_AudioManager } from '../XYMJDWY_AudioManager';
import { XYMJDWY_GameData } from '../XYMJDWY_GameData';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { XYMJDWY_Incident } from '../XYMJDWY_Incident';
const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_SelectPanel')
export class XYMJ_SeleXYMJDWY_SelectPanelctPanel extends Component {
    start() {

    }
    protected onEnable(): void {
        XYMJDWY_Constant.level = 1;
        this.ShowState();
    }
    OnExit() {
        XYMJDWY_AudioManager.globalAudioPlay("点击");
        this.node.active = false;
    }
    private MinMoney: number[] = [0, 5000000, 50000000, 300000000, 2000000000];
    //验资
    Verificationassets(id: number) {
        if (XYMJDWY_GameData.Instance.Money >= this.MinMoney[id]) {
            XYMJDWY_Constant.level = id + 1;
            this.ShowState();
        } else {
            UIManager.ShowTip(`此难度需要现金资产达到${XYMJDWY_Incident.GetMaxNum(this.MinMoney[id])}才能进入！`);
        }
    }

    OnClick(Btn: EventTouch) {
        XYMJDWY_AudioManager.globalAudioPlay("点击");
        switch (Btn.target.name) {
            case "小学部":
            case "初中部":
            case "高中部":
            case "天文台":
            case "休闲区":
            case "实验楼":
            case "体育馆":
            case "食堂":
            case "商场":
                XYMJDWY_Constant.mapID = Btn.target.name;
                director.loadScene("XYMJDWY_Game");
                break;
            case "新手": this.Verificationassets(0); break;
            case "简单": this.Verificationassets(1); break;
            case "普通": this.Verificationassets(2); break;
            case "困难": this.Verificationassets(3); break;
            case "地狱": this.Verificationassets(4); break;
        }


    }

    ShowState() {
        let nd = this.node.getChildByPath("难度选择/选中框");
        nd.y = 320 - ((XYMJDWY_Constant.level - 1) * 160);
    }
}


