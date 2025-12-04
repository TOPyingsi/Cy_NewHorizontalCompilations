import { _decorator, AudioClip, AudioSource, Component, log, Node, resources } from 'cc';

import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_AudioManager')
export class MTRNX_AudioManager {
    public static audiosource: AudioSource = null;
    //播放音效
    public static AudioClipPlay(path: string, volumeScale?: number) {
        if (!MTRNX_AudioManager.audiosource) MTRNX_AudioManager.audiosource = new Node().addComponent(AudioSource);
        BundleManager.GetBundle("2_MTRNX_Bundle").load("AudioClip/" + path, AudioClip, (err, event) => {
            if (err) {
                console.log("没有找到音效文件：" + path);
                return;
            }
            MTRNX_AudioManager.audiosource.playOneShot(event, volumeScale);
        })
    }
    //播放背景音乐

    public static BGMPlay(path: string, volumeScale?: number) {
        if (!MTRNX_AudioManager.audiosource) MTRNX_AudioManager.audiosource = new Node().addComponent(AudioSource);
        BundleManager.GetBundle("2_MTRNX_Bundle").load("AudioClip/" + path, AudioClip, (err, event) => {
            if (err) {
                console.log("没有找到音效文件：" + path);
                return;
            }
            MTRNX_AudioManager.audiosource.clip = event;
            MTRNX_AudioManager.audiosource.play();
        })
    }
}




