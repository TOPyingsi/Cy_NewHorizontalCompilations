import { _decorator, Component, find, Label, math, Node, size, UITransform } from 'cc';
import { CHATTYPE } from './NQXLC_Constant';
import { NQXLC_Level1 } from './NQXLC_Level1';
const { ccclass, property } = _decorator;

@ccclass('NQXLC_Chat')
export class NQXLC_Chat extends Component {

    UITransform: UITransform = null;
    Box: Node = null;
    Text: Label = null;

    protected onLoad(): void {
        this.UITransform = this.getComponent(UITransform);
        this.Box = find("消息/对话框", this.node);
        this.Text = find("消息/Text", this.node).getComponent(Label);
    }

    showText(text: string, chatType: CHATTYPE = CHATTYPE.LEFT) {
        this.Text.string = text;
        const length: number = text.length;
        if (length <= 0) return;
        let width: number = 0;
        if (length < 8) {
            width = length * 50 + 40;
        } else {
            width = 440;
        }
        let heigth: number = Math.floor((length - 1) / 8 + 1) * 60 + 25;
        this.UITransform.setContentSize(700, heigth + 75);
        this.Box.getComponent(UITransform).contentSize = size(width, heigth);
        if (chatType == CHATTYPE.RIGHT) this.Text.node.getComponent(UITransform).setContentSize(width - 40, heigth);
        NQXLC_Level1.Instance.contenAddHeight(heigth + 110);
    }
}


