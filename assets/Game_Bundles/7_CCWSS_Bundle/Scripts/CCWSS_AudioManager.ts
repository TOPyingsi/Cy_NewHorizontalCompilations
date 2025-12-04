import { _decorator, AudioClip, AudioSource, Component, log, Node, resources } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';

const { ccclass, property } = _decorator;

@ccclass('CCWSS_AudioManager')
export class CCWSS_AudioManager {
    public static audiosource: AudioSource = null;
    public static bgmsource: AudioSource = null;
    //播放音效
    public static AudioClipPlay(path: string, volumeScale?: number) {
        if (CCWSS_AudioManager.audiosource == null) CCWSS_AudioManager.audiosource = new Node().addComponent(AudioSource);
        BundleManager.GetBundle("7_CCWSS_Bundle").load("AudioClip/" + path, AudioClip, (err, event) => {
            if (err) {
                console.log("没有找到音效文件：" + path);
                return;
            }
            CCWSS_AudioManager.audiosource.playOneShot(event, volumeScale);
        })
    }
    //播放背景音乐

    public static BGMPlay(path: string, volumeScale?: number) {
        if (CCWSS_AudioManager.bgmsource == null) CCWSS_AudioManager.bgmsource = new Node().addComponent(AudioSource);
        BundleManager.GetBundle("7_CCWSS_Bundle").load("AudioClip/" + path, AudioClip, (err, event) => {
            if (err) {
                console.log("没有找到音效文件：" + path);
                return;
            }
            CCWSS_AudioManager.bgmsource.clip = event;
            CCWSS_AudioManager.bgmsource.loop = true;
            CCWSS_AudioManager.bgmsource.play();
        })
    }
}




