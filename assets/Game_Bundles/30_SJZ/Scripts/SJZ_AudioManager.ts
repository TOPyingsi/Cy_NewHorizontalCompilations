import { _decorator, Component, AudioSource, AudioClip } from 'cc';
const { ccclass, property } = _decorator;

export enum SJZ_Audio {
    BG = "BG",
    ButtonClick = "ButtonClick",
    Equip = "Equip",
    Fire = "Fire",
    GetMoney = "GetMoney",
    Reload = "Reload",
    Unequip = "Unequip",
    MissileExplosion = "MissileExplosion",
    MissileFire = "MissileFire",
    SafeBoxBG = "SafeBoxBG",
    SafeBoxT = "SafeBoxT",
    SafeBoxF = "SafeBoxF",
}

@ccclass('SJZ_AudioManager')
export class SJZ_AudioManager extends Component {
    public static Instance: SJZ_AudioManager = null;

    private bgmSource: AudioSource = null!; // 用于背景音乐
    private sfxSource: AudioSource = null!; // 用于音效

    @property([AudioClip])
    clips: AudioClip[] = [];

    protected onLoad(): void {
        SJZ_AudioManager.Instance = this;

        this.bgmSource = this.node.addComponent(AudioSource);
        this.sfxSource = this.node.addComponent(AudioSource);
        this.bgmSource.playOnAwake = false;
        this.sfxSource.playOnAwake = false;
        this.bgmSource.loop = true; // 背景音乐循环播放
        this.sfxSource.loop = false; // 音效单次播放
    }

    public PlayBGM(audio: SJZ_Audio): void {
        let clip = this.clips.find(e => e.name == audio);
        if (clip) {
            this.bgmSource.clip = clip;
            this.scheduleOnce(() => {
                this.bgmSource.play();
            });
        } else {
            console.error(`没有这个音效：${audio}`);
        }
    }

    public PlaySFX(audio: SJZ_Audio, volumeScale: number = 1): void {
        let clip = this.clips.find(e => e.name == audio);
        if (clip) {
            this.sfxSource.playOneShot(clip, volumeScale);
        } else {
            console.error(`没有这个音效：${audio}`);
        }
    }

    public StopBGM(): void {
        this.bgmSource.stop();
    }

    /**
     * 设置背景音乐音量
     * @param volume 音量值（0.0 - 1.0）
     */
    public SetBGMVolume(volume: number): void {
        this.bgmSource.volume = volume;
    }

    /**
     * 设置音效音量
     * @param volume 音量值（0.0 - 1.0）
     */
    public SetSFXVolume(volume: number): void {
        this.sfxSource.volume = volume;
    }
}