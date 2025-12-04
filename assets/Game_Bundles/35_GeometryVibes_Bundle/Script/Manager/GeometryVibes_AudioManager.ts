import { _decorator, AudioClip, AudioSource, Component, director, log, Node, resources } from 'cc';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';


const { ccclass, property } = _decorator;

@ccclass('GeometryVibes_AudioManager')
export class GeometryVibes_AudioManager  extends Component{
    private static instance: GeometryVibes_AudioManager;
    // public static MusicAudioSource: AudioSource = null;
    // public static SoundAudioSource: AudioSource = null;
    // public static AudioMap: Map<string, AudioClip>;
    // public static DefaultClip: AudioClip =null;


    public  MusicAudioSource: AudioSource = null;
    public  SoundAudioSource: AudioSource = null;
    private clips: Map<string, AudioClip>;

        // 单例模式
    public static getInstance(): GeometryVibes_AudioManager {
        if (!GeometryVibes_AudioManager.instance) {
            // 查找场景中是否已存在GameManager节点
            const existingNode = director.getScene().getChildByName('GameManager');
            if (existingNode) {
                GeometryVibes_AudioManager.instance = existingNode.getComponent(GeometryVibes_AudioManager);
            } else {
                // 如果不存在，则创建新节点并添加组件
                const gameManagerNode = new Node('GameManager');
                director.getScene().addChild(gameManagerNode);
                GeometryVibes_AudioManager.instance = gameManagerNode.addComponent(GeometryVibes_AudioManager);
            }
        }
        return GeometryVibes_AudioManager.instance;
    }

    protected onLoad(): void {
        GeometryVibes_AudioManager.instance = this;
    }

    // // public static AudioSourceMap: Map<string, AudioSource>;
    //     public static AudioClipName: string[] = [
    //     "button",
    //      "cikis", 
    //      "Coins 03",
    //      "Endless Mode",
    //      "Entering portal",
    //      "Explosion",
    //      "gerisayim",
    //      "giris",
    //      "Item Touch Collect",
    //      "Level_1",
    //      "Level_2",
    //      "Level_3",
    //      "Level_4",
    //      "Level_5",
    //      "Level_6",
    //      "Level_7",
    //      "Level_8",
    //      "Level_9",
    //      "Level_10",
    //      "Multiplayer Mode",
    //     //  "Menu Theme",
    //      "Win"
    //     ];

        
    public init(clips:AudioClip[],musicAudioSource:AudioSource,soundAudioSource:AudioSource) {
        this.clips = new Map();
        clips.forEach(clip => {
            this.clips.set(clip.name, clip);
        });

        this.MusicAudioSource = musicAudioSource;
        this.SoundAudioSource = soundAudioSource;

        if(this.MusicAudioSource){
            this.MusicAudioSource.volume = 0.4;
        }
        if(this.SoundAudioSource){
            this.SoundAudioSource.volume = 1;
        }
    }

    playSound(clipName: string) {
        const clip = this.clips.get(clipName);
        if (clip) {
            this.SoundAudioSource.playOneShot(clip);
        }
    }

    playMusic(clipName: string) {
        const clip = this.clips.get(clipName);
        if (clip) {
            if(this.MusicAudioSource.clip && this.MusicAudioSource.clip.name == clipName && this.MusicAudioSource.playing){
                return;
            }
            if(!this.MusicAudioSource.clip || this.MusicAudioSource.clip.name != clipName){
                this.MusicAudioSource.stop();
                this.MusicAudioSource.clip = clip;
            }
            
            this.MusicAudioSource.play();
        }
    }

    stopMusic(){
        if(this.MusicAudioSource){
            this.MusicAudioSource.stop();
        }
    }

    // /**
    //  * 播放全局音效
    //  */
    // public static globalAudioPlay(AudioName: string,volume = 1) {
    //     if (GeometryVibes_AudioManager.AudioMap.get(AudioName)) {
    //         GeometryVibes_AudioManager.SoundAudioSource.volume = volume;
    //         GeometryVibes_AudioManager.SoundAudioSource.playOneShot(GeometryVibes_AudioManager.AudioMap.get(AudioName));
    //     }
    // }

