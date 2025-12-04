import { _decorator, Component, Node, SkeletalAnimation } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DiggingAHole_Prison_prisoner')
export class DiggingAHole_Prison_prisoner extends Component {
    start() {
        this.scheduleOnce(() => { this.node.getComponent(SkeletalAnimation).play("Idle"); }, Math.random() * 2);
    }


}


