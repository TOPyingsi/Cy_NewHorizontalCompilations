import { _decorator, AudioClip, AudioSource, Component, director, Node } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';

const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_AudioManager')
export class SJZGMMT_AudioManager extends Component {
    public static Instance: SJZGMMT_AudioManager = null;
    public static AudioSource: AudioSource = null;
    public static AudioClipName: string[] = ["炮火轰炸", "点击", "获得钞票", "枪声", "近战攻击", "捡东西", "受击", "击杀", "换弹音效", "死亡音效",
        "紫", "红", "蓝", "SafeBoxBG", "SafeBoxF", "SafeBoxT", "直升机音效", "滑铲音效", "修勾出场音效", "游侠出场音效", "巫医出场音效",
        "先锋出场音效", "道士出场音效", "杰峰技能音效", "游侠技能音效", "炼狱犬技能音效", "道士技能音效", "一般", "开心", "难过", "机关_叮",
        "石门打开", "厚重点击", "放置", "法球发射", "乾坤借法", "弓弩发射"
    ];
    public static AudioMap: Map<string, AudioClip>;
    public static AudioSourceMap: Map<string, AudioSource>;
    protected onLoad(): void {
        SJZGMMT_AudioManager.Instance = this;
    }
    protected start(): void {
        SJZGMMT_AudioManager.Init();
        SJZGMMT_AudioManager.AudioSource = this.node.getComponent(AudioSource);
        director.addPersistRootNode(this.node);
    }
    /**
     * 播放全局音效
     */
    public static globalAudioPlay(AudioName: string, AudioSize: number = 1) {
        if (SJZGMMT_AudioManager.AudioMap?.get(AudioName)) {
            SJZGMMT_AudioManager.AudioSource.playOneShot(SJZGMMT_AudioManager.AudioMap.get(AudioName), AudioSize);
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
        SJZGMMT_AudioManager.AudioSource.playOneShot(SJZGMMT_AudioManager.AudioMap.get(AudioName), num);
    }

    public static playLoopAudio(AudioName: string) {
        if (SJZGMMT_AudioManager.AudioSourceMap.has(AudioName)) {
            //库中存在
            if (SJZGMMT_AudioManager.AudioSourceMap.get(AudioName).playing) {
                return;
            } else {
                SJZGMMT_AudioManager.AudioSourceMap.get(AudioName).play();
            }
        } else {//库中没有存在改音效的控制器
            let audio = new AudioSource();
            audio.clip = SJZGMMT_AudioManager.AudioMap.get(AudioName);
            audio.loop = true;
            audio.play();
            SJZGMMT_AudioManager.AudioSourceMap.set(AudioName, audio);
        }
    }

    public static StopLoopAudio(AudioName: string) {
        if (SJZGMMT_AudioManager.AudioSourceMap.has(AudioName)) {
            SJZGMMT_AudioManager.AudioSourceMap.get(AudioName).stop();
        }
    }

    //初始化所有声音文件
    public static Init() {
        SJZGMMT_AudioManager.AudioSourceMap = new Map<string, AudioSource>();
        SJZGMMT_AudioManager.AudioMap = new Map<string, AudioClip>();
        SJZGMMT_AudioManager.AudioClipName.forEach((name) => {
            BundleManager.GetBundle("60_SJZGMMT").load("Audios/" + name, AudioClip, (err, data) => {
                if (err) {
                    console.log("没有找到音频资源" + name);
                    return;
                }
                SJZGMMT_AudioManager.AudioMap.set(name, data);
            })
        })

    }


}


