import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WBSRL_Monologue')
export class WBSRL_Monologue extends Component {
    @property(Label)
    public label: Label = null!;   // 绑定 Label 节点

    @property
    public typingSpeed: number = 0.05;  // 每个字出现的间隔（秒）

    private _fullText: string = '';
    private _curIndex: number = 0;
    private _isPlaying: boolean = false;

    public get IsPlaying() {
        return this._isPlaying;
    }

    /**
     * 开始显示对话
     * @param text 要显示的完整文本
     */
    public playText(text: string) {
        this._fullText = text;
        this._curIndex = 0;
        this._isPlaying = true;
        this.label.string = '';
        this.schedule(this._typeWriter, this.typingSpeed);
    }

    private _typeWriter() {
        if (!this._isPlaying) return;

        this._curIndex++;
        this.label.string = this._fullText.slice(0, this._curIndex);

        // 完成后停止
        if (this._curIndex >= this._fullText.length) {
            this.unschedule(this._typeWriter);
            this._isPlaying = false;
        }
    }

    /**
     * 跳过动画直接显示完整文本
     */
    public showAll() {
        this.unschedule(this._typeWriter);
        this.label.string = this._fullText;
        this._isPlaying = false;
    }
}


