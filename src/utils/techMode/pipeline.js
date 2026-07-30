// Pipeline backdrop for technologist mode.
//
// An ETL graph with packets travelling its edges. It describes the work —
// automation and data plumbing — rather than the act of typing, which is
// where every "developer background" ends up by default.
//
// Two decisions worth keeping:
//
//   * No node labels. This canvas is fixed behind a long page, so labelled
//     boxes would sit in view the whole way down and read as UI rather than
//     backdrop. Unlabelled, the graph stays structure.
//   * The graph is wider than the viewport and pans with scroll position, so
//     travelling down the page travels along the pipeline. Without that, the
//     same nodes sit motionless behind the entire document.

const STAGES = [
    ['ingest', 'fetch'],
    ['parse', 'validate', 'clean'],
    ['join', 'reproject'],
    ['model', 'calibrate', 'score'],
    ['export', 'publish'],
];

const GRAPH_SPAN = 2.4;      // multiples of viewport width
const PACKET_MS = 900;       // time for a packet to cross one edge
const COLUMN_STAGGER = 700;  // delay between columns firing on a run

export function createPipeline(ctx, palette) {
    let width = 0;
    let height = 0;
    let graphW = 0;
    let nodes = [];
    let edges = [];
    let runT = -1;           // -1 when idle; counts up during a run
    let pan = 0;

    function resize(w, h) {
        width = w;
        height = h;
        graphW = w * GRAPH_SPAN;
        nodes = [];
        edges = [];

        STAGES.forEach((col, ci) => {
            col.forEach((label, ri) => {
                nodes.push({
                    label,
                    x: graphW * (0.05 + 0.9 * (ci / (STAGES.length - 1))),
                    y: h * (0.5 + (ri - (col.length - 1) / 2) * 0.16),
                    ci,
                    lit: 0,
                });
            });
        });

        // Fan out and back in between adjacent columns. Deterministic from
        // the index, so the shape is stable across resizes.
        for (let ci = 0; ci < STAGES.length - 1; ci++) {
            const from = nodes.filter((n) => n.ci === ci);
            const to = nodes.filter((n) => n.ci === ci + 1);
            from.forEach((f, fi) => {
                to.forEach((t, ti) => {
                    if ((fi * 3 + ti * 5 + ci) % 4 !== 3) edges.push({ f, t, packets: [] });
                });
            });
        }
    }

    // Fire the whole graph: column 0 first, later columns following.
    const run = () => { runT = 0; };

    // Clicking injects packets from the node nearest the pointer.
    function pulse(x, y) {
        if (!nodes.length) return;
        let best = null;
        let bestD = Infinity;
        for (const n of nodes) {
            const d = Math.hypot(n.x - pan - x, n.y - y);
            if (d < bestD) { bestD = d; best = n; }
        }
        if (!best || bestD > 320) return;
        best.lit = 1;
        for (const e of edges) if (e.f === best) e.packets.push({ k: 0 });
    }

    function frame(t, dt, scrollY, mouse) {
        if (!nodes.length) return;

        // Scroll position maps onto the length of the pipeline, so the whole
        // page is one traverse from ingest to publish.
        const maxScroll = Math.max(1, document.documentElement.scrollHeight - height);
        pan = Math.min(1, Math.max(0, scrollY / maxScroll)) * (graphW - width);

        // Advance a run, firing each column as the wave reaches it.
        if (runT >= 0) {
            const before = runT;
            runT += dt;
            for (let ci = 0; ci < STAGES.length - 1; ci++) {
                const at = ci * COLUMN_STAGGER;
                if (before <= at && runT > at) {
                    for (const e of edges) if (e.f.ci === ci) e.packets.push({ k: 0 });
                    for (const n of nodes) if (n.ci === ci) n.lit = 1;
                }
            }
            if (runT > STAGES.length * COLUMN_STAGGER + PACKET_MS) runT = -1;
        }

        ctx.save();
        ctx.translate(-pan, 0);

        for (const e of edges) {
            const d = Math.hypot(e.f.x - pan - mouse.x, e.f.y - mouse.y);
            const near = d < 260 ? 1 - d / 260 : 0;
            ctx.strokeStyle = `rgba(${palette.edge}, ${0.16 + near * 0.4})`;
            ctx.lineWidth = 1;
            const cx = (e.f.x + e.t.x) / 2;
            ctx.beginPath();
            ctx.moveTo(e.f.x, e.f.y);
            // A gentle S-curve, so the graph reads as wired rather than as a
            // spider web of straight lines.
            ctx.bezierCurveTo(cx, e.f.y, cx, e.t.y, e.t.x, e.t.y);
            ctx.stroke();

            for (let i = e.packets.length - 1; i >= 0; i--) {
                const pk = e.packets[i];
                pk.k += dt / PACKET_MS;
                if (pk.k >= 1) { e.packets.splice(i, 1); e.t.lit = 1; continue; }
                const k = pk.k;
                const mt = 1 - k;
                // Along the same cubic the edge is drawn with.
                const px = mt ** 3 * e.f.x + 3 * mt ** 2 * k * cx + 3 * mt * k ** 2 * cx + k ** 3 * e.t.x;
                const py = mt ** 3 * e.f.y + 3 * mt ** 2 * k * e.f.y + 3 * mt * k ** 2 * e.t.y + k ** 3 * e.t.y;
                ctx.fillStyle = `rgba(${palette.kw}, ${0.9 * (1 - Math.abs(k - 0.5) * 0.6)})`;
                ctx.beginPath();
                ctx.arc(px, py, 2.6, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (const n of nodes) {
            n.lit *= 0.97;
            const d = Math.hypot(n.x - pan - mouse.x, n.y - mouse.y);
            const hover = d < 90 ? 1 - d / 90 : 0;
            const glow = Math.max(n.lit, hover);

            ctx.fillStyle = `rgba(${glow > 0.25 ? palette.kw : palette.fn}, ${0.35 + glow * 0.55})`;
            ctx.beginPath();
            ctx.arc(n.x, n.y, 4 + glow * 2.5, 0, Math.PI * 2);
            ctx.fill();

            if (glow > 0.05) {
                ctx.strokeStyle = `rgba(${palette.fn}, ${0.4 + glow * 0.6})`;
                ctx.lineWidth = 1.2 + glow;
                ctx.beginPath();
                ctx.arc(n.x, n.y, 10 + glow * 6, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    return { resize, frame, run, pulse };
}
