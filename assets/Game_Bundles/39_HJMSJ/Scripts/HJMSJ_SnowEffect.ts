import { _decorator, Component, Node, ParticleSystem2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_SnowEffect')
export class HJMSJ_SnowEffect extends Component {

    private Particle: ParticleSystem2D = null;
    start() {
        this.Particle = this.getComponent(ParticleSystem2D);
        this.schedule(this.LoopEffect, 10);
    }

    LoopEffect() {
        if (this.Particle) {
            this.Particle.resetSystem();
        }
    }
}


