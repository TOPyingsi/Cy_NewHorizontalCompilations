import { _decorator, AudioClip, AudioSource, Component, director, Node } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { XYMJDWY_GameData } from './XYMJDWY_GameData';
const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_AudioManager')
export class XYMJDWY_AudioManager extends Component {
    public static AudioSource: AudioSource = null;
    public static AudioClipName: string[] = ["点击", "获得钞票", "枪声", "近战击中", "捡东西", "受击", "击杀"];
    public static AudioMap: Map<string, AudioClip>;
    public static AudioSourceMap: Map<string, AudioSource>;
    protected start(): void {
        XYMJDWY_AudioManager.Init();
        XYMJDWY_AudioManager.AudioSource = this.node.getComponent(AudioSource);
        director.addPersistRootNode(this.node);
        this.schedule(() => {
            XYMJDWY_GameData.DateSave();
        }, 5)
    }
    /**
     * 播放全局音效
     */
    public static globalAudioPlay(AudioName: string) {
        if (XYMJDWY_AudioManager.AudioMap?.get(AudioName)) {
            XYMJDWY_AudioManager.AudioSource.playOneShot(XYMJDWY_AudioManager.AudioMap.get(AudioName));
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
        XYMJDWY_AudioManager.AudioSource.playOneShot(XYMJDWY_AudioManager.AudioMap.get(AudioName), num);
    }

    public static playLoopAudio(AudioName: string) {
        if (XYMJDWY_AudioManager.AudioSourceMap.has(AudioName)) {
            //库中存在
            if (XYMJDWY_AudioManager.AudioSourceMap.get(AudioName).playing) {
                return;
            } else {
                XYMJDWY_AudioManager.AudioSourceMap.get(AudioName).play();
            }
        } else {//库中没有存在改音效的控制器
            let audio = new AudioSource();
            audio.clip = XYMJDWY_AudioManager.AudioMap.get(AudioName);
            audio.loop = true;
            audio.play();
            XYMJDWY_AudioManager.AudioSourceMap.set(AudioName, audio);
        }
    }

    public static StopLoopAudio(AudioName: string) {
        if (XYMJDWY_AudioManager.AudioSourceMap.has(AudioName)) {
            XYMJDWY_AudioManager.AudioSourceMap.get(AudioName).stop();
        }
    }

    //初始化所有声音文件
    public static Init() {
        XYMJDWY_AudioManager.AudioSourceMap = new Map<string, AudioSource>();
        XYMJDWY_AudioManager.AudioMap = new Map<string, AudioClip>();
        XYMJDWY_AudioManager.AudioClipName.forEach((name) => {
            BundleManager.GetBundle("36_XYMJDWY").load("Audio/" + name, AudioClip, (err, data) => {
                if (err) {
                    console.log("没有找到音频资源" + name);
                    return;
                }
                XYMJDWY_AudioManager.AudioMap.set(name, data);
            })
        })

    }


}


