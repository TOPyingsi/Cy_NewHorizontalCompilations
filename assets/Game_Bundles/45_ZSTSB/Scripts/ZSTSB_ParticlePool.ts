import { _decorator, Component, instantiate, Node, ParticleSystem2D, Prefab } from 'cc';
import { ZSTSB_GameMgr } from './ZSTSB_GameMgr';
const { ccclass, property } = _decorator;

@ccclass('ZSTSB_ParticlePool')
export class ZSTSB_ParticlePool extends Component {

    @property(Prefab)
    particlePrefab: Prefab | null = null;

    private particlePool: ParticleSystem2D[] = [];
    private usedParticles: ParticleSystem2D[] = [];

    start() {
        this.CreateParticle(100);
    }

    async CreateParticle(num: number) {
        const batchSize = 50; // 每批创建50个节点
        const interval = 0.01; // 每批间隔0.01秒

        const Target = ZSTSB_GameMgr.instance.Target;


        for (let i = 0; i < num; i += batchSize) {
            // 计算当前批次需要创建的节点数量
            const currentBatchSize = Math.min(batchSize, num - i);

            // 创建当前批次的节点
            for (let j = 0; j < currentBatchSize; j++) {
                let particle = instantiate(this.particlePrefab);
                particle.setParent(Target);
                let particleSystem = particle.getComponent(ParticleSystem2D);
                this.particlePool.push(particleSystem);
                particle.active = false;
            }

            // 如果还有下一批，等待指定时间
            if (i + batchSize < num) {
                await new Promise(resolve => this.scheduleOnce(resolve, interval));
            }
        }

        console.log(`粒子对象池初始化完成，总共创建 ${num} 个粒子节点`);
    }

    getParticleFromPool(): ParticleSystem2D {
        if (this.particlePool.length > 0) {
            return this.particlePool.pop();
        }
        else {
            let particle = instantiate(this.particlePrefab);
            particle.setParent(ZSTSB_GameMgr.instance.Target);
            let particleSystem = particle.getComponent(ParticleSystem2D);
            this.particlePool.push(particleSystem);
            particle.active = false;
            return particleSystem;
        }
    }

    returnParticleToPool(particle: ParticleSystem2D) {
        this.particlePool.push(particle);
    }

    public useParticle(particle: ParticleSystem2D) {
        this.usedParticles.push(particle);
    }

    recycleParticle() {
        const batchSize = 100; // 每批处理100个节点

        // 取出一批节点进行处理
        const particlebatch = this.usedParticles.splice(0, Math.min(batchSize, this.usedParticles.length));

        // 处理当前批次的节点
        for (let particle of particlebatch) {
            this.returnParticleToPool(particle);
        }

        // 如果还有剩余节点需要处理，则在下一帧继续处理
        if (this.usedParticles.length > 0) {
            this.scheduleOnce(() => {
                this.recycleParticle();
            }, 0.01);
        } else {
            console.log("粒子回收完成");
        }
    }
}


