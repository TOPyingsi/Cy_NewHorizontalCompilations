import { _decorator, AudioClip, AudioSource, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SLYZ_AudioManager')
export class SLYZ_AudioManager extends Component {
     private static _instance: SLYZ_AudioManager = null;
     @property(AudioSource)
     private audioSource: AudioSource = null;
     public static get instance(): SLYZ_AudioManager {
         return this._instance;
     }
     protected onLoad() {
         if(SLYZ_AudioManager._instance === null) {
             SLYZ_AudioManager._instance = this;
         } else {
             this.destroy();
             return;
         }  
     }
 
 
     public playSound(clip: AudioClip) {
        if (this.audioSource) {
            this.audioSource.playOneShot(clip);
        }
     }
 
    start() {

    }

    update(deltaTime: number) {
        
    }
}


