import { _decorator, Component, director, find, game, Label, Node, Sprite, SpriteFrame, System } from 'cc';

import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import { MTRNX_Panel, MTRNX_UIManager } from '../MTRNX_UIManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_DialogPanel_Mtr')
export class MTRNX_DialogPanel_Mtr extends Component {

    dialogSp: Sprite = null;
    dialogLb: Label = null;
    charactorLb: Label = null;
    tip: Label = null;

    nowText: string = "";
    timer: number = 0;
    index: number = 0;
    cb: Function = null;
    dialogData: any = null;

    protected onLoad(): void {
        this.dialogSp = find("Dialog/CharactorSp", this.node).getComponent(Sprite);
        this.dialogLb = find("Dialog/DialogLb", this.node).getComponent(Label);
        this.charactorLb = find("Dialog/CharactorLb", this.node).getComponent(Label);
        this.tip = find("Dialog/Tip", this.node).getComponent(Label);
    }

    Show(data: any, cb: Function = null) {
        this.index = 0;
        this.cb = cb;
        this.dialogData = data;
        this.tip.node.active = false;

        // BundleManager.LoadSpriteFrame("2_MTRNX_Bundle", `Icons/Speaker_${this.dialogData.Speaker}`).then((sp: SpriteFrame) => {
        //     this.dialogSp.spriteFrame = sp;
        // })

        this.charactorLb.string = this.dialogData.Speaker;
        this.nowText = this.dialogData.Desc[0];

        this.tip.node.active = this.index >= this.dialogData.Desc.length - 1;
    }

    OnButtonClick(event, data) {
        switch (event.target.name) {
            case 'Mask':

                if (this.nowText && this.nowText.length != this.dialogLb.string.length) {
                    this.dialogLb.string = this.nowText;
                    this.nowText = null;
                    return;
                }

                this.index++;
                this.tip.node.active = this.index >= this.dialogData.Desc.length - 1;

                if (this.index >= this.dialogData.Desc.length) {
                    MTRNX_UIManager.Instance.HidePanel(MTRNX_Panel.DialogPanel);
                    this.nowText = null;
                    this.cb && this.cb();
                    return;
                }

                this.timer = 0;
                this.dialogLb.string = '';
                this.nowText = this.dialogData.Desc[this.index];
                break;
        }
    }

    protected update(dt: number): void {
        if (this.nowText && this.nowText.length > 0) {
            this.timer += dt;
            if (this.timer >= 0.05) {
                if (this.dialogLb.string.length < this.nowText.length) {
                    this.dialogLb.string = this.nowText.slice(0, this.dialogLb.string.length + 1);
                } else {
                    this.nowText = null;
                }

                this.timer = 0;
            }
        }
    }

}