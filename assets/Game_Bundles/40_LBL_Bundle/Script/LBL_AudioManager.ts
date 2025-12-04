import { _decorator, AudioClip, AudioSource, Component, log, Node, resources } from 'cc';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';


const { ccclass, property } = _decorator;

@ccclass('LBL_AudioManager')
export class LBL_AudioManager {
    public static MusicAudioSource: AudioSource = null;
    public static SoundAudioSource: AudioSource = null;
    public static AudioMap: Map<string, AudioClip>;
    public static DefaultClip: AudioClip =null;

    // public static AudioSourceMap: Map<string, AudioSource>;
        public static AudioClipName: string[] = [

        ];

    /**
     * 播放全局音效
     */
    public static globalAudioPlay(AudioName: string,volume = 1) {
        if (LBL_AudioManager.AudioMap.get(AudioName)) {
            LBL_AudioManager.SoundAudioSource.volume = volume;
            LBL_AudioManager.SoundAudioSource.playOneShot(LBL_AudioManager.AudioMap.get(AudioName));
        }
    }

    public static setDefaultClip(clip:AudioClip){
        LBL_AudioManager.DefaultClip = clip;
    }
    public static playDefaultClip(){
        let audio = LBL_AudioManager.MusicAudioSource;

        if(!audio.clip){
            audio.clip = LBL_AudioManager.DefaultClip;
            audio.loop = true;
            audio.play();
        }
        else{
            if (audio.clip?.name == LBL_AudioManager.DefaultClip.name && audio.playing) {
                return;
            } else {
                audio.stop();
                audio.clip = LBL_AudioManager.DefaultClip;
                audio.loop = true;
                audio.play();
            }
        }

    }


    public static playLoopAudio(AudioName: string,isGameBack = false) {
         let audio = LBL_AudioManager.MusicAudioSource;

            if (audio.clip.name == AudioName && audio.playing) {
                return;
            } else {
                audio.stop();
                audio.clip = LBL_AudioManager.AudioMap.get(AudioName);
                audio.loop = true;
                audio.play();
            }

    }

    public static StopLoopAudio( AudioName: string ) {
        if (LBL_AudioManager.MusicAudioSource.clip.name == AudioName) {
            LBL_AudioManager.MusicAudioSource.stop();
        }
    }

    //初始化所有声音文件
    public static Init() {
        if(this.MusicAudioSource){
            LBL_AudioManager.MusicAudioSource.volume = 0.7;
        }
        if(this.SoundAudioSource){
            LBL_AudioManager.SoundAudioSource.volume = 1;
        }
        // LBL_AudioManager.AudioSourceMap = new Map<string, AudioSource>();
        LBL_AudioManager.AudioMap = new Map<string, AudioClip>();
        LBL_AudioManager.AudioClipName.forEach((name) => {
            BundleManager.GetBundle("40_LBL_Bundle").load("Audio/" + name, AudioClip, (err, data) => {
                if (err) {
                    //console.log("没有找到音频资源" + name);
                    return;
                }
                if(!LBL_AudioManager.AudioMap.has(name)){
                    LBL_AudioManager.AudioMap.set(name, data);
                }
            })
        })

    }

    public static clear(){
        LBL_AudioManager.MusicAudioSource = null;
        LBL_AudioManager.SoundAudioSource = null;
        LBL_AudioManager.AudioMap = null;
    }

}




