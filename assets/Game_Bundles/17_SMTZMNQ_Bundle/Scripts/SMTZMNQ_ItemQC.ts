import { _decorator, color, Component, Enum, find, Label, Node, Sprite, SpriteFrame } from 'cc';
import { SMTZMNQ_Body } from './SMTZMNQ_Body';
import { SMTZMNQ_BODY } from './SMTZMNQ_Constant';
import { SMTZMNQ_BodyManager } from './SMTZMNQ_BodyManager';
import { SMTZMNQ_UIPanel } from './SMTZMNQ_UIPanel';
import { SMTZMNQ_QCPanel } from './SMTZMNQ_QCPanel';
const { ccclass, property } = _decorator;

@ccclass('SMTZMNQ_ItemQC')
export class SMTZMNQ_ItemQC extends Component {
    @property
    Name: string = "";

    @property({ type: Enum(SMTZMNQ_BODY) })
    Body: SMTZMNQ_BODY = SMTZMNQ_BODY.甲状腺;

    Sprite: Sprite = null;
    NameLabel: Label = null;

    IsClick: boolean = false;

    protected onLoad(): void {
        this.Sprite = find("Icon", this.node).getComponent(Sprite);
        this.NameLabel = find("Name", this.node).getComponent(Label);
    }

    protected start(): void {
        this.NameLabel.string = this.Name;
    }

    click() {
        if (this.IsClick) {
            return;
        }
        this.IsClick = true;
        this.Sprite.color = color(122, 122, 122, 255);
        SMTZMNQ_UIPanel.Instance.CloseTargetPanel();
        SMTZMNQ_QCPanel.Instance.showPanel(this.GetEnumKeyByValue(SMTZMNQ_BODY, this.Body));
    }

    /** 根据枚举值找key*/
    GetEnumKeyByValue(enumObj: any, value: any): string | undefined {
        // 遍历枚举对象的键和值
        for (let key in enumObj) {
            if (enumObj[key] === value) {
                return key;
            }
        }
        return undefined; // 如果没有找到匹配的值，返回undefined
    }
}


