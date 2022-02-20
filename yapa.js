class YapaConfig {
    constructor() {
        // general
        this.updatePeriodMs = 10;
        this.fadeInDurationMs = 2000;

        // nodes
        this.nodeDensityFactor = 1.0;
        this.nodeVelocityFactor = 1.0;
        this.nodeRadius = 2.0;
        this.nodeColor = "#FFF";

        // connections
        this.connsEnabled = true;
        this.maxConnDistance = 200;
        this.connLineWidth = 1.0;
        this.connColor = "#EEE";
    }
}

class Yapa {
    constructor(container, conf) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container = container;
        this.container.appendChild(this.canvas);
        this.conf = conf;
        this.fadeInAlpha = 0.0;
    }

    reset() {
        this.pixelRatio = window.devicePixelRatio || 1;
        this.canvas.width = this.container.clientWidth * this.pixelRatio;
        this.canvas.height = this.container.clientHeight * this.pixelRatio;
        if (this.pixelRatio !== 1) {
            this.canvas.style.width = this.container.clientWidth + 'px';
            this.canvas.style.height = this.container.clientHeight + 'px';
        }
        this.squaredMaxConnDistance = this.conf.maxConnDistance * this.conf.maxConnDistance * this.pixelRatio;
        this.fadeInAlpha = 0.0;
        this.populate();
    }

    populate() {
        const nodes = [];
        const area = [this.canvas.width, this.canvas.height];
        let nodeCount = Math.floor(((this.container.clientWidth * this.container.clientHeight) / (100 * 100)) * this.conf.nodeDensityFactor);
        while (nodeCount--) {
            nodes.push(new YapaNode(area, this.conf.nodeVelocityFactor * this.pixelRatio));
        }
        this.nodes = nodes;
    }

    tick() {
        if (!document.hidden) {
            for (const node of this.nodes) {
                node.update();
            }
        }
        if (this.fadeInAlpha < 1.0) {
            this.fadeInAlpha += 1.0 / (this.conf.fadeInDurationMs / this.conf.updatePeriodMs);
        } else {
            this.fadeInAlpha = 1.0;
        }
        setTimeout(this.tick.bind(this), this.conf.updatePeriodMs);
    }

    draw() {
        if (this.nodes.length > 0) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawNodes();
            if (this.conf.connsEnabled) {
                this.drawConns();
            }
        }
        window.requestAnimationFrame(this.draw.bind(this));
    }

    drawNodes() {
        this.ctx.globalAlpha = this.fadeInAlpha;
        this.ctx.fillStyle = this.conf.nodeColor;
        for (const node of this.nodes) {
            this.ctx.beginPath();
            this.ctx.arc(
                node.x,
                node.y,
                this.conf.nodeRadius * this.pixelRatio,
                0,
                2 * Math.PI
            );
            this.ctx.fill();
        }
    }

    drawConns() {
        this.ctx.strokeStyle = this.conf.connColor;
        this.ctx.lineWidth = this.conf.connLineWidth * this.pixelRatio;
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const a = this.nodes[i];
                const b = this.nodes[j];
                const d = a.squaredDistanceTo(b) / this.pixelRatio;
                if (d > this.squaredMaxConnDistance) {
                    continue;
                }
                this.ctx.globalAlpha = (1 - d / this.squaredMaxConnDistance) * this.fadeInAlpha;
                this.ctx.beginPath();
                this.ctx.moveTo(a.x, a.y);
                this.ctx.lineTo(b.x, b.y);
                this.ctx.stroke();
            }
        }
    }

    start() {
        this.reset();
        this.tick();
        this.draw();
        window.addEventListener("resize", this.reset.bind(this));
    }
}

class YapaNode {
    constructor(area, nodeVelocityFactor) {
        this.area = area;
        this.x = Math.floor(Math.random() * this.area[0]);
        this.y = Math.floor(Math.random() * this.area[1]);
        this.dx = (Math.random() - 0.5) * nodeVelocityFactor;
        this.dy = (Math.random() - 0.5) * nodeVelocityFactor;
    }

    update() {
        if (this.x + this.dx > this.area[0] || this.x + this.dx < 0) this.dx = -this.dx;
        if (this.y + this.dy > this.area[1] || this.y + this.dy < 0) this.dy = -this.dy;
        this.x += this.dx;
        this.y += this.dy;
    }

    squaredDistanceTo(other) {
        let dx = this.x - other.x;
        let dy = this.y - other.y;
        return dx * dx + dy * dy;
    }
}
