import { _decorator, Component, director, Node } from 'cc';
import { HJMSJ_GameMgr } from '../HJMSJ_GameMgr';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_BOSSMgr')
export class HJMSJ_BOSSMgr extends Component {
    @property(Node)
    winNode: Node = null;

    start() {
        this.winNode.active = false;
        director.getScene().on("哈基米世界_Boss胜利", this.win, this);
        director.getScene().on("哈基米世界_返回村庄", this.returnMap, this);
    }

    win() {
        this.winNode.active = true;
    }

    returnMap() {
        this.destroy();
    }

}


