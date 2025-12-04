import { Node, AudioSource, AudioClip, resources, director } from 'cc';

// 这是一个用于播放音频的单件类，可以很方便地在项目的任何地方调用。
export class PKP_AudioManager {
    private static _instance: PKP_AudioManager;
    public static get instance(): PKP_AudioManager {
        if (this._instance == null) {
            this._instance = new PKP_AudioManager();
        }
        return this._instance;
    }

    private _audioSource: AudioSource;
    constructor() {
        // 创建一个节点作为 audioMgr
        let audioMgr = new Node();
        audioMgr.name = '__audioMgr__';

        // 添加节点到场景
        director.getScene().addChild(audioMgr);

        // 标记为常驻节点，这样场景切换的时候就不会被销毁了
        // director.addPersistRootNode(audioMgr);

        //添加 AudioSource 组件，用于播放音频。
        this._audioSource = audioMgr.addComponent(AudioSource);
    }

    public get audioSource() {
        return this._audioSource;
    }


    // 播放短音频,比如 打击音效，爆炸音效等

    playOneShot(sound: AudioClip | string, volume: number = 1.0) {
        if (sound instanceof AudioClip) {
            this._audioSource.playOneShot(sound, volume);
        }
        else {
            resources.load(sound, (err, clip: AudioClip) => {
                if (err) {
                    console.log(err);
                }
                else {
                    this._audioSource.playOneShot(clip, volume);
                }
            });
        }
    }


    // 播放长音频，比如 背景音乐
    play(sound: AudioClip | string, volume: number = 1.0) {
        if (sound instanceof AudioClip) {
            this._audioSource.stop();
            this._audioSource.loop = true;
            this._audioSource.clip = sound;
            this._audioSource.play();
            this.audioSource.volume = volume;
        }
        else {
            resources.load(sound, (err, clip: AudioClip) => {
                if (err) {
                    console.log(err);
                }
                else {
                    this._audioSource.stop();
                    this._audioSource.clip = clip;
                    this._audioSource.play();
                    this.audioSource.volume = volume;
                }
            });
        }
    }

    // 停止播放音频
    stop() {
        this._audioSource.stop();
    }

    // 暂停播放音频
    pause() {
        this._audioSource.pause();
    }

    // 恢复播放音频
    resume() {
        this._audioSource.play();
    }
}