import { _decorator, Component, director, EventTouch, Label, Node, Sprite } from 'cc';
import { SJZXD_GameManager } from './SJZXD_GameManager';
import { SJZXD_EventManager } from './SJZXD_EventManager';
import Banner from '../../../Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_MedicalKit')
export class SJZXD_MedicalKit extends Component {
    start() {
        this.Show();
    }
    private Cd: number = 0;//使用CD
    protected update(dt: number): void {
        if (this.Cd > 0) {
            this.Cd -= dt;
            this.node.children.forEach((element, index) => {
                element.getChildByName("CD").getComponent(Sprite).fillRange = this.Cd / 5;
            })
        }
    }
    OnButtonClick(event: EventTouch) {
        if (this.Cd > 0) return;
        let id = 0;
        switch (event.target.name) {
            case "大药箱":
                id = 2;
                break;
            case "小药箱":
                id = 1;
                break;
            case "绷带":
                id = 0;
                break;
        }
        if (SJZXD_GameManager.Instance.MedicalKit[id] > 0) {
            SJZXD_GameManager.Instance.MedicalKit[id]--;
            director.getScene().emit(SJZXD_EventManager.主角使用血包, id);
            this.Cd = 5;
        } else {
            Banner.Instance.ShowVideoAd(() => {
                director.getScene().emit(SJZXD_EventManager.主角使用血包, id);
                this.Cd = 5;
            })
        }
        this.Show();
    }

    Show() {
        this.node.children.forEach((element, index) => {
            if (SJZXD_GameManager.Instance.MedicalKit[index] > 0) {
                element.getChildByName("视频角标").active = false;
                element.getChildByName("次数").active = true;
                element.getChildByPath("次数/数量").getComponent(Label).string = `${SJZXD_GameManager.Instance.MedicalKit[index]}`;
            } else {
                element.getChildByName("视频角标").active = true;
                element.getChildByName("次数").active = false;
            }
        });

    }
}


