import { _decorator, Component, find, Node, UITransform, v3, Vec3 } from 'cc';
import { CDXX_BGController } from './CDXX_BGController';
const { ccclass, property } = _decorator;

@ccclass('CDXX_BG_1')
export class CDXX_BG_1 extends CDXX_BGController {

    @property
    Speed_1: number = 100;

    @property
    Speed_2: number = 120;

    @property
    Speed_3: number = 200;

    BG: Node = null;

    Cloud_1: Node = null;
    Cloud_2: Node = null;
    Cloud_3: Node = null;
    Cloud_4: Node = null;
    Cloud_5: Node = null;
    Cloud_6: Node = null;

    private _bgWidth: number = 0;
    private _minX: number = 0;
    private _maxX: number = 0;
    private _v_1: Vec3 = new Vec3();
    private _v_2: Vec3 = new Vec3();
    private _v_3: Vec3 = new Vec3();
    private _v_4: Vec3 = new Vec3();
    private _v_5: Vec3 = new Vec3();
    private _v_6: Vec3 = new Vec3();
    protected onLoad(): void {
        // super.onLoad();

        this.BG = find("BG", this.node);
        this.Cloud_1 = find("凡界云1", this.node);
        this.Cloud_2 = find("凡界云2", this.node);
        this.Cloud_3 = find("凡界云3", this.node);
        this.Cloud_4 = find("凡界云4", this.node);
        this.Cloud_5 = find("凡界云5", this.node);
        this.Cloud_6 = find("凡界云6", this.node);
    }

    protected start(): void {
        // super.start();
        this._bgWidth = this.BG.getComponent(UITransform).width;
        this._minX = this.BG.worldPosition.x - this._bgWidth / 2;
        this._maxX = this.BG.worldPosition.x + this._bgWidth / 2;
    }

    protected update(dt: number): void {
        this._v_1 = this.Cloud_1.worldPosition.add3f(dt * this.Speed_1, 0, 0);
        if (this._v_1.x > this._maxX) {
            this._v_1.x = this._minX;
        }
        this.Cloud_1.setWorldPosition(this._v_1);

        this._v_4 = this.Cloud_4.worldPosition.add3f(dt * this.Speed_1, 0, 0);
        if (this._v_4.x > this._maxX) {
            this._v_4.x = this._minX;
        }
        this.Cloud_4.setWorldPosition(this._v_4);

        this._v_2 = this.Cloud_2.worldPosition.add3f(dt * this.Speed_2, 0, 0);
        if (this._v_2.x > this._maxX) {
            this._v_2.x = this._minX;
        }
        this.Cloud_2.setWorldPosition(this._v_2);

        this._v_5 = this.Cloud_5.worldPosition.add3f(dt * this.Speed_2, 0, 0);
        if (this._v_5.x > this._maxX) {
            this._v_5.x = this._minX;
        }
        this.Cloud_5.setWorldPosition(this._v_5);

        this._v_3 = this.Cloud_3.worldPosition.add3f(dt * this.Speed_3, 0, 0);
        if (this._v_3.x > this._maxX) {
            this._v_3.x = this._minX;
        }
        this.Cloud_3.setWorldPosition(this._v_3);

        this._v_6 = this.Cloud_6.worldPosition.add3f(dt * this.Speed_3, 0, 0);
        if (this._v_6.x > this._maxX) {
            this._v_6.x = this._minX;
        }
        this.Cloud_6.setWorldPosition(this._v_6);
    }


}


