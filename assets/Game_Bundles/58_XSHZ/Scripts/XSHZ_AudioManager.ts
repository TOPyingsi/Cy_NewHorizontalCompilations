import { _decorator, AudioClip, AudioSource, Component, director, Node } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { XSHZ_GameData } from './XSHZ_GameData';

const { ccclass, property } = _decorator;

@ccclass('XSHZ_AudioManager')
export class XSHZ_AudioManager extends Component {
    public static AudioSource: AudioSource = null;
    public static AudioClipName: string[] = ["击中", "刺中", "刺破", "喷火", "拳击", "爆炸", "雷击", "重拳", "按钮点击"];
    public static AudioMap: Map<string, AudioClip>;
    public static AudioSourceMap: Map<string, AudioSource>;
    protected start(): void {
        XSHZ_AudioManager.Init();
        XSHZ_AudioManager.AudioSource = this.node.getComponent(AudioSource);
        director.addPersistRootNode(this.node);
        this.schedule(() => {
            XSHZ_GameData.DateSave();
        }, 5)
    }
    /**
     * 播放全局音效
     */
    public static globalAudioPlay(AudioName: string) {
        if (XSHZ_AudioManager.AudioMap?.get(AudioName)) {
            XSHZ_AudioManager.AudioSource.playOneShot(XSHZ_AudioManager.AudioMap.get(AudioName));
        }
    }
    /**
     * 播放音效
     * @param AudioName 想要播放的音频文件名
     * @param AudioManager 播放的音频控制器
     */
    public static AudioPlay(AudioName: string, distance: number) {
        let num = (200 - distance) / 200;
        if (num < 0) {
            num = 0;
        }
        XSHZ_AudioManager.AudioSource.playOneShot(XSHZ_AudioManager.AudioMap.get(AudioName), num);
    }

    public static playLoopAudio(AudioName: string) {
        if (XSHZ_AudioManager.AudioSourceMap.has(AudioName)) {
            //库中存在
            if (XSHZ_AudioManager.AudioSourceMap.get(AudioName).playing) {
                return;
            } else {
                XSHZ_AudioManager.AudioSourceMap.get(AudioName).play();
            }
        } else {//库中没有存在改音效的控制器
            let audio = new AudioSource();
            audio.clip = XSHZ_AudioManager.AudioMap.get(AudioName);
            audio.loop = true;
            audio.play();
            XSHZ_AudioManager.AudioSourceMap.set(AudioName, audio);
        }
    }

    public static StopLoopAudio(AudioName: string) {
        if (XSHZ_AudioManager.AudioSourceMap.has(AudioName)) {
            XSHZ_AudioManager.AudioSourceMap.get(AudioName).stop();
        }
    }

    //初始化所有声音文件
    public static Init() {
        XSHZ_AudioManager.AudioSourceMap = new Map<string, AudioSource>();
        XSHZ_AudioManager.AudioMap = new Map<string, AudioClip>();
        XSHZ_AudioManager.AudioClipName.forEach((name) => {
            BundleManager.GetBundle("58_XSHZ").load("Audio/" + name, AudioClip, (err, data) => {
                if (err) {
                    console.log("没有找到音频资源" + name);
                    return;
                }
                XSHZ_AudioManager.AudioMap.set(name, data);
            })
        })

    }


}


