import { _decorator, Component, director, Node } from 'cc';
import { CPMS_GameUI } from './CPMS_GameUI';
const { ccclass, property } = _decorator;

@ccclass('CPMS_AniEvent')
export class CPMS_AniEvent extends Component {
    start() {

    }

    update(deltaTime: number) {

    }

    Finish() {
        this.node.active = false;
        CPMS_GameUI.Instance.Init();
    }
}


