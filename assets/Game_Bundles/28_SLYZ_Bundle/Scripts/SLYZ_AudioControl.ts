import { _decorator, AudioSource, Component, Node, ProgressBar, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SLYZ_AudioControl')
export class SLYZ_AudioControl extends Component {
    @property(ProgressBar)
    musicProgressBar: ProgressBar = null!;
    @property(AudioSource)
    private musicAudio: AudioSource = null!;
    private isDragging = false;
    private buttonNode: Node = null!;
    private parentWidth = 0;

    start() {
        this.buttonNode = this.node.getChildByName("设置界面").getChildByName("缩放层").getChildByName("音乐").getChildByName("音量底").getChildByName("音量调节");
        this.parentWidth = this.musicProgressBar.node.getComponent(UITransform)!.contentSize.width;
        this.updateButtonPosition(this.musicProgressBar.progress);  
        this.buttonNode.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.buttonNode.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.buttonNode.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.buttonNode.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    private onTouchStart() {
        this.isDragging = true;
    }

    private onTouchMove(event: any) {
        if (!this.isDragging) return;
        
        const delta = event.getUIDelta();
        const newX = this.buttonNode.position.x + delta.x;
        
        const progress = Math.min(Math.max(newX / this.parentWidth, 0), 1);
        this.musicProgressBar.progress = progress;
        this.musicAudio.volume = progress;
        this.updateButtonPosition(progress);
    }

    private onTouchEnd() {
        this.isDragging = false;
    }

    private updateButtonPosition(progress: number) {
        const posX = progress * this.parentWidth;
        this.buttonNode.setPosition(new Vec3(posX, 0, 0));
    }
}


