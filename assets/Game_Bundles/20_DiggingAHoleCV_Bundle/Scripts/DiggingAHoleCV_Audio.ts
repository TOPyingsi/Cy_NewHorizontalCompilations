import { _decorator, AudioClip, AudioSource, clamp, Component, Event, EventTouch, Label, Node, Sprite, UITransform, v3, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DiggingAHoleCV_Audio')
export class DiggingAHoleCV_Audio extends Component {

    @property([AudioClip])
    clips: AudioClip[] = [];

    audio: AudioSource;

    private static instance: DiggingAHoleCV_Audio;

    public static get Instance(): DiggingAHoleCV_Audio {
        return this.instance;
    }

    protected onLoad(): void {
        DiggingAHoleCV_Audio.instance = this;
    }

    start() {
        this.audio = this.getComponent(AudioSource);
    }

    update(deltaTime: number) {

    }

    PlayAudio(name: string) {
        let clip = this.clips.find((value, index, obj) => { if (value.name == name) return value });
        this.audio.playOneShot(clip);
    }
}


