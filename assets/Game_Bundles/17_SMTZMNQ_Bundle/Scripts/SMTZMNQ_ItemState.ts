import { _decorator, Component, find, Label, Node, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SMTZMNQ_ItemState')
export class SMTZMNQ_ItemState extends Component {

    @property
    content: string = "";

    UITransform: UITransform = null;
    Content: Label = null;

    protected onLoad(): void {
        this.UITransform = this.getComponent(UITransform);
        this.Content = find("内容", this.node).getComponent(Label);

        this.show(this.content);
    }

    show(content: string) {
        const length: number = content.length;
        this.UITransform.width = length * 60 + 60;
        this.Content.string = content;
    }
}


