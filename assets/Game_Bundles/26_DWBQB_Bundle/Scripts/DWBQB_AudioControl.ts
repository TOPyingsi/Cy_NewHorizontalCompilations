import { _decorator, AudioSource, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DWBQB_AudioControl')
export class DWBQB_AudioControl extends Component {
    start() {
         let index= Math.floor(Math.random() * 5) + 10;
         this.schedule(()=>{
             this.playAudio();
         },index);
    }

    update(deltaTime: number) {
        
    }
    playAudio(){
        this.node.getComponent(AudioSource).stop();
        this.node.getComponent(AudioSource).play();
    }
}


