import { _decorator, Component, Enum, Node } from 'cc';
import { WBSRL_GameManager } from './WBSRL_GameManager';
const { ccclass, property } = _decorator;

@ccclass('WBSRL_WindowPanel')
export class WBSRL_WindowPanel extends Component {

    @property(Node)
    Icons: Node[] = [];

    public Monologues: string[] = [];

    OpenWindow() {
        this.node.active = true;
        this.ShowIcon();
    }

    CloseWindow() {
        this.node.active = false;
    }

    ShowIcon() {
        for (let i = 0; i < this.Icons.length; i++) {
            this.Icons[i].active = WBSRL_GameManager.Instance.CurDay == i;
        }
    }
}


