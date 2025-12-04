import { _decorator, AudioClip, AudioSource, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_Audio')
export class WGYQ_Audio extends Component {

    private static instance: WGYQ_Audio;
    public static get Instance(): WGYQ_Audio {
        return this.instance;
    }

    @property(AudioClip)
    btnClip: AudioClip;

    audio: AudioSource;

    protected onLoad(): void {
        WGYQ_Audio.instance = this;
        this.audio = this.getComponent(AudioSource);
    }

    Play(clip: AudioClip = this.btnClip) {
        this.audio.playOneShot(clip);
    }

}


