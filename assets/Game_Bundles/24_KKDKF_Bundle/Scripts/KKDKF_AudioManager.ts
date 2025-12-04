import { _decorator, AudioClip, AudioSource, Component, log, Node, resources } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';

const { ccclass, property } = _decorator;

@ccclass('KKDKF_AudioManager')
export class KKDKF_AudioManager {
    public static AudioSource: AudioSource = null;
    public static AudioClipName: string[] = ["获得钞票", "鼠标嘟", "点击", "BGM"];
    public static AudioMap: Map<string, AudioClip>;
    public static AudioSourceMap: Map<string, AudioSource>;
    /**
     * 播放全局音效
     */
    public static globalAudioPlay(AudioName: string) {
        KKDKF_AudioManager.AudioSource.playOneShot(KKDKF_AudioManager.AudioMap.get(AudioName));
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
        KKDKF_AudioManager.AudioSource.playOneShot(KKDKF_AudioManager.AudioMap.get(AudioName), num);
    }

    public static playLoopAudio(AudioName: string) {
        if (KKDKF_AudioManager.AudioSourceMap.has(AudioName)) {
            //库中存在
            if (KKDKF_AudioManager.AudioSourceMap.get(AudioName).playing) {
                return;
            } else {
                KKDKF_AudioManager.AudioSourceMap.get(AudioName).play();
            }
        } else {//库中没有存在改音效的控制器
            let audio = new AudioSource();
            audio.clip = KKDKF_AudioManager.AudioMap.get(AudioName);
            audio.loop = true;
            audio.play();
            KKDKF_AudioManager.AudioSourceMap.set(AudioName, audio);
        }
    }

    public static StopLoopAudio(AudioName: string) {
        if (KKDKF_AudioManager.AudioSourceMap.has(AudioName)) {
            KKDKF_AudioManager.AudioSourceMap.get(AudioName).stop();
        }
    }

    //初始化所有声音文件
    public static Init() {
        KKDKF_AudioManager.AudioSourceMap = new Map<string, AudioSource>();
        KKDKF_AudioManager.AudioMap = new Map<string, AudioClip>();
        KKDKF_AudioManager.AudioClipName.forEach((name) => {
            BundleManager.GetBundle("24_KKDKF_Bundle").load("Audio/" + name, AudioClip, (err, data) => {
                if (err) {
                    console.log("没有找到音频资源" + name);
                    return;
                }
                KKDKF_AudioManager.AudioMap.set(name, data);
            })
        })

    }


}




