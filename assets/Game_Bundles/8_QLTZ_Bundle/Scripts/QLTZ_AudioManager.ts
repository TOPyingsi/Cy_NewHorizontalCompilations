import { _decorator, AudioClip, AudioSource, Component, log, Node, resources } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';

const { ccclass, property } = _decorator;

@ccclass('QLTZ_AudioManager')
export class QLTZ_AudioManager {
    public static audiosource: AudioSource = null;
    public static bgmsource: AudioSource = null;
    //播放音效
    public static AudioClipPlay(path: string, volumeScale?: number) {
        if (QLTZ_AudioManager.audiosource == null) QLTZ_AudioManager.audiosource = new Node().addComponent(AudioSource);
        BundleManager.GetBundle("8_QLTZ_Bundle").load("AudioClip/" + path, AudioClip, (err, event) => {
            if (err) {
                console.log("没有找到音效文件：" + path);
                return;
            }
            QLTZ_AudioManager.audiosource.playOneShot(event, volumeScale);
        })
    }
    //播放背景音乐

    public static BGMPlay(path: string, volumeScale?: number) {
        if (QLTZ_AudioManager.bgmsource == null) QLTZ_AudioManager.bgmsource = new Node().addComponent(AudioSource);
        BundleManager.GetBundle("8_QLTZ_Bundle").load("AudioClip/" + path, AudioClip, (err, event) => {
            if (err) {
                console.log("没有找到音效文件：" + path);
                return;
            }
            QLTZ_AudioManager.bgmsource.clip = event;
            QLTZ_AudioManager.bgmsource.loop = true;
            QLTZ_AudioManager.bgmsource.play();
        })
    }
}




