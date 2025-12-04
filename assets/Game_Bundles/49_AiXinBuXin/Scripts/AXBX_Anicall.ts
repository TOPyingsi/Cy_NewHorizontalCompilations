import { _decorator, Component, Node, SkeletalAnimation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AXBX_Anicall')
export class AXBX_Anicall extends Component {
    start() {

    }

    AniOver() {
        this.node.getComponent(SkeletalAnimation).play("idle");
    }
    private Listennums = 0;
    ListenOver() {
        this.node.getComponent(SkeletalAnimation).play("ListenState");
    }
    ListenStateOver() {
        this.Listennums++;
        if (this.Listennums >= 7) {
            this.Listennums = 0;
            this.node.getComponent(SkeletalAnimation).play("idle");
        } else {
            this.node.getComponent(SkeletalAnimation).play("ListenState");
        }
    }
}


