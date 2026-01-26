import { _decorator, Component, director, EventTouch, Label, Node } from 'cc';
import { SJZXD_UIManager } from './SJZXD_UIManager';
import { SJZXD_Constant } from './SJZXD_Constant';
import { SJZXD_GameData } from './SJZXD_GameData';
import { SJZXD_Incident } from './SJZXD_Incident';
import { SJZXD_EventManager } from './SJZXD_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_Boxroom')
export class SJZXD_Boxroom extends Component {
    @property(Node)
    Content: Node = null;



    start() {
        this.CalculateBoxroomMoney();
        director.getScene().on(SJZXD_EventManager.收藏馆物品变动, (Name: string) => {
            this.CalculateBoxroomMoney();
        });
    }
    //初始化
    Init() {
    }
    OnBuuttonClick(event: EventTouch) {
        switch (event.target.name) {
            case "返回":
                SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.LoadingPanel, ["SJZXD_Star"]);
                break;

        }
    }

    //收藏室累计金额重新计算
    public CalculateBoxroomMoney() {
        let money = 0;
        for (let i = 0; i < SJZXD_GameData.Instance.BoxroomData.length; i++) {
            let Level = SJZXD_GameData.Instance.BoxroomData[i].Level;
            money += Level * Level * SJZXD_Constant.getPropDataByName(SJZXD_GameData.Instance.BoxroomData[i].Name).price;
        }
        this.Content.getChildByPath("收藏室价值/价值").getComponent(Label).string = SJZXD_Incident.GetMaxNum(money);
    }
}


