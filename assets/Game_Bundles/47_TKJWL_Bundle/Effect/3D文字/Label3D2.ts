
import { _decorator, Component, Node, Font, BitmapFont, Vec2, ImageAsset, Texture2D, Asset, RenderTexture, MeshRenderer, Material, Vec3, Size, utils, geometry, EventHandler, log, Color, Enum } from 'cc';



const { ccclass, property, executeInEditMode } = _decorator;

export const BASELINE_RATIO = 0.26;
const MAX_SIZE = 2048;

class SimpleCanvasPool {
    private static pool: HTMLCanvasElement[] = [];

    /**
     * 获取一个画布及其上下文
     */
    static get(): { canvas: HTMLCanvasElement, context: CanvasRenderingContext2D } {
        if (this.pool.length > 0) {
            const canvas = this.pool.pop()!;
            const context = canvas.getContext("2d")!;
            return { canvas, context };
        } else {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d")!;
            return { canvas, context };
        }
    }

    /**
     * 回收画布，将其放回池中
     */
    static put(canvasObj: { canvas: HTMLCanvasElement, context: CanvasRenderingContext2D }) {
        canvasObj.context.clearRect(0, 0, canvasObj.canvas.width, canvasObj.canvas.height);
        this.pool.push(canvasObj.canvas);
    }
}

@ccclass('Label3D')
@executeInEditMode
export class Label3D extends Component {
    @property({ tooltip: "字体颜色", type: Color, visible: function (this) { this.updateRenderData(); return true; } })//visible动态修改编辑器颜色
    color: Color = new Color(255, 255, 255, 255);

    @property({ tooltip: "描边厚度", visible: function (this) { this.updateRenderData(); return true; } })//描边厚度
    lineWidth: number = 5;

    @property({ tooltip: "描边颜色", type: Color, visible: function (this) { this.updateRenderData(); return true; } })//visible动态修改编辑器颜色
    linecolor: Color = new Color(255, 255, 255, 255);

    @property({ tooltip: "行高", visible: function (this) { this.updateRenderData(); return true; } })//描边厚度
    lineHeight: number = 50;
    get Color() {
        return this.color;
    }
    set Color(val: Color) {
        this.color = val;
        this.updateRenderData();
    }

    @property
    private _string: string = "";
    @property({ displayOrder: 2, multiline: true })

    get string() {
        return this._string;
    }
    set string(val) {
        if (val === null || val === undefined) {
            val = '';
        } else {
            val = val.toString();
        }
        if (this._string === val) {
            return;
        }
        this._string = val;
        this.updateRenderData();
    }

    @property
    private _material: Material = null!;
    @property({ type: Material, displayOrder: 2 })
    public get material() {
        return this._material;
    }
    public set material(val) {
        this._material = val;
        this.updateMeshRenderMaterial();
    }

    private _splitStrings: string[] = [];
    private _assemblerData: any = null!;
    private _context: CanvasRenderingContext2D = null!;
    private _canvas: HTMLCanvasElement = null!;
    private _texture: Texture2D = null!;
    private _meshRender: MeshRenderer = null!;
    private _canvasSize: Size = new Size();
    private _worldBounds: geometry.AABB = null!;

    private _uvs: number[] = [];
    private _positions: number[] = [];
    private _startPosition: Vec2 = new Vec2();

    onLoad() {
        this.initMeshRender();
    }

    onEnable() {
        this._assemblerData = SimpleCanvasPool.get();
        this._context = this._assemblerData.context;
        this._canvas = this._assemblerData.canvas;
        this.updateRenderData();
    }

    start() {
        this.updateRenderData();
    }

    private updateRenderData(): void {
        if (!this._assemblerData) return;

        this.initTexture2D();
        this.updateFontFormatting();
        this.updateFontCanvasSize();
        this.updateRenderMesh();
        this.updateFontRenderingStyle();
        this.updateTexture();
        this.updateMaterial();
        this.resetRenderData();
    }

    private initMeshRender(): void {
        this._meshRender = this.node.getComponent(MeshRenderer)!;
        if (!this._meshRender) {
            this._meshRender = this.node.addComponent(MeshRenderer);
        }
        this.initRenderMesh();
    }

    private initRenderMesh(): void {
        this._positions.push(-0.5, -0.5, 0);
        this._uvs.push(0, 1);
        this._positions.push(0.5, -0.5, 0);
        this._uvs.push(1, 1);
        this._positions.push(-0.5, 0.5, 0);
        this._uvs.push(0, 0);
        this._positions.push(-0.5, 0.5, 0);
        this._uvs.push(0, 0);
        this._positions.push(0.5, -0.5, 0);
        this._uvs.push(1, 1);
        this._positions.push(0.5, 0.5, 0);
        this._uvs.push(1, 0);

        this._meshRender.mesh = utils.MeshUtils.createMesh({
            positions: this._positions,
            uvs: this._uvs,
            minPos: { x: -0.5, y: -0.5, z: 0 },
            maxPos: { x: 0.5, y: 0.5, z: 0 }
        });
        this._meshRender.model?.updateWorldBound();
        this.updateMeshRenderMaterial();
    }