    // public static setDefaultClip(clip:AudioClip){
    //     GeometryVibes_AudioManager.DefaultClip = clip;
    // }
    // public static playDefaultClip(){
    //     let audio = GeometryVibes_AudioManager.MusicAudioSource;

    //     if(!audio.clip){
    //         audio.clip = GeometryVibes_AudioManager.DefaultClip;
    //         audio.loop = true;
    //         audio.play();
    //     }
    //     else{
    //         if (audio.clip?.name == GeometryVibes_AudioManager.DefaultClip.name && audio.playing) {
    //             return;
    //         } else {
    //             audio.stop();
    //             audio.clip = GeometryVibes_AudioManager.DefaultClip;
    //             audio.loop = true;
    //             audio.play();
    //         }
    //     }

    // }


    // /** 
    //  * 播放音效
    //  * @param AudioName 想要播放的音频文件名
    //  * @param AudioManager 播放的音频控制器
    //  */
    // public static AudioPlay(AudioName: string, distance: number) {
    //     let num = (200 - distance) / 200;
    //     if (num < 0) {
    //         num = 0;
    //     }
    //     GeometryVibes_AudioManager.MusicAudioSource.playOneShot(GeometryVibes_AudioManager.AudioMap.get(AudioName), num);
    // }

    // // public static playAudioOnLoad(AudioName: string) {
    // //     if (GeometryVibes_AudioManager.AudioSourceMap.has(AudioName)) {
    // //         //console.log(GeometryVibes_AudioManager.AudioSourceMap);
    // //         //库中存在
    // //         GeometryVibes_AudioManager.AudioSourceMap.forEach((audioSource, name) => {
    // //             if(name === AudioName){
    // //                 return;
    // //             }

    // //             if (audioSource.playing) {
    // //                 audioSource.stop();
    // //             }
    // //         });
    // //         if (GeometryVibes_AudioManager.AudioSourceMap.get(AudioName).playing) {
    // //             GeometryVibes_AudioManager.AudioSourceMap.get(AudioName).play();
    // //             return;
    // //         } else {
    // //             // GeometryVibes_AudioManager.AudioSourceMap.get(AudioName).play();
    // //             if(!GeometryVibes_AudioManager.AudioMap.has(AudioName)){
    // //                 BundleManager.GetBundle("35_GeometryVibes_Bundle").load("Audio/" + AudioName, AudioClip, (err, data) => {
    // //                     if (err) {
    // //                         //console.log("没有找到音频资源" + name);
    // //                         return;
    // //                     }
    // //                     GeometryVibes_AudioManager.AudioMap.set(AudioName, data);
    // //                     let audio = this.MusicAudioSource;
    // //                     audio.clip = GeometryVibes_AudioManager.AudioMap.get(AudioName);
    // //                     audio.loop = true;
    // //                     audio.play();
    // //                     GeometryVibes_AudioManager.AudioSourceMap.set(AudioName, audio);
    // //                 })
    // //             }
    // //             else{
    // //                 let audio = GeometryVibes_AudioManager.AudioSourceMap.get(AudioName);
    // //                 audio.clip = GeometryVibes_AudioManager.AudioMap.get(AudioName);
    // //                 audio.loop = true;
    // //                 audio.play();
    // //             }
    // //         }
    // //     } else {//库中没有存在改音效的控制器
    // //         if(!GeometryVibes_AudioManager.AudioMap.has(AudioName)){
    // //             BundleManager.GetBundle("35_GeometryVibes_Bundle").load("Audio/" + AudioName, AudioClip, (err, data) => {
    // //                 if (err) {
    // //                     //console.log("没有找到音频资源" + name);
    // //                     return;
    // //                 }
    // //                 GeometryVibes_AudioManager.AudioMap.set(AudioName, data);
    // //                 let audio = this.MusicAudioSource;
    // //                 audio.clip = GeometryVibes_AudioManager.AudioMap.get(AudioName);
    // //                 audio.loop = true;
    // //                 audio.play();
    // //                 GeometryVibes_AudioManager.AudioSourceMap.set(AudioName, audio);
    // //             })
    // //         }
    // //         else{
    // //             let audio = this.MusicAudioSource;
    // //             audio.clip = GeometryVibes_AudioManager.AudioMap.get(AudioName);
    // //             audio.loop = true;
    // //             audio.play();
    // //             GeometryVibes_AudioManager.AudioSourceMap.set(AudioName, audio);
    // //         }
    // //     }

