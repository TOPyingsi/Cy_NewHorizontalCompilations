import { _decorator, AudioClip, AudioSource, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ZSTSB_AudioManager')
export class ZSTSB_AudioManager extends Component {
    @property({ type: [AudioClip] })
    clips: AudioClip[] = [];

    sfxAudio: AudioSource = null;
    bgmAudio: AudioSource = null;

    public static instance: ZSTSB_AudioManager = null;
    start() {
        ZSTSB_AudioManager.instance = this;
        this.sfxAudio = this.node.getChildByName("sfxAudio").getComponent(AudioSource);
        this.bgmAudio = this.node.getChildByName("bgmAudio").getComponent(AudioSource);
        this.bgmAudio.play();
    }


    playSFX(name: string) {

        for (let clip of this.clips) {
            if (clip.name === name) {
                this.sfxAudio.playOneShot(clip);
                break;
            }
        }
    }

    playBGM(name: string) {

        this.bgmAudio.stop();

        for (let clip of this.clips) {
            if (clip.name === name) {
                this.bgmAudio.clip = clip;
                this.bgmAudio.play();
                break;
            }
        }
    }
}


