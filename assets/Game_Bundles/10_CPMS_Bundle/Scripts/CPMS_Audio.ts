import { _decorator, AudioClip, AudioSource, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CPMS_Audio')
export class CPMS_Audio extends Component {

    static instance: CPMS_Audio;


    public static get Instance(): CPMS_Audio {
        return this.instance;
    }


    @property(AudioSource)
    audio: AudioSource;

    @property([AudioClip])
    clips: AudioClip[] = [];

    start() {
        CPMS_Audio.instance = this;
    }

    update(deltaTime: number) {

    }

    PlayAudio(num: number) {
        this.audio.playOneShot(this.clips[num]);

    }
}