    // //     // if(!GeometryVibes_AudioManager.AudioMap.has(AudioName)){
    // //     //     BundleManager.GetBundle("35_GeometryVibes_Bundle").load("Audio/" + AudioName, AudioClip, (err, data) => {
    // //     //         if (err) {
    // //     //             //console.log("没有找到音频资源" + name);
    // //     //             return;
    // //     //         }
    // //     //         GeometryVibes_AudioManager.AudioMap.set(AudioName, data);
    // //     //         let audio = this.AudioSource;
    // //     //         audio.clip = GeometryVibes_AudioManager.AudioMap.get(AudioName);
    // //     //         audio.loop = true;
    // //     //         audio.play();
    // //     //         GeometryVibes_AudioManager.AudioSourceMap.set(AudioName, audio);
    // //     //     })
    // //     // }
    // //     // else{
    // //     //     let audio = this.AudioSource;
    // //     //     audio.clip = GeometryVibes_AudioManager.AudioMap.get(AudioName);
    // //     //     audio.loop = true;
    // //     //     audio.play();
    // //     //     GeometryVibes_AudioManager.AudioSourceMap.set(AudioName, audio);
    // //     // }
    // // }

    // public static playLoopAudio(AudioName: string,isGameBack = false) {
    //      let audio = GeometryVibes_AudioManager.MusicAudioSource;

    //         // GeometryVibes_AudioManager.AudioSourceMap.forEach((audioSource, name) => {
    //         //     if(name === AudioName){
    //         //         return;
    //         //     }

    //         //     if (audioSource.playing) {
    //         //         audioSource.stop();
    //         //     }
    //         // });
    //     // if (GeometryVibes_AudioManager.AudioSourceMap.has(AudioName)) {
    //         //库中存在
    //         if (audio.clip.name == AudioName && audio.playing) {
    //             return;
    //         } else {
    //             audio.stop();
    //             audio.clip = GeometryVibes_AudioManager.AudioMap.get(AudioName);
    //             audio.loop = true;
    //             audio.play();
    //         }
    //     // } else {//库中没有存在改音效的控制器
    //     //     // let audio = new AudioSource();
    //     //     let audio = this.MusicAudioSource;
    //     //     audio.clip = GeometryVibes_AudioManager.AudioMap.get(AudioName);
    //     //     audio.loop = true;
    //     //     audio.play();
    //     //     GeometryVibes_AudioManager.AudioSourceMap.set(AudioName, audio);
    //     // }
    // }

    // public static StopLoopAudio( AudioName: string ) {
    //     if (GeometryVibes_AudioManager.MusicAudioSource.clip.name == AudioName) {
    //         GeometryVibes_AudioManager.MusicAudioSource.stop();
    //     }
    // }

    // //初始化所有声音文件
    // public static Init() {
    //     if(this.MusicAudioSource){
    //         GeometryVibes_AudioManager.MusicAudioSource.volume = 0.4;
    //     }
    //     if(this.SoundAudioSource){
    //         GeometryVibes_AudioManager.SoundAudioSource.volume = 1;
    //     }
    //     // GeometryVibes_AudioManager.AudioSourceMap = new Map<string, AudioSource>();
    //     GeometryVibes_AudioManager.AudioMap = new Map<string, AudioClip>();
    //     GeometryVibes_AudioManager.AudioClipName.forEach((name) => {
    //         BundleManager.GetBundle("35_GeometryVibes_Bundle").load("Audio/" + name, AudioClip, (err, data) => {
    //             if (err) {
    //                 //console.log("没有找到音频资源" + name);
    //                 return;
    //             }
    //             if(!GeometryVibes_AudioManager.AudioMap.has(name)){
    //                 GeometryVibes_AudioManager.AudioMap.set(name, data);
    //             }
    //         })
    //     })

    // }


}




