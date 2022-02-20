class YapaConfig {
    constructor() {
        // general
        this.updatePeriodMs = 10;
        this.fadeInDurationMs = 2000;

        // nodes
        this.nodeDensityFactor = 1.0;
        this.nodeVelocityFactor = 1.0;
        this.nodeRadius = 2.0;
        this.nodeColor = "#444";

        // connections
        this.connsEnabled = true;
        this.maxConnDistance = 200;
        this.connLineWidth = 1.0;
        this.connColor = "#666";

        // transmissions
        this.transmissionsEnabled = true;
        this.trasmissionSpawnPeriodMaxMs = 10000;
        this.transmissionSpeed = 2.0
        this.trasmissionColorA = "#FF0000"
        this.trasmissionColorB = "#0000FF"
    }
}

class Yapa {
    constructor(container, conf) {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container = container;
        this.container.appendChild(this.canvas);
        this.conf = conf;
    }

    reset() {
        this.pixelRatio = window.devicePixelRatio || 1;
        this.canvas.width = this.container.clientWidth * this.pixelRatio;
        this.canvas.height = this.container.clientHeight * this.pixelRatio;
        if (this.pixelRatio !== 1) {
            this.canvas.style.width = this.container.clientWidth + 'px';
            this.canvas.style.height = this.container.clientHeight + 'px';
        }
        this.squaredMaxConnDistance = this.conf.maxConnDistance * this.conf.maxConnDistance * this.pixelRatio * this.pixelRatio;
        this.fadeInAlpha = 0.0;
        this.transmissions = [];
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
            // node positions
            for (const node of this.nodes) {
                node.update();
            }
            // fade state after reset
            if (this.fadeInAlpha < 1.0) {
                this.fadeInAlpha += 1.0 / (this.conf.fadeInDurationMs / this.conf.updatePeriodMs);
            } else {
                this.fadeInAlpha = 1.0;
            }
            // transmissions progress
            for (const transmission of this.transmissions) {
                for (const section of transmission.sections) {
                    if (section[2] < 100) {
                        const distance = this.nodes[section[0]].squaredDistanceTo(this.nodes[section[1]]);
                        section[2] += (distance / this.squaredMaxConnDistance) * this.conf.transmissionSpeed;
                        break
                    }
                }
            }
            // drop finished transmissions
            this.transmissions = this.transmissions.filter(t => t.sections[t.sections.length - 1][2] < 100);
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
            this.ctx.arc(node.x, node.y, this.conf.nodeRadius * this.pixelRatio, 0, 2 * Math.PI);
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
                const d = a.squaredDistanceTo(b);
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

    startTransmission() {
        if (!document.hidden) {
            if (this.nodes.length >= 2) {
                const ai = Math.floor(Math.random() * this.nodes.length);
                let bi = ai;
                while (ai === bi) {
                    bi = Math.floor(Math.random() * this.nodes.length);
                }
                const path = this.shortestPath(ai, bi);
                if (path) {
                    const color = YapaColorHelpers.randColorInGradient(this.conf.trasmissionColorA, this.conf.trasmissionColorB);
                    this.transmissions.push(new YapaTransmission(path, color));
                }
            }
        }
        setTimeout(this.startTransmission.bind(this), Math.random() * this.conf.trasmissionSpawnPeriodMaxMs);
    }

    /*
    shortestPath tries to find the shortest path between node a (node index ai) and b (node index bi) in this.nodes
    to find that path, Dijkstra's algorithm (https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm) is used

    if there is no path available, undefined is returned

    let's waste some CPU cycles for a meaningless animation... :)
    */
    shortestPath(ai, bi) {
        // we are using the YapaNode instances itself to store the algorithm's states (hooray, side-effects):
        // - visited (false): this node was processed already
        // - distance (Infinity): the current smallest distance to node a
        // - parent (undefined): index of the next parent in the found path
        // for every call, we have to reset these states
        this.nodes.forEach(n => n.initPathFindingState());

        // select node a as current node, set distance to 0
        let current = ai;
        this.nodes[current].distance = 0;

        while (true) {
            let nearest = undefined;

            // 1) iterate all unvisited neighbours (for our use case, nodes with a squaredDistance <= this.squaredMaxConnDistance) of the current node, and...
            for (let i = 0; i < this.nodes.length; i++) {
                if (current === i || this.nodes[i].visited) continue;
                const squaredDistance = this.nodes[current].squaredDistanceTo(this.nodes[i]);
                if (squaredDistance > this.squaredMaxConnDistance) continue;
                // from now on we have to use the actual distance, otherwise the weighting won't work correctly
                let distance = Math.sqrt(squaredDistance);
                // ...calculate the distance to the node through the current node
                distance += this.nodes[current].distance;
                // ...if the new distance is smaller than the old one: replace it and assign the current node as parent
                if (distance < this.nodes[i].distance) {
                    this.nodes[i].distance = distance;
                    this.nodes[i].parent = current;
                }
                // ...check if this neighbour is the nearest one and replace the node index/distance if so
                if (!nearest) {
                    nearest = [i, distance];
                } else {
                    if (distance < nearest[1]) nearest = [i, distance];
                }
            }

            // 2) mark the current node as visited
            this.nodes[current].visited = true;

            if (nearest) {
                // 3a) select the nearest neighbour as current node
                current = nearest[0];
            } else {
                // 3b) if no unvisited neighbour was found, try to select the node with
                //     - the smallest distance
                //     - which was not visited before
                //     as current node
                let candidate = undefined;
                for (let i = 0; i < this.nodes.length; i++) {
                    if (this.nodes[i].visited) continue;
                    if (!candidate) {
                        candidate = [i, this.nodes[i].distance];
                    } else {
                        if (this.nodes[i].distance < candidate[1]) candidate = [i, this.nodes[i].distance];
                    }
                }
                if (candidate) {
                    current = candidate[0];
                } else {
                    // 4) no more unvisited nodes left, we are done
                    // ***
                    // we may have multiple graphs, which are not connected to each other
                    // in that case, when traversing the path back to node a, we will encounter a undefined parent and report back that there is no path available
                    // ***
                    const path = [];
                    path.push(bi);
                    let next = this.nodes[bi].parent;
                    while (next !== ai) {
                        if (next === undefined) {
                            return undefined;
                        }
                        path.push(next);
                        next = this.nodes[next].parent;
                    }
                    path.push(next);
                    return path.reverse();
                }
            }
        }
    }

    start() {
        this.reset();
        this.tick();
        if (this.conf.transmissionsEnabled) {
            this.startTransmission();
        }
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
        this.visited = undefined;
        this.distance = undefined;
        this.parent = undefined;
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

    initPathFindingState() {
        this.visited = false;
        this.distance = Infinity;
        this.parent = undefined;
    }
}

class YapaTransmission {
    constructor(path, color) {
        this.sections = [];
        for (let i = 1; i < path.length; i++) {
            // [from, to, progress]
            this.sections.push([path[i - 1], path[i], 0]);
        }
        this.color = color;
    }
}

class YapaColorHelpers {
    static toHexStr(v) {
        v = Math.ceil(v);
        v = v.toString(16);
        return (v.length === 1) ? '0' + v : v;
    }

    static randColorInGradient(c1, c2) {
        c1 = c1.replace("#", "");
        c2 = c2.replace("#", "");
        const pos = Math.random();
        const r = parseInt(c1.substring(0, 2), 16) * pos + parseInt(c2.substring(0, 2), 16) * (1 - pos);
        const g = parseInt(c1.substring(2, 4), 16) * pos + parseInt(c2.substring(2, 4), 16) * (1 - pos);
        const b = parseInt(c1.substring(4, 6), 16) * pos + parseInt(c2.substring(4, 6), 16) * (1 - pos);
        return "#" + YapaColorHelpers.toHexStr(r) + YapaColorHelpers.toHexStr(g) + YapaColorHelpers.toHexStr(b);
    }
}
