import { _decorator, AudioClip, AudioSource, Component, director, Node } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';

const { ccclass, property } = _decorator;

@ccclass('SJZXD_AudioManager')
export class SJZXD_AudioManager extends Component {
    public static Instance: SJZXD_AudioManager = null;
    public static AudioSource: AudioSource = null;
    public static AudioClipName: string[] = ["炮火轰炸", "点击", "获得钞票", "枪声", "近战攻击", "捡东西", "受击", "击杀", "换弹音效", "死亡音效",
        "紫", "红", "蓝", "SafeBoxBG", "SafeBoxF", "SafeBoxT", "直升机音效", "滑铲音效", "修勾出场音效", "杰峰出场音效", "贤勾出场音效",
        "炼狱犬出场音效", "不死勾出场音效", "杰峰技能音效", "贤勾技能音效", "炼狱犬技能音效", "不死勾技能音效", "一般", "开心", "难过"
    ];
    public static AudioMap: Map<string, AudioClip>;
    public static AudioSourceMap: Map<string, AudioSource>;
    protected onLoad(): void {
        SJZXD_AudioManager.Instance = this;
    }
    protected start(): void {
        SJZXD_AudioManager.Init();
        SJZXD_AudioManager.AudioSource = this.node.getComponent(AudioSource);
        director.addPersistRootNode(this.node);
    }
    /**
     * 播放全局音效
     */
    public static globalAudioPlay(AudioName: string) {
        if (SJZXD_AudioManager.AudioMap?.get(AudioName)) {
            SJZXD_AudioManager.AudioSource.playOneShot(SJZXD_AudioManager.AudioMap.get(AudioName));
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
        SJZXD_AudioManager.AudioSource.playOneShot(SJZXD_AudioManager.AudioMap.get(AudioName), num);
    }

    public static playLoopAudio(AudioName: string) {
        if (SJZXD_AudioManager.AudioSourceMap.has(AudioName)) {
            //库中存在
            if (SJZXD_AudioManager.AudioSourceMap.get(AudioName).playing) {
                return;
            } else {
                SJZXD_AudioManager.AudioSourceMap.get(AudioName).play();
            }
        } else {//库中没有存在改音效的控制器
            let audio = new AudioSource();
            audio.clip = SJZXD_AudioManager.AudioMap.get(AudioName);
            audio.loop = true;
            audio.play();
            SJZXD_AudioManager.AudioSourceMap.set(AudioName, audio);
        }
    }

    public static StopLoopAudio(AudioName: string) {
        if (SJZXD_AudioManager.AudioSourceMap.has(AudioName)) {
            SJZXD_AudioManager.AudioSourceMap.get(AudioName).stop();
        }
    }

    //初始化所有声音文件
    public static Init() {
        SJZXD_AudioManager.AudioSourceMap = new Map<string, AudioSource>();
        SJZXD_AudioManager.AudioMap = new Map<string, AudioClip>();
        SJZXD_AudioManager.AudioClipName.forEach((name) => {
            BundleManager.GetBundle("54_SJZXD").load("Audios/" + name, AudioClip, (err, data) => {
                if (err) {
                    console.log("没有找到音频资源" + name);
                    return;
                }
                SJZXD_AudioManager.AudioMap.set(name, data);
            })
        })

    }


}


