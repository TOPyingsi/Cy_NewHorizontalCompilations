import { _decorator, AudioClip, AudioSource, Component, Node } from 'cc';
import { HJMSJ_Music } from './NPC/HJMSJ_Music';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_AudioManager')
export class HJMSJ_AudioManager extends Component {

    @property(Node)
    musicMgr: Node = null;

    @property({ type: [AudioClip] })
    bgmClips: AudioClip[] = [];

    @property({ type: [AudioClip] })
    sfxClips: AudioClip[] = [];

    bgmAudio: AudioSource = null;
    sfxAudio: AudioSource = null;

    public static bgmName: string = "哈基米-起床歌";

    public bgmNameArr: string[] = [
        "哈基米音乐-起床歌",
        "哈基米音乐-山歌",
        "哈基米音乐-舌尖上的中国",
        "哈基米音乐-way back home",
        "哈基米音乐-不在曼波",
        "哈基米音乐-不潮不用花钱",
        "哈基米音乐-出山",
        "哈基米音乐-大东北我的家",
        "哈基米音乐-桃花朵朵开",
        "哈基米音乐-蓝莲花",
        "哈基米音乐-跳楼机",
    ];

    public static instance: HJMSJ_AudioManager = null;
    start() {
        HJMSJ_AudioManager.instance = this;
        this.bgmAudio = this.node.getChildByName("背景音乐").getComponent(AudioSource);
        this.sfxAudio = this.node.getChildByName("音效").getComponent(AudioSource);

    }

    //播放背景音乐
    playBGM(name: string) {
        this.bgmAudio.stop();

        for (let clip of this.bgmClips) {
            if (clip.name === name) {
                this.bgmAudio.clip = clip;
                this.bgmAudio.play();
            }
        }

    }

    //播放音效
    playSFX(name: string) {
        for (let clip of this.sfxClips) {
            if (clip.name === name) {
                this.sfxAudio.playOneShot(clip);
            }
        }
    }
}


