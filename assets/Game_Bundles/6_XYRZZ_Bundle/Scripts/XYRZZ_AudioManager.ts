import { _decorator, AudioClip, AudioSource, Component, log, Node, resources } from 'cc';
import { XYRZZ_UIManager } from './XYRZZ_UIManager';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';

const { ccclass, property } = _decorator;

@ccclass('XYRZZ_EventManager')
export class XYRZZ_AudioManager {
    public static AudioSource: AudioSource = null;
    public static AudioClipName: string[] = ["鼠标嘟", "点击", "拉鱼线"];
    public static AudioMap: Map<string, AudioClip>;
    public static AudioSourceMap: Map<string, AudioSource>;

    /**
     * 播放全局音效
     */
    public static globalAudioPlay(AudioName: string) {
        if (XYRZZ_AudioManager.AudioMap.get(AudioName)) {
            XYRZZ_AudioManager.AudioSource.playOneShot(XYRZZ_AudioManager.AudioMap.get(AudioName));
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
        XYRZZ_AudioManager.AudioSource.playOneShot(XYRZZ_AudioManager.AudioMap.get(AudioName), num);
    }

    public static playLoopAudio(AudioName: string) {
        if (XYRZZ_AudioManager.AudioSourceMap.has(AudioName)) {
            //库中存在
            if (XYRZZ_AudioManager.AudioSourceMap.get(AudioName).playing) {
                return;
            } else {
                XYRZZ_AudioManager.AudioSourceMap.get(AudioName).play();
            }
        } else {//库中没有存在改音效的控制器
            let audio = new AudioSource();
            audio.clip = XYRZZ_AudioManager.AudioMap.get(AudioName);
            audio.loop = true;
            audio.play();
            XYRZZ_AudioManager.AudioSourceMap.set(AudioName, audio);
        }
    }

    public static StopLoopAudio(AudioName: string) {
        if (XYRZZ_AudioManager.AudioSourceMap.has(AudioName)) {
            XYRZZ_AudioManager.AudioSourceMap.get(AudioName).stop();
        }
    }

    //初始化所有声音文件
    public static Init() {
        XYRZZ_AudioManager.AudioSourceMap = new Map<string, AudioSource>();
        XYRZZ_AudioManager.AudioMap = new Map<string, AudioClip>();
        XYRZZ_AudioManager.AudioClipName.forEach((name) => {
            BundleManager.GetBundle("6_XYRZZ_Bundle").load("Audio/" + name, AudioClip, (err, data) => {
                if (err) {
                    console.log("没有找到音频资源" + name);
                    return;
                }
                XYRZZ_AudioManager.AudioMap.set(name, data);
            })
        })

    }


}




