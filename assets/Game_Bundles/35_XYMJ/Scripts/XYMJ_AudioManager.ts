import { _decorator, AudioClip, AudioSource, Component, director, Node } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { XYMJ_GameData } from './XYMJ_GameData';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_AudioManager')
export class XYMJ_AudioManager extends Component {
    public static AudioSource: AudioSource = null;
    public static AudioClipName: string[] = ["点击", "获得钞票", "枪声", "近战击中", "捡东西", "受击", "击杀"];
    public static AudioMap: Map<string, AudioClip>;
    public static AudioSourceMap: Map<string, AudioSource>;
    protected start(): void {
        XYMJ_AudioManager.Init();
        XYMJ_AudioManager.AudioSource = this.node.getComponent(AudioSource);
        director.addPersistRootNode(this.node);
        this.schedule(() => {
            XYMJ_GameData.DateSave();
        }, 5)
    }
    /**
     * 播放全局音效
     */
    public static globalAudioPlay(AudioName: string) {
        if (XYMJ_AudioManager.AudioMap?.get(AudioName)) {
            XYMJ_AudioManager.AudioSource.playOneShot(XYMJ_AudioManager.AudioMap.get(AudioName));
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
        XYMJ_AudioManager.AudioSource.playOneShot(XYMJ_AudioManager.AudioMap.get(AudioName), num);
    }

    public static playLoopAudio(AudioName: string) {
        if (XYMJ_AudioManager.AudioSourceMap.has(AudioName)) {
            //库中存在
            if (XYMJ_AudioManager.AudioSourceMap.get(AudioName).playing) {
                return;
            } else {
                XYMJ_AudioManager.AudioSourceMap.get(AudioName).play();
            }
        } else {//库中没有存在改音效的控制器
            let audio = new AudioSource();
            audio.clip = XYMJ_AudioManager.AudioMap.get(AudioName);
            audio.loop = true;
            audio.play();
            XYMJ_AudioManager.AudioSourceMap.set(AudioName, audio);
        }
    }

    public static StopLoopAudio(AudioName: string) {
        if (XYMJ_AudioManager.AudioSourceMap.has(AudioName)) {
            XYMJ_AudioManager.AudioSourceMap.get(AudioName).stop();
        }
    }

    //初始化所有声音文件
    public static Init() {
        XYMJ_AudioManager.AudioSourceMap = new Map<string, AudioSource>();
        XYMJ_AudioManager.AudioMap = new Map<string, AudioClip>();
        XYMJ_AudioManager.AudioClipName.forEach((name) => {
            BundleManager.GetBundle("35_XYMJ").load("Audio/" + name, AudioClip, (err, data) => {
                if (err) {
                    console.log("没有找到音频资源" + name);
                    return;
                }
                XYMJ_AudioManager.AudioMap.set(name, data);
            })
        })

    }


}


