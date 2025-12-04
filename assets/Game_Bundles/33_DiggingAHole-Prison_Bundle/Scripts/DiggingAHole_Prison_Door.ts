import { _decorator, Component, director, Node, SkeletalAnimation, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('DiggingAHole_Prison_Door')
export class DiggingAHole_Prison_Door extends Component {
    start() {
        director.getScene().on('掘地求财_开门', () => { tween(this.node).to(1, { x: 4.8 }).start() });
        director.getScene().on('掘地求财_关门', () => { tween(this.node).to(1, { x: 3.6 }).start() });

    }


}


