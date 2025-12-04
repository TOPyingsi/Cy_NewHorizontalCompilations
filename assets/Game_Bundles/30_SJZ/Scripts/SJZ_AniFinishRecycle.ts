import { _decorator, Component, Animation } from 'cc';
import { SJZ_PoolManager } from './SJZ_PoolManager';
const { ccclass, property } = _decorator;


@ccclass('SJZ_AniFinishRecycle')
export default class SJZ_AniFinishRecycle extends Component {
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
        SJZ_PoolManager.Instance.Put(this.node);
    }
}