import { _decorator, AudioClip, AudioSource, Component, log, Node, resources } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';

const { ccclass, property } = _decorator;

@ccclass('QSSZG_AudioManager')
export class QSSZG_AudioManager {
    public static AudioSource: AudioSource = null;
    public static AudioClipName: string[] = ["升级音效", "放置鱼食", "点击", "背景音乐"];
    public static AudioMap: Map<string, AudioClip>;
    public static AudioSourceMap: Map<string, AudioSource>;
    /**
     * 播放全局音效
     */
    public static globalAudioPlay(AudioName: string) {
        QSSZG_AudioManager.AudioSource.playOneShot(QSSZG_AudioManager.AudioMap.get(AudioName));
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
        QSSZG_AudioManager.AudioSource.playOneShot(QSSZG_AudioManager.AudioMap.get(AudioName), num);
    }

    public static playLoopAudio(AudioName: string) {
        if (QSSZG_AudioManager.AudioSourceMap.has(AudioName)) {
            //库中存在
            if (QSSZG_AudioManager.AudioSourceMap.get(AudioName).playing) {
                return;
            } else {
                QSSZG_AudioManager.AudioSourceMap.get(AudioName).play();
            }
        } else {//库中没有存在改音效的控制器
            let audio = new AudioSource();
            audio.clip = QSSZG_AudioManager.AudioMap.get(AudioName);
            audio.loop = true;
            audio.play();
            QSSZG_AudioManager.AudioSourceMap.set(AudioName, audio);
        }
    }

    public static StopLoopAudio(AudioName: string) {
        if (QSSZG_AudioManager.AudioSourceMap.has(AudioName)) {
            QSSZG_AudioManager.AudioSourceMap.get(AudioName).stop();
        }
    }

    //初始化所有声音文件
    public static Init() {
        if (!QSSZG_AudioManager.AudioSource) {
            QSSZG_AudioManager.AudioSource = new Node().addComponent(AudioSource);
            QSSZG_AudioManager.AudioSource.stop();
            QSSZG_AudioManager.AudioSourceMap = new Map<string, AudioSource>();
            QSSZG_AudioManager.AudioMap = new Map<string, AudioClip>();
            QSSZG_AudioManager.AudioClipName.forEach((name) => {
                BundleManager.GetBundle("3_QSSZGBundle").load("Audio/" + name, AudioClip, (err, data) => {
                    if (err) {
                        console.log("没有找到音频资源" + name);
                        return;
                    }
                    QSSZG_AudioManager.AudioMap.set(name, data);
                })
            })
        }
    }


}




