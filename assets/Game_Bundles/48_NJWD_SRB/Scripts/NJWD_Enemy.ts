import { _decorator, Component, Node, RigidBody } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NJWD_Enemy')
export class NJWD_Enemy extends Component {

    @property(RigidBody)
    moveBody: RigidBody;

    @property(Node)
    search: Node;

    state: State = State.Idle;
    targetPos

    protected start(): void {
        this.state = State.Move;
    }

    protected update(dt: number): void {

    }

}

enum State {
    Idle,
    Move,
    Shoot
}
