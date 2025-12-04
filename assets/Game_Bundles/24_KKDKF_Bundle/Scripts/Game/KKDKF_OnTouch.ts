import { _decorator, Animation, Component, EventTouch, instantiate, Node, Prefab } from 'cc';
import { KKDKF_GameManager } from './KKDKF_GameManager';
import { KKDKF_Incident } from '../KKDKF_Incident';
import { KKDKF_EventManager, KKDKF_MyEvent } from '../KKDKF_EventManager';
import { KKDKF_Place } from './KKDKF_Place';
import { KKDKF_CoffeeGroove } from './KKDKF_CoffeeGroove';
import { KKDKF_Cup } from './KKDKF_Cup';
const { ccclass, property } = _decorator;

@ccclass('KKDKF_OnTouch')
export class KKDKF_OnTouch extends Component {
    @property()
    public ID: number = 0; //0碗1小杯子2咖啡机触发3奶壶触发4大杯子触发

    start() {
        this.node.on(Node.EventType.TOUCH_START, (TouchData: EventTouch) => {
            this.OnTouchStar(TouchData);
        }, this);


    }

    //按键按下
    OnTouchStar(TouchData: EventTouch) {
        if (this.ID == 0) {
            this.Load_Wang();
        }
        if (this.ID == 1) {
            this.Load_smallcup();
        }
        if (this.ID == 2) {
            this.OnCoffeeClick();
        }
        if (this.ID == 3) {
            this.Load_milkcup();
        }
        if (this.ID == 4) {
            this.Load_Bigcup();
        }
    }

    //生产一块碗
    Load_Wang() {
        if (!KKDKF_GameManager.Instance.MakeBG.getChildByName("咖啡机放置处").getComponent(KKDKF_Place).IsHaveCpu) {
            KKDKF_Incident.Loadprefab("Prefabs/碗").then((pf: Prefab) => {
                let nd = instantiate(pf);
                nd.setParent(KKDKF_GameManager.Instance.MakeBG);
                nd.setWorldPosition(this.node.getWorldPosition());
                KKDKF_GameManager.Instance.MakeBG.getChildByName("咖啡机放置处").getComponent(KKDKF_Place).Movethis(nd);
            })
        }
    }
    //生产一杯子
    Load_smallcup() {
        if (!KKDKF_GameManager.Instance.MakeBG.getChildByName("咖啡机放置处").getComponent(KKDKF_Place).IsHaveCpu) {
            KKDKF_EventManager.Scene.emit(KKDKF_MyEvent.生产杯子);
            KKDKF_Incident.Loadprefab("Prefabs/杯子").then((pf: Prefab) => {
                let nd = instantiate(pf);
                nd.setParent(KKDKF_GameManager.Instance.MakeBG);
                nd.setWorldPosition(this.node.getWorldPosition());
                KKDKF_GameManager.Instance.MakeBG.getChildByName("咖啡机放置处").getComponent(KKDKF_Place).Movethis(nd);
            })
        }
    }
    //生产一奶壶
    Load_milkcup() {
        if (!KKDKF_GameManager.Instance.MakeBG.getChildByName("咖啡机放置处").getComponent(KKDKF_Place).IsHaveCpu) {
            KKDKF_Incident.Loadprefab("Prefabs/牛奶杯").then((pf: Prefab) => {
                let nd = instantiate(pf);
                nd.setParent(KKDKF_GameManager.Instance.MakeBG);
                nd.setWorldPosition(this.node.getWorldPosition());
                KKDKF_GameManager.Instance.MakeBG.getChildByName("咖啡机放置处").getComponent(KKDKF_Place).Movethis(nd);
            })
        }
    }

    Load_Bigcup() {
        let target: Node = null;
        if (!KKDKF_GameManager.Instance.MakeBG.getChildByName("一号放置处").getComponent(KKDKF_Place).IsHaveCpu) {
            target = KKDKF_GameManager.Instance.MakeBG.getChildByName("一号放置处");
        } else if (!KKDKF_GameManager.Instance.MakeBG.getChildByName("二号放置处").getComponent(KKDKF_Place).IsHaveCpu) {
            target = KKDKF_GameManager.Instance.MakeBG.getChildByName("二号放置处");
        } else if (!KKDKF_GameManager.Instance.MakeBG.getChildByName("三号放置处").getComponent(KKDKF_Place).IsHaveCpu) {
            target = KKDKF_GameManager.Instance.MakeBG.getChildByName("三号放置处");
        }
        if (target) {
            KKDKF_EventManager.Scene.emit(KKDKF_MyEvent.生产大杯子);
            KKDKF_Incident.Loadprefab("Prefabs/大杯子").then((pf: Prefab) => {
                let nd = instantiate(pf);
                nd.setParent(KKDKF_GameManager.Instance.MakeBG);
                nd.setWorldPosition(this.node.getWorldPosition());
                target.getComponent(KKDKF_Place).Movethis(nd);
            })
        }
    }

    //点击咖啡机
    OnCoffeeClick() {
        let kfc = KKDKF_GameManager.Instance.MakeBG.getChildByName("咖啡槽");
        if (kfc.getComponent(KKDKF_CoffeeGroove).State == 2 && kfc.getComponent(KKDKF_CoffeeGroove).IshaveCoffemachine) {
            kfc.getComponent(KKDKF_CoffeeGroove).IsEnable = false;
            KKDKF_GameManager.FindOfBG("咖啡机触发/咖啡动画").active = true;
            this.scheduleOnce(() => {
                KKDKF_GameManager.FindOfBG("咖啡机触发/咖啡动画").active = false;
                kfc.getComponent(KKDKF_CoffeeGroove).SetState(0);
                kfc.getComponent(KKDKF_CoffeeGroove).IsEnable = true;
                KKDKF_EventManager.Scene.emit(KKDKF_MyEvent.点击咖啡机按钮);
            }, 2)
            if (KKDKF_GameManager.FindOfBG("咖啡机放置处").getComponent(KKDKF_Place).IsHaveCpu) {
                KKDKF_GameManager.FindOfBG("咖啡机放置处").getComponent(KKDKF_Place).Cup.getComponent(KKDKF_Cup).Add_Coffee();
            }
        }

    }
}


