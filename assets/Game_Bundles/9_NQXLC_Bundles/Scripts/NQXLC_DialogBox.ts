import { _decorator, Component, find, Label, log, math, Node } from 'cc';
import { NQXLC_Level } from './NQXLC_Level';
import { NQXLC_Camera } from './NQXLC_Camera';
const { ccclass, property } = _decorator;

@ccclass('NQXLC_DialogBox')
export class NQXLC_DialogBox extends Component {

    NameNode: Node = null;
    NameLabel: Label = null;
    DialogLabel: Label = null;

    private fullText: string = ''; // 完整对话文本
    private currentIndex: number = 0; // 当前显示到的字符索引
    private typingSpeed: number = 0.05; // 打字速度（秒/每个字符）
    private isTyping: boolean = false; // 是否正在显示文字
    private _cb: Function = null;

    protected onLoad(): void {
        this.NameNode = find("姓名", this.node);
        this.NameLabel = find("姓名/姓名", this.node).getComponent(Label);
        this.DialogLabel = find("对话框/对话", this.node).getComponent(Label);

        // this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    /**
    * 显示对话框文字，逐字显示
    * @param text 完整的对话文本
    */
    public showDialog(text: string, cb: Function = null) {
        if (this.isTyping) {
            console.warn("文字正在显示中，请稍后...");
            return;
        }
        const match = text.match(/^([\u4e00-\u9fa5A-Za-z0-9]+)\s(.+)$/);
        if (match) {
            this.NameLabel.string = match[1];
            this.fullText = match[2]; // 保存完整的文本
        } else {
            this.NameNode.active = false;
            this.fullText = text; // 保存完整的文本
        }

        this.currentIndex = 0; // 重置索引
        this.DialogLabel!.string = ''; // 清空 Label 的内容
        this.isTyping = true;
        this._cb = cb;

        this.schedule(this.typeNextCharacter, this.typingSpeed);
    }

    /**
     * 显示下一个字符
     */
    private typeNextCharacter() {
        if (this.currentIndex < this.fullText.length) {
            // 每次追加一个字符
            this.DialogLabel!.string += this.fullText[this.currentIndex];
            this.currentIndex++;
        } else {
            // 完成显示，停止计时器
            this.unschedule(this.typeNextCharacter);
            this.isTyping = false;
        }
    }

    /**
     * 跳过逐字显示，立即显示完整文字
     */
    public skipTyping() {
        if (this.isTyping) {
            this.unschedule(this.typeNextCharacter); // 停止逐字显示
            this.DialogLabel!.string = this.fullText; // 直接显示完整文本
            this.isTyping = false;
        }
    }

    onTouchEnd(event: TouchEvent) {
        if (this.isTyping) return;
        this.node.destroy();
        this._cb && this._cb();
    }

}


