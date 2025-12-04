import { _decorator, Animation, AudioSource, Component, find, instantiate, Label, Node, Prefab, tween, UIOpacity, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('YYB_gamemanager')
export class YYB_gamemanager extends Component {
    @property(Prefab)
    TipPre: Prefab = null;
    private Score: number = 0;
    private muyu: Node = null;
    start() {
        this.muyu = find("Canvas/木鱼");
    }

    onclick() {
        let nd = instantiate(this.TipPre);
        nd.setParent(find("Canvas"));
        nd.setPosition(v3(Math.random() * 600 - 300, Math.random() * 400 - 100, 0));
        tween(nd)
            .by(1, { position: v3(0, 200, 0) })
            .call(() => {
                nd.destroy();
            })
            .start();
        tween(nd.getComponent(UIOpacity))
            .to(0.9, { opacity: 0 })
            .start();
        tween(this.muyu)
            .to(0.12, { scale: v3(1.05, 1.05, 1) })
            .to(0.12, { scale: v3(1, 1, 1) })
            .start();
        find("Canvas/棍子").getComponent(Animation).play();
        this.node.getComponent(AudioSource).play();
        this.Score++;
        find("Canvas/功德").getComponent(Label).string = "功德：" + this.Score;
    }
}


