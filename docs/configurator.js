const config = new YapaConfig();
const yapa = new Yapa(document.getElementById("yapa"), config);

const node_density_ctrl = document.getElementById("node_density");
node_density_ctrl.value = config.nodeDensityFactor;
node_density_ctrl.addEventListener("input", () => {
    config.nodeDensityFactor = parseFloat(node_density_ctrl.value);
    yapa.reset();
    updateConfigCode();
});

const node_velocity_ctrl = document.getElementById("node_velocity");
node_velocity_ctrl.value = config.nodeVelocityFactor;
node_velocity_ctrl.addEventListener("input", () => {
    config.nodeVelocityFactor = parseFloat(node_velocity_ctrl.value);
    yapa.reset();
    updateConfigCode();
});

const node_radius_ctrl = document.getElementById("node_radius");
node_radius_ctrl.value = config.nodeRadius;
node_radius_ctrl.addEventListener("input", () => {
    config.nodeRadius = parseFloat(node_radius_ctrl.value);
    updateConfigCode();
});

const conns_enabled_ctrl = document.getElementById("conns_enabled");
conns_enabled_ctrl.checked = config.connsEnabled;
conns_enabled_ctrl.addEventListener("change", evt => {
    config.connsEnabled = evt.target.checked;
    conns_distance_ctrl.disabled = !evt.target.checked;
    conns_width_ctrl.disabled = !evt.target.checked;
    updateConfigCode();
});

const conns_distance_ctrl = document.getElementById("conns_distance");
conns_distance_ctrl.value = config.maxConnDistance;
conns_distance_ctrl.addEventListener("input", () => {
    config.maxConnDistance = parseInt(conns_distance_ctrl.value);
    yapa.reset();
    updateConfigCode();
});

const conns_width_ctrl = document.getElementById("conns_width");
conns_width_ctrl.value = config.connLineWidth;
conns_width_ctrl.addEventListener("input", () => {
    config.connLineWidth = parseFloat(conns_width_ctrl.value);
    updateConfigCode();
});

const bg_color_ctrl = document.getElementById("bg_color");
bg_color_ctrl.parentElement.style.backgroundColor = document.body.style.backgroundColor;
bg_color_ctrl.addEventListener("input", evt => {
    document.body.style.backgroundColor = evt.target.value;
    evt.target.parentElement.style.backgroundColor = evt.target.value;
    if (darkPrimaryColorByBG(evt.target.value)) {
        document.body.className = "dark";
    } else {
        document.body.className = "light";
    }
});

const node_color_ctrl = document.getElementById("node_color");
node_color_ctrl.parentElement.style.backgroundColor = config.nodeColor;
node_color_ctrl.addEventListener("input", evt => {
    evt.target.parentElement.style.backgroundColor = evt.target.value;
    config.nodeColor = evt.target.value;
    updateConfigCode();
});

const conn_color_cntr = document.getElementById("conn_color");
conn_color_cntr.parentElement.style.backgroundColor = config.connColor;
conn_color_cntr.addEventListener("input", evt => {
    evt.target.parentElement.style.backgroundColor = evt.target.value;
    config.connColor = evt.target.value;
    updateConfigCode();
});

const trans_enabled_ctrl = document.getElementById("trans_enabled");
trans_enabled_ctrl.checked = config.transmissionsEnabled;
trans_enabled_ctrl.addEventListener("change", evt => {
    config.transmissionsEnabled = evt.target.checked;
    trans_interval_crtl.disabled = !evt.target.checked;
    trans_speed_crtl.disabled = !evt.target.checked;
    trans_width_crtl.disabled = !evt.target.checked;
    packets_enabled_ctrl.disabled = !evt.target.checked;
    updateConfigCode();
});

const trans_interval_crtl = document.getElementById("trans_interval");
trans_interval_crtl.value = config.transmissionSpawnPeriodMaxMs;
trans_interval_crtl.addEventListener("input", () => {
    config.transmissionSpawnPeriodMaxMs = parseInt(trans_interval_crtl.value);
    updateConfigCode();
});

const trans_speed_crtl = document.getElementById("trans_speed");
trans_speed_crtl.value = config.transmissionSpeedFactor;
trans_speed_crtl.addEventListener("input", () => {
    config.transmissionSpeedFactor = parseFloat(trans_speed_crtl.value);
    updateConfigCode();
});

const trans_width_crtl = document.getElementById("trans_width");
trans_width_crtl.value = config.transmissionWidthFactor;
trans_width_crtl.addEventListener("input", () => {
    config.transmissionWidthFactor = parseFloat(trans_width_crtl.value);
    updateConfigCode();
});

const color_trans_a = document.getElementById("color_trans_a");
color_trans_a.parentElement.style.backgroundColor = config.trasmissionColorA;
color_trans_a.addEventListener("input", evt => {
    evt.target.parentElement.style.backgroundColor = evt.target.value;
    config.trasmissionColorA = evt.target.value;
    updateConfigCode();
});

const color_trans_b = document.getElementById("color_trans_b");
color_trans_b.parentElement.style.backgroundColor = config.trasmissionColorB;
color_trans_b.addEventListener("input", evt => {
    evt.target.parentElement.style.backgroundColor = evt.target.value;
    config.trasmissionColorB = evt.target.value;
    updateConfigCode();
});

const packets_enabled_ctrl = document.getElementById("packets_enabled");
packets_enabled_ctrl.checked = config.transmissionsDrawPackets;
packets_enabled_ctrl.addEventListener("change", evt => {
    config.transmissionsDrawPackets = evt.target.checked;
    updateConfigCode();
});

yapa.start();

function darkPrimaryColorByBG(c) {
    c = c.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    // perceived brightness - poor blue :(
    const y = (r * 3 + b + g * 4) / 8;
    return y < 128;
}

const genconfig = document.getElementById("generated");
updateConfigCode();

document.getElementById("codegen_active").addEventListener("change", evt => {
    genconfig.style.display = evt.target.checked ? "block" : "none"
});

function updateConfigCode() {
    const gen = [];
    gen.push("&lt;div id=\"yapa\"&gt;&lt;/div&gt;");
    gen.push("&lt;script src=\"https://tmsmr.github.io/yapa/versions/yapa-0.9.0.js\"\n        integrity=\"sha384-AFn1hF2ZD8nrdct36hqTtB3/z8dJZF6UEVvrC5KEvrEzsv7Kebpa7+u7qSSQu0a6\"\n&gt;&lt;/script&gt;")
    gen.push("&lt;script type=\"text/javascript\"&gt;");
    gen.push("\tconst conf = new YapaConfig();")
    for (let key of Object.keys(config)) {
        let property = "\tconf." + key + " = ";
        if (typeof config[key] === "string") {
            property += "\"" + config[key] + "\";";
        } else {
            property += config[key] + ";";
        }
        gen.push(property);
    }
    gen.push("");
    gen.push("\tconst container = document.getElementById(\"yapa\");");
    gen.push("\tconst yapa = new Yapa(container, conf);");
    gen.push("\tyapa.start();");
    gen.push("&lt;/script&gt;");
    genconfig.innerHTML = gen.join("\n");
    hljs.highlightAll();
}
