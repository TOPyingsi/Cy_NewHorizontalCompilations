import { _decorator, AudioClip, AudioSource, Component, Node } from 'cc';
import { BundleManager, } from '../../../Scripts/Framework/Managers/BundleManager';
const { ccclass, property } = _decorator;

@ccclass('XGTW_AudioManager')
export class XGTW_AudioManager extends Component {
    public static audiosource: AudioSource = null;
    //播放音效
    public static AudioClipPlay(path: string, volumeScale?: number) {
        if (!XGTW_AudioManager.audiosource) XGTW_AudioManager.audiosource = new Node().addComponent(AudioSource);
        BundleManager.GetBundle("0_XGTW").load("AudioClip/" + path, AudioClip, (err, event) => {
            if (err) {
                console.log("没有找到音效文件：" + path);
                return;
            }
            XGTW_AudioManager.audiosource.playOneShot(event, volumeScale);
        })
    }
    //播放背景音乐

    public static BGMPlay(path: string, volumeScale?: number) {
        if (!XGTW_AudioManager.audiosource) XGTW_AudioManager.audiosource = new Node().addComponent(AudioSource);
        BundleManager.GetBundle("0_XGTW").load("AudioClip/" + path, AudioClip, (err, event) => {
            if (err) {
                console.log("没有找到音效文件：" + path);
                return;
            }
            XGTW_AudioManager.audiosource.clip = event;
            XGTW_AudioManager.audiosource.play();
        })
    }
}


