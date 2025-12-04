import { _decorator, AudioClip, AudioSource, Component, Node } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
const { ccclass, property } = _decorator;

@ccclass('AXBX_AudioManager')
export class AXBX_AudioManager extends Component {

    public static AudioSource: AudioSource = null;
    public static AudioClipName: string[] = ["失败", "胜利", "苹果砸", "苹果吃", "饮料砸", "饮料喝", "饮料摇", "三明治砸", "三明治吃",
        "魔方砸", "魔方玩", "鼠标砸", "鼠标玩", "笔记本砸", "笔记本翻页", "水杯砸", "水杯倒水", "水杯喝"];
    public static AudioMap: Map<string, AudioClip>;
    protected start(): void {
        AXBX_AudioManager.AudioSource = this.node.getComponent(AudioSource);
        AXBX_AudioManager.Init();
    }
    /**
     * 播放全局音效
     */
    public static globalAudioPlay(AudioName: string) {
        if (AXBX_AudioManager.AudioMap.get(AudioName)) {
            AXBX_AudioManager.AudioSource.playOneShot(AXBX_AudioManager.AudioMap.get(AudioName));
        }
    }

    //初始化所有声音文件
    public static Init() {
        AXBX_AudioManager.AudioMap = new Map<string, AudioClip>();
        AXBX_AudioManager.AudioClipName.forEach((name) => {
            BundleManager.GetBundle("49_AiXinBuXin").load("Audios/" + name, AudioClip, (err, data) => {
                if (err) {
                    console.log("没有找到音频资源" + name);
                    return;
                }
                AXBX_AudioManager.AudioMap.set(name, data);
            })
        })

    }
}

