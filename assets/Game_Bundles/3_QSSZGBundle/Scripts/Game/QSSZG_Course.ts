import { _decorator, Component, EventTouch, Node, tween, v3 } from 'cc';
import { QSSZG_Panel, QSSZG_ShowPanel } from './QSSZG_ShowPanel';
import { QSSZG_AudioManager } from '../QSSZG_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('QSSZG_Course')
export class QSSZG_Course extends Component {
    public index: number = 0;
    start() {

    }
    Show() {
        this.Windows_InorOut(true);

    }

    OnButtonClick(btn: EventTouch) {
        QSSZG_AudioManager.AudioPlay("点击", 0);
        switch (btn.target.name) {
            case "关闭":
                this.Windows_InorOut(false);
                break;
            case "左翻页":
                this.index = --this.index < 0 ? 4 : this.index;
                this.ChangeIndex();
                break;
            case "右翻页":
                this.index = ++this.index > 4 ? 0 : this.index;
                this.ChangeIndex();
                break;
        }
    }


    //窗口滑出
    Windows_InorOut(isIn: boolean) {
        if (isIn) {
            this.node.setPosition(0, -1200, 0);
            tween(this.node)
                .to(0.4, { position: v3(0, 0, 0) }, { easing: "backOut" })
                .start();
        } else {
            tween(this.node)
                .to(0.4, { position: v3(0, -1200, 0) }, { easing: "backIn" })
                .call(() => {
                    QSSZG_ShowPanel.Instance.HidePanel(QSSZG_Panel.教程界面);
                })
                .start();
        }
    }

    ChangeIndex() {
        this.node.getChildByPath("Node/sprite").children.forEach((cd, index) => {
            cd.active = index == this.index ? true : false;
        })
    }
}


