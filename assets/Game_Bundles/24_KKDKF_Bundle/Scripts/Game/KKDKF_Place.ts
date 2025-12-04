import { _decorator, Component, Node, tween } from 'cc';
import { KKDKF_Cup } from './KKDKF_Cup';
const { ccclass, property } = _decorator;

@ccclass('KKDKF_Place')
export class KKDKF_Place extends Component {
    public IsHaveCpu: boolean = false;//是否有东西放在这儿
    public Cup: Node = null;

    //将东西放在这儿
    public Movethis(nd: Node) {
        this.IsHaveCpu = true;
        this.Cup = nd;
        // this.Cup.getComponent(Cup).StarPosition = this.node.position.clone();
        this.scheduleOnce(() => {
            this.Cup.getComponent(KKDKF_Cup).OnWhere = this.node;
            this.Cup.getComponent(KKDKF_Cup).StarPosition = this.node.position.clone();
        })

        tween(nd)
            .to(0.5, { position: this.node.position.clone() })
            .start();
    }

    //东西离开
    public NdExit() {
        this.IsHaveCpu = false;
        this.Cup = null;
    }
}


