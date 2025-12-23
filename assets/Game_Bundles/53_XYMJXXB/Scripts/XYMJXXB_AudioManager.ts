import { _decorator, AudioClip, AudioSource, Component, director, Node } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { XYMJXXB_GameData } from './XYMJXXB_GameData';
const { ccclass, property } = _decorator;

@ccclass('XYMJXXB_AudioManager')
export class XYMJXXB_AudioManager extends Component {
    public static AudioSource: AudioSource = null;
    public static AudioClipName: string[] = ["点击", "获得钞票", "枪声", "近战击中", "捡东西", "受击", "击杀"];
    public static AudioMap: Map<string, AudioClip>;
    public static AudioSourceMap: Map<string, AudioSource>;
    protected start(): void {
        XYMJXXB_AudioManager.Init();
        XYMJXXB_AudioManager.AudioSource = this.node.getComponent(AudioSource);
        director.addPersistRootNode(this.node);
        this.schedule(() => {
            XYMJXXB_GameData.DateSave();
        }, 5)
    }
    /**
     * 播放全局音效
     */
    public static globalAudioPlay(AudioName: string) {
        if (XYMJXXB_AudioManager.AudioMap?.get(AudioName)) {
            XYMJXXB_AudioManager.AudioSource.playOneShot(XYMJXXB_AudioManager.AudioMap.get(AudioName));
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
        XYMJXXB_AudioManager.AudioSource.playOneShot(XYMJXXB_AudioManager.AudioMap.get(AudioName), num);
    }

    public static playLoopAudio(AudioName: string) {
        if (XYMJXXB_AudioManager.AudioSourceMap.has(AudioName)) {
            //库中存在
            if (XYMJXXB_AudioManager.AudioSourceMap.get(AudioName).playing) {
                return;
            } else {
                XYMJXXB_AudioManager.AudioSourceMap.get(AudioName).play();
            }
        } else {//库中没有存在改音效的控制器
            let audio = new AudioSource();
            audio.clip = XYMJXXB_AudioManager.AudioMap.get(AudioName);
            audio.loop = true;
            audio.play();
            XYMJXXB_AudioManager.AudioSourceMap.set(AudioName, audio);
        }
    }

    public static StopLoopAudio(AudioName: string) {
        if (XYMJXXB_AudioManager.AudioSourceMap.has(AudioName)) {
            XYMJXXB_AudioManager.AudioSourceMap.get(AudioName).stop();
        }
    }

    //初始化所有声音文件
    public static Init() {
        XYMJXXB_AudioManager.AudioSourceMap = new Map<string, AudioSource>();
        XYMJXXB_AudioManager.AudioMap = new Map<string, AudioClip>();
        XYMJXXB_AudioManager.AudioClipName.forEach((name) => {
            BundleManager.GetBundle("53_XYMJXXB").load("Audio/" + name, AudioClip, (err, data) => {
                if (err) {
                    console.log("没有找到音频资源" + name);
                    return;
                }
                XYMJXXB_AudioManager.AudioMap.set(name, data);
            })
        })

    }


}


