import { _decorator, Button, Component, EventHandler, Label, Node, Sprite, SpriteFrame } from 'cc';
import { MTRNX_Water_RewardType } from '../Data/MTRNX_Water_Constant';
import { MTRNX_Water_AudioManager } from '../MTRNX_Water_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_RewardItem')
export class MTRNX_Water_RewardItem extends Component {
    label: Label = null;

    type: MTRNX_Water_RewardType = null;
    cb: Function = null;

    protected onLoad(): void {
        this.label = this.node.getChildByName("Label").getComponent(Label);

        const clickEventHandler = new EventHandler();
        clickEventHandler.target = this.node;// 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = 'RewardItem';// 这个是脚本类名
        clickEventHandler.handler = 'OnButtonClick';
        const button = this.node.getComponent(Button);
        button.clickEvents.push(clickEventHandler);
    }

    Init(index: number, type: MTRNX_Water_RewardType, cb: Function) {
        this.type = type;
        this.cb = cb;
        this.label.string = `${index}. ${type}`;
    }

    OnButtonClick() {
        MTRNX_Water_AudioManager.AudioClipPlay("按钮点击");
        this.cb && this.cb(this.type);
    }

}