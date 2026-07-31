// Pipeline backdrop for technologist mode.
//
// ETL graphs with packets travelling their edges. It describes the work —
// automation and data plumbing — rather than the act of typing, which is
// where every "developer background" ends up by default.
//
// Three decisions worth keeping:
//
//   * No node labels. This canvas is fixed behind a long page, so labelled
//     boxes would sit in view the whole way down and read as UI rather than
//     backdrop. Unlabelled, the graph stays structure. (The names below are
//     never drawn — they document what each column is for.)
//   * Each graph is wider than the viewport and pans with scroll position, so
//     travelling down the page travels along the pipeline. Without that, the
//     same nodes sit motionless behind the entire document.
//   * Three lanes rather than one, at different heights and pan rates. One
//     centred graph left the top and bottom of the viewport empty, and the
//     outer lanes moving slower than the middle reads as depth.
//
// Packets flow on arrival, on every click, and on an idle cadence in between,
// so the graph is never inert for long.
//
// A click also drops a node into the nearest lane and wires it into the
// flanking columns. It takes a real column index, so the existing run wave
// carries packets through it with no special handling — the node someone
// placed becomes part of the pathway rather than an ornament beside it.

const LANES = [
    {
        // Above: a light ingest loop, dim and slow.
        cy: 0.19, rowGap: 0.075, span: 2.2, alpha: 0.5, nodeR: 3.0, dotR: 1.9,
        stages: [['watch'], ['poll', 'tail'], ['queue'], ['batch', 'stream'], ['cache'], ['emit']],
    },
    {
        // The original graph, kept as the prominent one.
        cy: 0.50, rowGap: 0.155, span: 2.4, alpha: 1, nodeR: 4.0, dotR: 2.6,
        stages: [
            ['ingest', 'fetch'],
            ['parse', 'validate', 'clean'],
            ['join', 'reproject'],
            ['model', 'calibrate', 'score'],
            ['export', 'publish'],
        ],
    },
    {
        // Below: a geospatial publish chain, dimmest and slowest.
        cy: 0.81, rowGap: 0.07, span: 2.0, alpha: 0.45, nodeR: 2.8, dotR: 1.8,
        stages: [['scrape'], ['clean', 'dedupe'], ['geocode'], ['tile', 'style'], ['publish'], ['audit']],
    },
];

const PACKET_MS = 900;        // time for a packet to cross one edge
const COLUMN_STAGGER = 520;   // delay between columns firing on a run
const LANE_STAGGER = 240;     // delay between lanes when the whole graph fires
// Two packets per edge per firing, the second trailing. One dot per edge read
// as too sparse once the graph grew to three lanes.
const PACKET_TRAIL = [0, 260];
const EDGE_PACKET_CAP = 6;    // bounds rapid clicking
const AUTO_MIN = 5200;        // idle cadence: soonest a lane fires again
const AUTO_VAR = 4200;
const FIRST_AUTO = 2800;      // first idle run lands shortly after arrival's
const PLACED_CAP = 24;        // click-placed nodes; past this a click only fires
const PLACED_FANOUT = 2;      // wires per side on a placed node

