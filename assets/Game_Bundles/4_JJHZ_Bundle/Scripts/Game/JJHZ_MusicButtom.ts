import { _decorator, Component, Node, tween, v2, v3 } from 'cc';
import { JJHZ_Player } from './JJHZ_Player';
import { JJHZ_EventManager, JJHZ_MyEvent } from '../JJHZ_EventManager';
const { ccclass, property } = _decorator;

@ccclass('JJHZ_MusicButtom')
export class JJHZ_MusicButtom extends Component {
    @property()
    public ID: number = 0;//音乐ID


    start() {
        JJHZ_EventManager.on(JJHZ_MyEvent.RemoveMusic, (id: number) => { this.ReStar(id); }, this);
    }
    //上状态
    public SetState(Playernd: Node) {
        Playernd.getComponent(JJHZ_Player).SetState(this.ID);
        this.node.getChildByName("灰白层").active = true;
        this.scheduleOnce(() => {
            this.node.getChildByName("颜色层").active = false;
        })
    }

    //回复可拖拽
    public ReStar(id: number) {
        if (id == this.ID) {
            this.node.getChildByName("灰白层").active = false;
            this.node.getChildByName("颜色层").active = true;
            tween(this.node.getChildByName("颜色层"))
                .to(0.2, { scale: v3(1.2, 1.2, 1.2) }, { easing: "backOut" })
                .to(0.2, { scale: v3(1, 1, 1) }, { easing: "backOut" })
                .start();
        }
    }
}


