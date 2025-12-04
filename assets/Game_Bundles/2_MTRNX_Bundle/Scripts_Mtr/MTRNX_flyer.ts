import { _decorator, Component, instantiate, Node, Prefab, resources, v3 } from 'cc';

import Banner from '../../../Scripts/Banner';
import { MTRNX_GameManager } from './MTRNX_GameManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_flyer')
export class MTRNX_flyer extends Component {
    public Isleft: boolean = false;
    public IsUp: boolean = false;
    start() {

    }

    update(deltaTime: number) {
        this.node.setPosition(v3(this.node.position.x + (this.Isleft ? -100 : 100) * deltaTime, this.node.position.y + (this.IsUp ? 100 : -100) * deltaTime, 0));
        if (this.node.position.x > 1400) {
            this.Isleft = true;
            this.node.setScale(v3(1, 1, 1))
            this.node.getChildByName("提示").setScale(v3(1, 1, 1))
        } else if (this.node.position.x < -1400) {
            this.Isleft = false;
            this.node.setScale(v3(-1, 1, 1))
            this.node.getChildByName("提示").setScale(v3(-1, 1, 1))
        }
        if (this.node.position.y > 500) {
            this.IsUp = false;
        } else if (this.node.position.y < 300) {
            this.IsUp = true;
        }
    }

    //按下
    OnClick() {
        Banner.Instance.ShowVideoAd(() => {
            MTRNX_GameManager.Instance.noCD = true;
        })
        this.node.destroy();
    }
}


