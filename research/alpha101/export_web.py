"""Trim results.json into the compact file the website reads."""
import json, math
R = json.load(open("results.json"))
out = {"meta": R["meta"], "alphas": {}, "heatmaps": R["heatmaps"], "null": {}}
for aid, e in R["alphas"].items():
    sweeps = {}
    for name, s in e["sweeps"].items():
        pub = s["published"]; key = pub if name == "a" else math.floor(pub)
        pts = []
        for p in s["points"]:
            # window 1 is degenerate for correlation / ts_rank (constant or clamped to 2)
            if name != "a" and p["x"] == 1 and key >= 2:
                continue
            pts.append({"x": p["x"], "is": p["is"]["ic"], "oos": p["oos"]["ic"]})
        sweeps[name] = {"published": pub, "publishedX": key, "points": pts}
    out["alphas"][aid] = {
        "formula": e["formula"], "params": e["params"],
        "baseline": e["baseline"], "round": e["round"], "sweeps": sweeps,
    }
for aid, d in R["null"].items():
    out["null"][aid] = [x for x in d if None not in x]
json.dump(out, open("web-results.json", "w"), separators=(",", ":"))