    private updateMeshRenderMaterial(): void {
        if (!this._meshRender || !this._material) return;
        this._meshRender.material = this._material;
    }

    private initTexture2D(): void {
        if (!this._texture) {
            let image: ImageAsset = new ImageAsset(this._canvas);
            this._texture = new Texture2D();
            this._texture.image = image;
        }
    }

    private updateTexture(): void {
        if (!this._context || !this._canvas) return;
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);

        let textPosX: number = 0;
        let textPosY: number = 0;

        this._context.lineWidth = this.lineWidth;
        this._context.strokeStyle = `rgba(${this.linecolor.r}, ${this.linecolor.g}, ${this.linecolor.b}, ${this.linecolor.a})`;

        for (let i = 0; i < this._splitStrings.length; i++) {
            textPosY = this._startPosition.y + (i + 1) * this.getLineHeight();
            let len: number = this._context.measureText(this._splitStrings[i]).width;
            textPosX = (this._canvas.width - len) / 2;

            this._context.strokeText(this._splitStrings[i], textPosX, textPosY);
            this._context.fillText(this._splitStrings[i], textPosX, textPosY);
        }

        let uploadAgain: boolean = this._canvas.width !== 0 && this._canvas.height !== 0;
        if (uploadAgain) {
            this._texture.reset({
                width: this._canvas.width,
                height: this._canvas.height,
                mipmapLevel: 1,
            });
            this._texture.uploadData(this._canvas);
            this._texture.setWrapMode(RenderTexture.WrapMode.CLAMP_TO_EDGE, RenderTexture.WrapMode.CLAMP_TO_EDGE);
        }
    }

    private updateMaterial(): void {
        if (!this._texture || !this._meshRender || !this._material) return;
        let material: Material = this._meshRender.getMaterialInstance(0)!;
        material.setProperty("mainTexture", this._texture);
    }

    private updateFontFormatting(): void {
        if (!this._context) return;
        let strs: string[] = this._string.split("\\n");
        this._splitStrings = strs;
        for (let i = 0; i < strs.length; i++) {
            let len: number = this._context.measureText(strs[i]).width;
            if (len > this._canvasSize.width) {
                this._canvasSize.width = len;
            }
        }
        this._canvasSize.height = strs.length * this.getLineHeight() + BASELINE_RATIO * this.getLineHeight();
    }

    private updateFontCanvasSize(): void {
        this._canvasSize.width = Math.min(this._canvasSize.width, MAX_SIZE);
        this._canvasSize.height = Math.min(this._canvasSize.height, MAX_SIZE);
        if (this._canvas.width != this._canvasSize.width) {
            this._canvas.width = this._canvasSize.width;
        }
        if (this._canvas.height != this._canvasSize.height) {
            this._canvas.height = this._canvasSize.height;
        }
        this._context.font = this.getFontDesc();
    }

    private updateFontRenderingStyle(): void {
        this._context.font = this.getFontDesc();
        this._context.lineJoin = "round";
        this._context.textAlign = "left";
        this._context.textBaseline = "alphabetic";

        const color: Color = this.Color;
        this._context.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    }

    private updateRenderMesh(): void {
        let rate: number = this._canvas.width / this._canvas.height;
        this._positions = [];
        this._positions.push(-0.5 * rate, -0.5, 0);
        this._positions.push(0.5 * rate, -0.5, 0);
        this._positions.push(-0.5 * rate, 0.5, 0);
        this._positions.push(-0.5 * rate, 0.5, 0);
        this._positions.push(0.5 * rate, -0.5, 0);
        this._positions.push(0.5 * rate, 0.5, 0);

        if (!this._meshRender) this.initMeshRender();
        this._meshRender.mesh = utils.MeshUtils.createMesh({
            positions: this._positions,
            uvs: this._uvs,
            minPos: { x: -0.5, y: -0.5, z: 0 },
            maxPos: { x: 0.5, y: 0.5, z: 0 }
        });
        this._meshRender.model?.updateWorldBound();
        this.updateMeshRenderMaterial();
    }

    private getLineHeight(): number {
        return this.lineHeight;
    }

    private getFontDesc() {
        return "bold 50px Arial";
    }

    private resetRenderData(): void {
        this._canvasSize.width = 0;
        this._canvasSize.height = 0;
    }

    update(deltaTime: number) { }

    onDisable() {
        if (this._assemblerData) {
            SimpleCanvasPool.put(this._assemblerData);
        }
        this._meshRender = null!;
    }
}