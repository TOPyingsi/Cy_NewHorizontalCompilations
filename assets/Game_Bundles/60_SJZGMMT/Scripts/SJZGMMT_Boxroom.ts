import { _decorator, Component, director, EventTouch, Label, Node } from 'cc';
import { SJZGMMT_UIManager } from './SJZGMMT_UIManager';
import { SJZGMMT_Constant } from './SJZGMMT_Constant';
import { SJZGMMT_GameData } from './SJZGMMT_GameData';
import { SJZGMMT_Incident } from './SJZGMMT_Incident';
import { SJZGMMT_EventManager } from './SJZGMMT_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_Boxroom')
export class SJZGMMT_Boxroom extends Component {
    @property(Node)
    Content: Node = null;
    private Index: number = 0;


    start() {
        this.CalculateBoxroomMoney();
        director.getScene().on(SJZGMMT_EventManager.收藏馆物品变动, (Name: string) => {
            this.CalculateBoxroomMoney();
        });
    }
    //初始化
    Init() {

    }
    OnBuuttonClick(event: EventTouch) {
        switch (event.target.name) {
            case "返回":
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.LoadingPanel, ["SJZGMMT_Star"]);
                break;
            case "左翻页":
                this.ChanggeIndex(-1);
                break;
            case "右翻页":
                this.ChanggeIndex(1);
                break;
        }
    }

    //翻页处理
    public ChanggeIndex(num: number) {
        this.Index += num;
        if (this.Index < 0) {
            this.Index = 0;
        }
        let maxindex = this.Content.getChildByName("Bg").children.length - 1;
        if (this.Index > maxindex) {
            this.Index = maxindex;
        }
        this.Content.getChildByName("Bg").children.forEach((element, index) => {
            element.active = index == this.Index;
        });
        this.Content.getChildByName("页码").getComponent(Label).string = `${this.Index + 1}/3`;
        this.Content.getChildByName("左翻页").active = this.Index > 0;
        this.Content.getChildByName("右翻页").active = this.Index < maxindex;
    }

    //收藏室累计金额重新计算
    public CalculateBoxroomMoney() {
        let money = 0;
        for (let i = 0; i < SJZGMMT_GameData.Instance.BoxroomData.length; i++) {
            let Level = SJZGMMT_GameData.Instance.BoxroomData[i].Level;
            money += Level * Level * SJZGMMT_Constant.getPropDataByName(SJZGMMT_GameData.Instance.BoxroomData[i].Name).price;
        }
        this.Content.getChildByPath("收藏室价值/价值").getComponent(Label).string = SJZGMMT_Incident.GetMaxNum(money);
    }
}


