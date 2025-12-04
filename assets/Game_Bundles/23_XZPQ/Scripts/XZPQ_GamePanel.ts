
import { _decorator, Component, Node, tween, Vec3, director, game, v3, AudioSource, Tween } from 'cc';
import { XZPQ_GameManager } from './XZPQ_GameManager';

const { ccclass, property } = _decorator;

@ccclass('XZPQ_GamePanel')
export class XZPQ_GamePanel extends Component {

    @property(Node)
    ElectFlow: Node = null;

    private isMon1ImageSwitched1: boolean = false;
    private isMon1ImageSwitched2: boolean = false;
    private isMon1ImageSwitched3: boolean = false;
    private isMon2ImageSwitched: boolean = false;
    private isMon3ImageSwitched: boolean = false;
    private isMon4ImageSwitched: boolean = false;

    protected update(dt: number): void {
        this.ElectFlow
    }

    help() {
        this.node.active = true;
    }

    electFlow() {
        console.log("人物复位");
        this.isMon1ImageSwitched1 = false;
        this.isMon1ImageSwitched2 = false;
        this.isMon1ImageSwitched3 = false;
        this.isMon2ImageSwitched = false;
        this.isMon3ImageSwitched = false;
        this.isMon4ImageSwitched = false;
    }

    gameFailButton() {
        director.loadScene("Start");
    }

}



