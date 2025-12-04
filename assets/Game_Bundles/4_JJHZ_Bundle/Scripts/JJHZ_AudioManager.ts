import { _decorator, AudioClip, AudioSource, Component, log, Node, resources } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';

const { ccclass, property } = _decorator;

@ccclass('JJHZ_AudioManager')
export class JJHZ_AudioManager {
    public static AudioSource: AudioSource = null;
    public static AudioClipName: string[] = [];
    public static AudioMap: Map<string, AudioClip>;
    public static AudioSourceMap: Map<string, AudioSource>;
    /**
     * 播放全局音效
     */
    public static globalAudioPlay(AudioName: string) {
        JJHZ_AudioManager.AudioSource.playOneShot(JJHZ_AudioManager.AudioMap.get(AudioName));
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
        JJHZ_AudioManager.AudioSource.playOneShot(JJHZ_AudioManager.AudioMap.get(AudioName), num);
    }

    public static playLoopAudio(AudioName: string) {
        if (JJHZ_AudioManager.AudioSourceMap.has(AudioName)) {
            //库中存在
            if (JJHZ_AudioManager.AudioSourceMap.get(AudioName).playing) {
                return;
            } else {
                JJHZ_AudioManager.AudioSourceMap.get(AudioName).play();
            }
        } else {//库中没有存在改音效的控制器
            let audio = new AudioSource();
            audio.clip = JJHZ_AudioManager.AudioMap.get(AudioName);
            audio.loop = true;
            audio.play();
            JJHZ_AudioManager.AudioSourceMap.set(AudioName, audio);
        }
    }

    public static StopLoopAudio(AudioName: string) {
        if (JJHZ_AudioManager.AudioSourceMap.has(AudioName)) {
            JJHZ_AudioManager.AudioSourceMap.get(AudioName).stop();
        }
    }




}




