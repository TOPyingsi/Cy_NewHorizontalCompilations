import { _decorator, Component, AudioClip, AudioSource, tween, Tween, director, Prefab, instantiate } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass, property } = _decorator;

//名字需要和拖拽赋值的音频名字一致
export enum Audios {
    BGM = "BGM",
    ButtonClick = "点击声音",
    Open = "翻页",
    Get = "获取",
    OpenDoor = "开门",
    Drink = "喝水声",
    QZB = "签字笔",
    KDC = "刻度尺",
    YBKC = "游标卡尺",
    Fire = "开枪",
    Reload = "换弹夹",
    GMSQ = "激光",
    Boom = "爆炸",
    GSQ = "光束枪",
    Hit = "打击",
}

@ccclass('TLWLSJ_AudioManager')
export class TLWLSJ_AudioManager extends Component {
    private static _instance: TLWLSJ_AudioManager = null;
    private static _loadingPromise: Promise<TLWLSJ_AudioManager> | null = null;
    private static get Instance(): Promise<TLWLSJ_AudioManager> {
        if (TLWLSJ_AudioManager._instance == null) {
            if (TLWLSJ_AudioManager._loadingPromise === null) {
                TLWLSJ_AudioManager._loadingPromise = new Promise<TLWLSJ_AudioManager>((resolve, reject) => {
                    BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "AudioManager").then((prefab: Prefab) => {
                        let node = instantiate(prefab);
                        director.getScene()!.addChild(node);
                        // director.addPersistRootNode(node);
                        TLWLSJ_AudioManager._instance = node.getComponent(TLWLSJ_AudioManager);
                        resolve(TLWLSJ_AudioManager._instance);
                    }).catch((error) => {
                        reject(error);
                    });
                });
            }
            return TLWLSJ_AudioManager._loadingPromise;
        } else {
            return Promise.resolve(TLWLSJ_AudioManager._instance);
        }
    }

    private LoadAudioManager() {
        BundleManager.LoadPrefab(GameManager.GameData.DefaultBundle, "AudioManager").then((prefab: Prefab) => {
            let node = instantiate(prefab);
            director.getScene()!.addChild(node);
            // director.addPersistRootNode(node);
            TLWLSJ_AudioManager._instance = node.getComponent(TLWLSJ_AudioManager);
            TLWLSJ_AudioManager.PlayMusic(Audios.BGM);
        })
    }

    static Mute: boolean = false;

    public static PlaySound(key: string, volume: number = 1, loop: boolean = false) {
        TLWLSJ_AudioManager.Instance.then(a => a.PlaySound(key, volume, loop)).catch(error => console.error("Failed to play sound:", error));
    }

    public static StopSound(key: string) {
        TLWLSJ_AudioManager.Instance.then(a => a.StopSound(key)).catch(error => console.error("Failed to stop sound:", error));
    }

    public static PlayMusic(key: string, volume: number = 1, loop: boolean = true) {
        TLWLSJ_AudioManager.Instance.then(a => a.PlayMusic(key, volume, loop)).catch(error => console.error("Failed to play music:", error));
    }

    public static FadeSound(key: string, time: number, volume: number = 1) {
        TLWLSJ_AudioManager.Instance.then(a => a.FadeSound(key, time, volume)).catch(error => console.error("Fade failed:", error));
    }

    public static PauseAll() {
        TLWLSJ_AudioManager.Instance.then(a => a.PauseAll()).catch(error => console.error("PauseAll failed:", error));
    }

    public static ResumeAll() {
        TLWLSJ_AudioManager.Instance.then(a => a.ResumeAll()).catch(error => console.error("ResumeAll failed:", error));
    }

    public static StopAll() {
        TLWLSJ_AudioManager.Instance.then(a => a.StopAll()).catch(error => console.error("StopAll failed:", error));
    }

    //#region 节点方法

    @property(AudioClip)
    clips: AudioClip[] = [];

    playingAudios: AudioSource[] = [];

    audioSourceMap: Map<string, AudioSource> = new Map<string, AudioSource>();

    onLoad() {
        this.clips.forEach((sound) => {
            let audioSource = this.node.addComponent(AudioSource);
            audioSource.playOnAwake = false;
            audioSource.clip = sound;

            if (!this.audioSourceMap.has(sound.name)) {
                this.audioSourceMap.set(sound.name, audioSource);
            }
        });
    }

    private PlaySound(key: string, volume: number = 1, loop: boolean = false) {
        if (this.CheckNull(key)) return;
        if (TLWLSJ_AudioManager.Mute) return;

        Tween.stopAllByTarget(this.audioSourceMap.get(key));

        this.audioSourceMap.get(key).loop = loop;
        this.audioSourceMap.get(key).volume = volume;
        this.audioSourceMap.get(key).play();
    }

    private PlayMusic(key: string, volume: number = 1, loop: boolean = true) {
        this.PlaySound(key, volume, loop);
    }

    private StopSound(key: string) {
        if (this.CheckNull(key)) return;
        this.audioSourceMap.get(key).stop();
    }

    private FadeSound(key: string, time: number, volume: number = 1) {
        if (this.CheckNull(key)) return;

        if (this.audioSourceMap.get(key)) {
            Tween.stopAllByTarget(this.audioSourceMap.get(key));
            this.PlaySound(key, volume);
        }

        tween(this.audioSourceMap.get(key)).to(time, { volume: 0 }).call(() => {
            this.StopSound(key);
        }).start();
    }

    private PauseAll() {
        this.playingAudios = [];
        for (const audioSource of this.audioSourceMap.values()) {
            if (audioSource.playing) {
                audioSource.pause();
                this.playingAudios.push(audioSource);
            }
        }
    }

    private ResumeAll() {
        this.playingAudios.forEach(audioSource => {
            audioSource.play();
        });
    }

    private StopAll() {
        for (const audioSource of this.audioSourceMap.values()) {
            if (audioSource.playing) {
                audioSource.stop();
            }
        }
    }

    private GetClip(key: string) {
        if (!this.audioSourceMap.get(key)) {
            console.error(`没有 Audio Source。`,);
            return null;
        } else {
            return this.audioSourceMap.get(key);
        }
    }

    private CheckNull(key): boolean {

        if (this.node == null) {
            console.error(`没有这个节点。`,);
            this.LoadAudioManager();
            return true;
        }

        if (!this.audioSourceMap.get(key)) {
            console.error(`没有 Audio Source。`,);
            return true;
        }

        return false;
    }

    //#endregion

}