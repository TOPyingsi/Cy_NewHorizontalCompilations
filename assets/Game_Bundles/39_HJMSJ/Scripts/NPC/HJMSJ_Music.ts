import { _decorator, Component, director, Label, Node, NodeEventType } from 'cc';
import { HJMSJ_AudioManager } from '../HJMSJ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_Music')
export class HJMSJ_Music extends Component {

    private musicName: string = "";
    private musicNameLabel: Label = null;
    private musicStateLabel: Label = null;

    init(musicName: string) {
        if (!this.musicNameLabel) {
            this.musicNameLabel = this.node.getChildByName("歌名").getComponent(Label);
        }
        if (!this.musicStateLabel) {
            this.musicStateLabel = this.node.getChildByName("播放状态").getComponent(Label);
        }

        this.musicName = musicName;
        this.musicNameLabel.string = this.musicName;

        this.node.on(NodeEventType.TOUCH_END, this.onClick, this);

        director.getScene().on("哈基米世界_音乐切换", (bgmName: string) => {
            if (bgmName == this.musicName) {
                this.musicStateLabel.string = "播放中";
            } else {
                this.musicStateLabel.string = "";
            }
        })
    }

    onClick() {
        HJMSJ_AudioManager.instance.playBGM(this.musicName);
        director.getScene().emit("哈基米世界_音乐切换", this.musicName);
    }
}


