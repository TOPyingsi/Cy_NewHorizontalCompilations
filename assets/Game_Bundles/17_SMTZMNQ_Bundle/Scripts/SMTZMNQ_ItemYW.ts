import { _decorator, Component, Enum, EventTouch, Node } from 'cc';
import { SMTZMNQ_BUTTONTYPE, SMTZMNQ_YW } from './SMTZMNQ_Constant';
import { SMTZMNQ_UIPanel } from './SMTZMNQ_UIPanel';
import { SMTZMNQ_BodyManager } from './SMTZMNQ_BodyManager';
import { SMTZMNQ_YWPanel } from './SMTZMNQ_YWPanel';
const { ccclass, property } = _decorator;

@ccclass('SMTZMNQ_ItemYW')
export class SMTZMNQ_ItemYW extends Component {

    @property({ type: Enum(SMTZMNQ_YW) })
    Type: SMTZMNQ_YW = SMTZMNQ_YW.肾上腺素;

    @property({ type: Enum(SMTZMNQ_BUTTONTYPE) })
    ButtonType: SMTZMNQ_BUTTONTYPE = SMTZMNQ_BUTTONTYPE.口服;

    protected onLoad(): void {
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchEnd(event: EventTouch) {
        SMTZMNQ_UIPanel.Instance.CloseTargetPanel();
        if (this.ButtonType == SMTZMNQ_BUTTONTYPE.注射 || this.ButtonType == SMTZMNQ_BUTTONTYPE.肌肉注射 ||
            this.ButtonType == SMTZMNQ_BUTTONTYPE.输液 || this.ButtonType == SMTZMNQ_BUTTONTYPE.静脉注射) {
            SMTZMNQ_YWPanel.Instance.showPanel(this.GetEnumKeyByValue(SMTZMNQ_YW, this.Type), this.GetEnumKeyByValue(SMTZMNQ_BUTTONTYPE, this.ButtonType));
        } else {
            SMTZMNQ_YWPanel.Instance.Eat();
            SMTZMNQ_BodyManager.Instance.showName(`${this.GetEnumKeyByValue(SMTZMNQ_BUTTONTYPE, this.ButtonType)}${this.GetEnumKeyByValue(SMTZMNQ_YW, this.Type)}`, 2);
            // console.error();
        }
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


