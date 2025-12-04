import { _decorator, AudioClip, AudioSource, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NJWD_AudioManager')
export class NJWD_AudioManager extends AudioSource {

    private static instance: NJWD_AudioManager;
    public static get Instance(): NJWD_AudioManager {
        return this.instance;
    }

    @property([AudioClip])
    clips: AudioClip[] = [];

    onLoad(): void {
        NJWD_AudioManager.instance = this;
    }

    start() {

    }

    update(deltaTime: number) {

    }

    PlayShoot(volume = 1) {
        this.playOneShot(this.clips[0], volume);
    }

    PlayHurt(volume = 1) {
        this.playOneShot(this.clips[1], volume);
    }

}