// `placed` is owned by the caller and holds click-placed nodes as normalised
// graph coordinates, so they survive both a resize (which rebuilds the lanes)
// and a theme change (which rebuilds this whole module).
export function createPipeline(ctx, palette, placed = []) {
    let width = 0;
    let height = 0;
    let lanes = [];
    let autoT = 0;
    let autoNext = FIRST_AUTO;

    // Slot a node into a lane at graph coordinates (gx, gy). It adopts the
    // column index of the nearest column and wires to the closest few nodes on
    // either side: inbound from the column before, outbound to the one after.
    // On the first or last column one side comes up empty, which leaves the
    // node a new source or a new sink — still a pathway, just a shorter one.
    function attach(lane, gx, gy, lit) {
        let ci = 0;
        let bestD = Infinity;
        for (const n of lane.nodes) {
            const d = Math.abs(n.x - gx);
            if (d < bestD) { bestD = d; ci = n.ci; }
        }

        const node = { label: 'placed', x: gx, y: gy, ci, lit };
        lane.nodes.push(node);

        const near = (c) => lane.nodes
            .filter((n) => n.ci === c && n !== node)
            .sort((a, b) => Math.hypot(a.x - gx, a.y - gy) - Math.hypot(b.x - gx, b.y - gy))
            .slice(0, PLACED_FANOUT);
        for (const f of near(ci - 1)) lane.edges.push({ f, t: node, packets: [] });
        for (const t of near(ci + 1)) lane.edges.push({ f: node, t, packets: [] });

        return node;
    }

    function resize(w, h) {
        width = w;
        height = h;

        lanes = LANES.map((cfg, li) => {
            const graphW = w * cfg.span;
            const nodes = [];
            const edges = [];
            const cols = cfg.stages.length;

            cfg.stages.forEach((col, ci) => {
                col.forEach((label, ri) => {
                    nodes.push({
                        label,
                        x: graphW * (0.05 + 0.9 * (ci / (cols - 1))),
                        y: h * (cfg.cy + (ri - (col.length - 1) / 2) * cfg.rowGap),
                        ci,
                        lit: 0,
                    });
                });
            });

            // Fan out and back in between adjacent columns. Deterministic from
            // the index, so the shape is stable across resizes; the lane index
            // shifts the pattern so the three don't come out cloned.
            for (let ci = 0; ci < cols - 1; ci++) {
                const from = nodes.filter((n) => n.ci === ci);
                const to = nodes.filter((n) => n.ci === ci + 1);
                from.forEach((f, fi) => {
                    to.forEach((t, ti) => {
                        if ((fi * 3 + ti * 5 + ci + li) % 4 !== 3) edges.push({ f, t, packets: [] });
                    });
                });
            }

            return { ...cfg, graphW, nodes, edges, cols, runT: null, pan: 0 };
        });

        // Re-apply anything clicked into the graph, once every lane exists.
        // Unlit, so resizing the window does not flash them all as new.
        for (const p of placed) {
            const lane = lanes[p.li];
            if (lane) attach(lane, p.nx * lane.graphW, p.ny * h, 0);
        }
    }

    // Drop a node at a screen position, into whichever lane runs nearest it.
    function addNode(x, y) {
        if (!lanes.length || placed.length >= PLACED_CAP) return null;

        let lane = lanes[0];
        let li = 0;
        let bestD = Infinity;
        lanes.forEach((l, i) => {
            const d = Math.abs(l.cy * height - y);
            if (d < bestD) { bestD = d; lane = l; li = i; }
        });

        const gx = x + lane.pan;
        placed.push({ li, nx: gx / lane.graphW, ny: y / height });
        // Arrives lit, so it gets the same birth ring a fired node gets and
        // then decays into looking like every other node in the lane.
        return attach(lane, gx, y, 1);
    }

    const fireColumn = (lane, ci) => {
        for (const e of lane.edges) {
            if (e.f.ci !== ci) continue;
            for (const wait of PACKET_TRAIL) {
                if (e.packets.length < EDGE_PACKET_CAP) e.packets.push({ k: 0, wait });
            }
        }
        for (const n of lane.nodes) if (n.ci === ci) n.lit = 1;
    };

    // Fire one lane from its first column.
    const startLane = (lane, delay = 0) => { lane.runT = -delay; };

    // Fire everything: lane by lane, each column following the last.
    const run = () => lanes.forEach((lane, i) => startLane(lane, i * LANE_STAGGER));

    // Clicking lights the node nearest the pointer and fires its own edges, so
    // the click has an immediate local effect. The caller also kicks a full
    // run, which is what makes a click send data all the way down.
    function pulse(x, y) {
        let best = null;
        let bestD = Infinity;
        for (const lane of lanes) {
            for (const n of lane.nodes) {
                const d = Math.hypot(n.x - lane.pan - x, n.y - y);
                if (d < bestD) { bestD = d; best = { lane, n }; }
            }
        }
        if (!best || bestD > 320) return;
        best.n.lit = 1;
        for (const e of best.lane.edges) {
            if (e.f === best.n && e.packets.length < EDGE_PACKET_CAP) e.packets.push({ k: 0 });
        }
    }

    function frame(t, dt, scrollY, mouse) {
        if (!lanes.length) return;

        // Scroll position maps onto the length of each pipeline, so the whole
        // page is one traverse from ingest to publish. Lanes have different
        // spans, so they travel at different rates.
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - height);
        const progress = Math.min(1, Math.max(0, scrollY / maxScroll));

        // Idle cadence: one lane at a time, so the graph keeps ticking over
        // without the busyness of firing all three.
        autoT += dt;
        if (autoT >= autoNext) {
            autoT = 0;
            autoNext = AUTO_MIN + Math.random() * AUTO_VAR;
            startLane(lanes[Math.floor(Math.random() * lanes.length)]);
        }

        for (const lane of lanes) {
            lane.pan = progress * Math.max(0, lane.graphW - width);

            // Advance a run, firing each column as the wave reaches it. runT
            // starts negative when a lane is staggered, so column 0 fires as
            // it crosses zero.
            if (lane.runT !== null) {
                const before = lane.runT;
                lane.runT += dt;
                for (let ci = 0; ci < lane.cols - 1; ci++) {
                    const at = ci * COLUMN_STAGGER;
                    if (before <= at && lane.runT > at) fireColumn(lane, ci);
                }
                if (lane.runT > lane.cols * COLUMN_STAGGER + PACKET_MS) lane.runT = null;
            }

            const a = lane.alpha;

            ctx.save();
            ctx.translate(-lane.pan, 0);

            for (const e of lane.edges) {
                const d = Math.hypot(e.f.x - lane.pan - mouse.x, e.f.y - mouse.y);
                const near = d < 260 ? 1 - d / 260 : 0;
                ctx.strokeStyle = `rgba(${palette.edge}, ${(0.16 + near * 0.4) * a})`;
                ctx.lineWidth = 1;
                const cx = (e.f.x + e.t.x) / 2;
                ctx.beginPath();
                ctx.moveTo(e.f.x, e.f.y);
                // A gentle S-curve, so the graph reads as wired rather than as
                // a spider web of straight lines.
                ctx.bezierCurveTo(cx, e.f.y, cx, e.t.y, e.t.x, e.t.y);
                ctx.stroke();

                for (let i = e.packets.length - 1; i >= 0; i--) {
                    const pk = e.packets[i];
                    // A trailing packet waits at its source rather than being
                    // drawn behind it, which extrapolating the curve would do.
                    if (pk.wait > 0) { pk.wait -= dt; continue; }
                    pk.k += dt / PACKET_MS;
                    if (pk.k >= 1) { e.packets.splice(i, 1); e.t.lit = 1; continue; }
                    const k = pk.k;
                    const mt = 1 - k;
                    // Along the same cubic the edge is drawn with.
                    const px = mt ** 3 * e.f.x + 3 * mt ** 2 * k * cx + 3 * mt * k ** 2 * cx + k ** 3 * e.t.x;
                    const py = mt ** 3 * e.f.y + 3 * mt ** 2 * k * e.f.y + 3 * mt * k ** 2 * e.t.y + k ** 3 * e.t.y;
                    ctx.fillStyle = `rgba(${palette.kw}, ${0.9 * (1 - Math.abs(k - 0.5) * 0.6) * a})`;
                    ctx.beginPath();
                    ctx.arc(px, py, lane.dotR, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            for (const n of lane.nodes) {
                n.lit *= 0.97;
                const d = Math.hypot(n.x - lane.pan - mouse.x, n.y - mouse.y);
                const hover = d < 90 ? 1 - d / 90 : 0;
                const glow = Math.max(n.lit, hover);

                ctx.fillStyle = `rgba(${glow > 0.25 ? palette.kw : palette.fn}, ${(0.35 + glow * 0.55) * a})`;
                ctx.beginPath();
                ctx.arc(n.x, n.y, lane.nodeR + glow * 2.5, 0, Math.PI * 2);
                ctx.fill();

                if (glow > 0.05) {
                    ctx.strokeStyle = `rgba(${palette.fn}, ${(0.4 + glow * 0.6) * a})`;
                    ctx.lineWidth = 1.2 + glow;
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, lane.nodeR * 2.5 + glow * 6, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }

            ctx.restore();
        }
    }

    return { resize, frame, run, pulse, addNode };
}
