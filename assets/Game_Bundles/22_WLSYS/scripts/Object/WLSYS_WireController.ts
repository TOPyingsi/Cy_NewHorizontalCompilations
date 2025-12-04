import { _decorator, Component, math, Node, SpringJoint2D, Sprite, spriteAssembler, SpriteFrame, Vec2 } from 'cc';
import { ObjectController } from './WLSYS_ObjectController';
const { ccclass, property } = _decorator;

enum RotationType { // 以初始状态开始旋转幅度每逆时针90度一档次 {0, 90, 180, 270}
    stateFirst,
    stateSecond,
    stateThird,
    stateFourth
}
enum Direction {
    left,
    right,
    up,
    down,
}

const WireType = {
    straight: {
        head: 0,
        mid: 1,
        tail: 2
    },
    corner: {
        mid: 4
    },
    Ttype: {
        mid: 5
    },
    cross: {
        mid: 6
    }
}


@ccclass('WireController')
export class WireController extends ObjectController {

    @property(SpriteFrame)
    straight_head: SpriteFrame;
    @property(SpriteFrame)
    straight_mid: SpriteFrame;
    @property(SpriteFrame)
    straight_tail: SpriteFrame;
    @property(SpriteFrame)
    corner_mid: SpriteFrame;
    @property(SpriteFrame)
    Ttype_mid: SpriteFrame;
    @property(SpriteFrame)
    cross_mid: SpriteFrame;

    spfs: Map<number, SpriteFrame> = new Map<number, SpriteFrame>;
    // 左右上下
    WireState: number[][] = [[0, 0], [0, 1], [0, 1], [0, 1]
    , [0, 0], [4, 0], [4, 1], [5, 1], [0, 0], [4, 3], [4, 2], [5, 3], [0, 0], [5, 0], [5, 2], [6, 0]];

    protected override onLoad(): void {
        super.onLoad();
        this.equleWire = true;
        this.saveWireTypeSpf(WireType.straight.head, this.straight_head.clone());
        this.saveWireTypeSpf(WireType.straight.mid, this.straight_mid.clone());
        this.saveWireTypeSpf(WireType.straight.tail, this.straight_tail.clone());
        this.saveWireTypeSpf(WireType.corner.mid, this.corner_mid.clone());
        this.saveWireTypeSpf(WireType.Ttype.mid, this.Ttype_mid.clone());
        this.saveWireTypeSpf(WireType.cross.mid, this.cross_mid.clone());
    }

    private saveWireTypeSpf(type: any, newspf: SpriteFrame) {
        this.spfs.set(type, newspf);
    }

    getDirection(Dif: Vec2) { // 假设为 Dif = pos1 - pos2，返回值恒为pos2在pos1的那个方向上 
        if (Dif.x == 0 && Dif.y == 1) {
            return Direction.down;
        } else if (Dif.x == 0 && Dif.y == -1) {
            return Direction.up;
        } else if (Dif.x == 1 && Dif.y == 0) {
            return Direction.left;
        } else {
            return Direction.right;
        }
    }

    override checkType(): void {
        let curType = 0;
        if (this.leftController && !this.leftController.isDestroy) curType += 8;
        if (this.rightController && !this.rightController.isDestroy) curType += 4;
        if (this.upController && !this.upController.isDestroy) curType += 2;
        if (this.downController && !this.downController.isDestroy) curType += 1;
        // console.log(curType);
        this.Type = this.WireState[curType][0];
        this.rotationType = this.WireState[curType][1];
        if (this.Type >= 5){
            this.beNode = true;
        }else{
            this.beNode = false;
        }
    }
    override initEle(): void {
        this.Onele = 0;
    }
    override freshState() {
        this.sp.spriteFrame = this.spfs.get(this.Type);
        this.sp.node.angle = this.rotationType * 90;
    }

    checkDirEqual(d1: Direction, d2: Direction, d3: Direction, d4: Direction) {
        if (d1 == d3 && d2 == d4) {
            return true;
        }
        return false;
    }

    checkDirEqualNoOrder(d1: Direction, d2: Direction, d3: Direction, d4: Direction) { // 不考虑先后链接的方向判定
        if (this.checkDirEqual(d2, d1, d3, d4) || this.checkDirEqual(d1, d2, d3, d4)) {
            return true;
        }
        return false;
    }
    
}


