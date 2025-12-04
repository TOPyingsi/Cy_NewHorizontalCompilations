import { _decorator, AudioClip, AudioSource, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('XZPQ_AudioManager')
export class XZPQ_AudioManager extends Component {
    public static Instance: XZPQ_AudioManager = null;

    @property(AudioSource) audioSource: AudioSource = null;

    protected onLoad(): void {
        XZPQ_AudioManager.Instance = this;
    }

    playAudio(audio: AudioClip) {
        this.audioSource.playOneShot(audio);
    }
}


