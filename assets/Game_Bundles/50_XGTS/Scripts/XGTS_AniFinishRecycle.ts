import { _decorator, Component, Animation } from 'cc';
import { XGTS_PoolManager } from './XGTS_PoolManager';
const { ccclass, property } = _decorator;


@ccclass('XGTS_AniFinishRecycle')
export default class XGTS_AniFinishRecycle extends Component {
    ani: Animation | null = null;
    protected onEnable(): void {
        this.ani = this.node.getComponent(Animation);
        this.ani.on(Animation.EventType.FINISHED, this.Put, this);
        this.ani.play();
    }
    protected onDisable(): void {
        this.ani?.off(Animation.EventType.FINISHED, this.Put, this);
    }
    Put() {
        XGTS_PoolManager.Instance.Put(this.node);
    }
}