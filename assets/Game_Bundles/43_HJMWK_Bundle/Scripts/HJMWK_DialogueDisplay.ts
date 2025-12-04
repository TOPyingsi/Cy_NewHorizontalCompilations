import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HJMWK_DialogueDisplay')
export class HJMWK_DialogueDisplay extends Component {
    @property(Label)
    dialogueLabel: Label = null!;

    @property
    typeSpeed: number = 0.05; // 每个字符显示间隔时间（秒）

    @property
    defaultChat: string = "要返回哪个矿场？";

    private fullText: string = '';
    private currentIndex: number = 0;
    private isTyping: boolean = false;
    private typewriterSchedule: any = null;

    start() {
        if (!this.dialogueLabel) {
            this.dialogueLabel = this.getComponent(Label);
        }
    }

    protected onEnable(): void {
        this.scheduleOnce(() => {
            this.showDialogue(this.defaultChat);
        }, 0.3);
    }

    onDestroy() {
        this.dialogueLabel.string = '';
        this.stopTyping();
    }

    /**
 * 开始显示对话
 * @param text 要显示的文本
 * @param speed 可选，覆盖默认速度
 */
    public showDialogue(text: string, speed?: number) {
        // 停止当前的显示
        this.stopTyping();

        this.fullText = text;
        this.currentIndex = 0;
        this.isTyping = true;

        // 清空当前显示
        this.dialogueLabel.string = '';

        const actualSpeed = speed || this.typeSpeed;

        // 开始逐字显示，使用绑定的回调
        this.schedule(this.typewriterCallback, actualSpeed);
    }

    // 提取出的回调函数，便于unschedule
    private typewriterCallback() {
        if (this.currentIndex < this.fullText.length) {
            this.dialogueLabel.string += this.fullText[this.currentIndex];
            this.currentIndex++;
        } else {
            this.stopTyping();
        }
    }

    /**
     * 停止打字效果
     */
    public stopTyping() {
        this.unschedule(this.typewriterCallback);
        this.isTyping = false;
    }

    /**
     * 立即显示全部文本
     */
    public showFullText() {
        this.stopTyping();
        this.dialogueLabel.string = this.fullText;
        this.currentIndex = this.fullText.length;
    }

    /**
     * 检查是否正在打字
     */
    public get typing(): boolean {
        return this.isTyping;
    }


}
