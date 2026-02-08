import { _decorator, Component, Node, Sprite, UITransform, Color, Layout, Widget, Label, Button, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * UI辅助工具类 - 用于快速生成游戏UI结构
 * 在编辑器中运行一次即可自动创建所有节点
 */
@ccclass('JZDW_UIHelper')
export class JZDW_UIHelper extends Component {
    
    @property
    autoGenerate: boolean = false;

    start() {
        if (this.autoGenerate) {
            this.generateUI();
        }
    }

    generateUI() {
        console.log('开始生成UI结构...');
        
        // 创建左侧容器
        this.createLeftContainer();
        
        // 创建右侧容器
        this.createRightContainer();
        
        // 创建中间人物
        this.createCharacter();
        
        // 创建血量容器
        this.createHpContainer();
        
        // 创建关卡标签
        this.createLevelLabel();
        
        // 创建倒计时面板
        this.createCountdownPanel();
        
        // 创建胜利面板
        this.createWinPanel();
        
        // 创建失败面板
        this.createLosePanel();
        
        console.log('UI结构生成完成！');
    }

    createLeftContainer() {
        const container = new Node('LeftContainer');
        container.setParent(this.node);
        
        const layout = container.addComponent(Layout);
        layout.type = Layout.Type.GRID;
        layout.startAxis = Layout.AxisDirection.HORIZONTAL;
        layout.spacingX = 20;
        layout.spacingY = 20;
        layout.paddingLeft = 10;
        layout.paddingTop = 10;
        
        const transform = container.getComponent(UITransform);
        transform.setContentSize(400, 600);
        container.setPosition(-300, 0, 0);
        
        // 创建8个子项
        for (let i = 0; i < 8; i++) {
            const item = new Node(`LeftItem${i + 1}`);
            item.setParent(container);
            
            const sprite = item.addComponent(Sprite);
            const itemTransform = item.getComponent(UITransform);
            itemTransform.setContentSize(150, 150);
            
            sprite.color = new Color(200, 200, 200, 255);
        }
    }

    createRightContainer() {
        const container = new Node('RightContainer');
        container.setParent(this.node);
        
        const layout = container.addComponent(Layout);
        layout.type = Layout.Type.VERTICAL;
        layout.spacingY = 30;
        layout.paddingTop = 10;
        
        const transform = container.getComponent(UITransform);
        transform.setContentSize(200, 700);
        container.setPosition(350, 0, 0);
        
        // 创建4个子项（带按钮）
        for (let i = 0; i < 4; i++) {
            const item = new Node(`RightItem${i + 1}`);
            item.setParent(container);
            
            const sprite = item.addComponent(Sprite);
            const button = item.addComponent(Button);
            const itemTransform = item.getComponent(UITransform);
            itemTransform.setContentSize(150, 150);
            
            sprite.color = new Color(180, 180, 255, 255);
        }
    }

    createCharacter() {
        const character = new Node('Character');
        character.setParent(this.node);
        
        const sprite = character.addComponent(Sprite);
        const transform = character.getComponent(UITransform);
        transform.setContentSize(200, 300);
        
        sprite.color = new Color(255, 200, 100, 255);
        character.setPosition(0, -50, 0);
    }

    createSelectFrame() {
        const frame = new Node('SelectFrame');
        frame.setParent(this.node);
        
        const sprite = frame.addComponent(Sprite);
        const transform = frame.getComponent(UITransform);
        transform.setContentSize(160, 160);
        
        sprite.color = new Color(255, 0, 0, 255);
        frame.active = false;
    }

    createCountdownPanel() {
        const panel = new Node('CountdownPanel');
        panel.setParent(this.node);
        
        const transform = panel.getComponent(UITransform);
        transform.setContentSize(1920, 1080);
        panel.setPosition(0, 0, 0);
        
        // 黑色背景
        const bg = new Node('Background');
        bg.setParent(panel);
        const bgSprite = bg.addComponent(Sprite);
        const bgTransform = bg.getComponent(UITransform);
        bgTransform.setContentSize(1920, 1080);
        bgSprite.color = new Color(0, 0, 0, 230);
        
        // 倒计时数字
        const countLabel = new Node('CountdownLabel');
        countLabel.setParent(panel);
        const label = countLabel.addComponent(Label);
        label.string = '3';
        label.fontSize = 120;
        label.lineHeight = 120;
        label.color = new Color(255, 255, 255, 255);
        countLabel.setPosition(0, 0, 0);
        
        panel.active = false;
    }

    createHpContainer() {
        const container = new Node('HpContainer');
        container.setParent(this.node);
        
        const layout = container.addComponent(Layout);
        layout.type = Layout.Type.HORIZONTAL;
        layout.spacingX = 15;
        
        const transform = container.getComponent(UITransform);
        transform.setContentSize(300, 60);
        container.setPosition(0, 400, 0);
        
        // 创建5个血量图标
        for (let i = 0; i < 5; i++) {
            const hp = new Node(`${i + 1}`);
            hp.setParent(container);
            
            const hpTransform = hp.getComponent(UITransform);
            hpTransform.setContentSize(50, 50);
            
            // 创建爱心灰（背景）
            const heartGray = new Node('爱心灰');
            heartGray.setParent(hp);
            const graySprite = heartGray.addComponent(Sprite);
            const grayTransform = heartGray.getComponent(UITransform);
            grayTransform.setContentSize(50, 50);
            graySprite.color = new Color(100, 100, 100, 255);
            heartGray.active = false; // 初始隐藏
            
            // 创建爱心（前景）
            const heart = new Node('爱心');
            heart.setParent(hp);
            const heartSprite = heart.addComponent(Sprite);
            const heartTransform = heart.getComponent(UITransform);
            heartTransform.setContentSize(50, 50);
            heartSprite.color = new Color(255, 0, 0, 255);
            heart.active = true; // 初始显示
        }
    }

    createLevelLabel() {
        const labelNode = new Node('LevelLabel');
        labelNode.setParent(this.node);
        
        const label = labelNode.addComponent(Label);
        label.string = '1/5';
        label.fontSize = 40;
        label.lineHeight = 40;
        
        const transform = labelNode.getComponent(UITransform);
        transform.setContentSize(200, 50);
        labelNode.setPosition(0, 480, 0);
    }

    createWinPanel() {
        const panel = new Node('WinPanel');
        panel.setParent(this.node);
        
        const transform = panel.getComponent(UITransform);
        transform.setContentSize(500, 400);
        panel.setPosition(0, 0, 0);
        
        // 背景
        const bg = new Node('Background');
        bg.setParent(panel);
        const bgSprite = bg.addComponent(Sprite);
        const bgTransform = bg.getComponent(UITransform);
        bgTransform.setContentSize(500, 400);
        bgSprite.color = new Color(0, 0, 0, 200);
        
        // 标题
        const title = new Node('Title');
        title.setParent(panel);
        const titleLabel = title.addComponent(Label);
        titleLabel.string = '胜利！';
        titleLabel.fontSize = 60;
        title.setPosition(0, 100, 0);
        
        // 重新开始按钮
        this.createButton(panel, 'RestartBtn', '重新开始', new Vec3(0, -50, 0));
        
        // 返回按钮
        this.createButton(panel, 'BackBtn', '返回', new Vec3(0, -150, 0));
        
        panel.active = false;
    }

    createLosePanel() {
        const panel = new Node('LosePanel');
        panel.setParent(this.node);
        
        const transform = panel.getComponent(UITransform);
        transform.setContentSize(500, 400);
        panel.setPosition(0, 0, 0);
        
        // 背景
        const bg = new Node('Background');
        bg.setParent(panel);
        const bgSprite = bg.addComponent(Sprite);
        const bgTransform = bg.getComponent(UITransform);
        bgTransform.setContentSize(500, 400);
        bgSprite.color = new Color(0, 0, 0, 200);
        
        // 标题
        const title = new Node('Title');
        title.setParent(panel);
        const titleLabel = title.addComponent(Label);
        titleLabel.string = '失败！';
        titleLabel.fontSize = 60;
        titleLabel.color = new Color(255, 100, 100, 255);
        title.setPosition(0, 100, 0);
        
        // 重新开始按钮
        this.createButton(panel, 'RestartBtn', '重新开始', new Vec3(0, -50, 0));
        
        // 返回按钮
        this.createButton(panel, 'BackBtn', '返回', new Vec3(0, -150, 0));
        
        panel.active = false;
    }

    createButton(parent: Node, name: string, text: string, position: Vec3) {
        const btn = new Node(name);
        btn.setParent(parent);
        btn.setPosition(position);
        
        const button = btn.addComponent(Button);
        const sprite = btn.addComponent(Sprite);
        const transform = btn.getComponent(UITransform);
        transform.setContentSize(200, 80);
        
        sprite.color = new Color(100, 200, 100, 255);
        
        // 按钮文字
        const labelNode = new Node('Label');
        labelNode.setParent(btn);
        const label = labelNode.addComponent(Label);
        label.string = text;
        label.fontSize = 32;
        label.lineHeight = 32;
    }
}
