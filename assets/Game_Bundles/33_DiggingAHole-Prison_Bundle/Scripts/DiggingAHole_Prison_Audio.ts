import { _decorator, AudioClip, AudioSource, clamp, Component, Event, EventTouch, Label, Node, Sprite, UITransform, v3, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DiggingAHole_Prison_Audio')
export class DiggingAHole_Prison_Audio extends Component {

    @property([AudioClip])
    clips: AudioClip[] = [];

    audio: AudioSource;

    private static instance: DiggingAHole_Prison_Audio;

    public static get Instance(): DiggingAHole_Prison_Audio {
        return this.instance;
    }

    protected onLoad(): void {
        DiggingAHole_Prison_Audio.instance = this;
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


