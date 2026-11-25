// Illustrative annotation sample. Written by Sameer Mohsin. Not client data.
(function () {
  "use strict";

  var TOTAL = 18.0;
  var segments = [
    { start: 0.0, end: 3.5, idle: false, caption: "Picks up the white mug from the counter with the right hand." },
    { start: 3.5, end: 10.0, idle: false, caption: "Rinses the mug under the running tap while scrubbing the inside with a sponge held in the left hand." },
    { start: 10.0, end: 13.0, idle: false, caption: "Places the mug upside down on the drying rack with the right hand." },
    { start: 13.0, end: 18.0, idle: true, caption: "Stands at the sink with both hands at the sides. No task action visible." }
  ];

  function fmt(s) {
    var m = Math.floor(s / 60);
    var rest = (s - m * 60).toFixed(1);
    if (rest.length < 4) rest = "0" + rest;
    return "0" + m + ":" + rest;
  }

  var track = document.getElementById("track");
  var playhead = document.getElementById("playhead");
  var clock = document.getElementById("clock");
  var cap = document.getElementById("cap");
  var segName = document.getElementById("seg-name");
  var toggle = document.getElementById("toggle");
  var tbody = document.getElementById("segment-rows");
  var status = document.getElementById("tile-status");
  document.getElementById("tick-end").textContent = fmt(TOTAL);
  if (!track || !tbody) return;

  var buttons = [], rows = [], current = -1;

  segments.forEach(function (seg, i) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.style.flex = String(seg.end - seg.start) + " 1 0";
    btn.textContent = "S" + (i + 1);
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("aria-label", "Jump to segment " + (i + 1) + ", " + fmt(seg.start) + " to " + fmt(seg.end) + (seg.idle ? ", flagged idle" : ""));
    if (seg.idle) btn.setAttribute("data-idle", "true");
    btn.addEventListener("click", function () { t = seg.start; setPlaying(false); render(); });
    track.insertBefore(btn, playhead);
    buttons.push(btn);

    var tr = document.createElement("tr");
    ["S" + (i + 1), fmt(seg.start), fmt(seg.end)].forEach(function (txt, c) {
      var td = document.createElement("td");
      if (c > 0) td.className = "t";
      td.textContent = txt;
      tr.appendChild(td);
    });
    var tdCap = document.createElement("td");
    if (seg.idle) {
      var f = document.createElement("span");
      f.className = "flag";
      f.textContent = "Idle";
      tdCap.appendChild(f);
    }
    tdCap.appendChild(document.createTextNode(seg.caption));
    tr.appendChild(tdCap);
    tbody.appendChild(tr);
    rows.push(tr);
  });

  var t = 0, playing = false, last = 0, raf = 0;

  function indexAt(time) {
    for (var i = 0; i < segments.length; i++) if (time < segments[i].end) return i;
    return segments.length - 1;
  }

  function render() {
    var i = indexAt(t);
    clock.textContent = fmt(t);
    playhead.style.left = (t / TOTAL * 100) + "%";
    if (i !== current) {
      current = i;
      var seg = segments[i];
      buttons.forEach(function (b, k) { b.setAttribute("aria-pressed", k === i ? "true" : "false"); });
      rows.forEach(function (r, k) { r.classList.toggle("is-active", k === i); });
      segName.textContent = "S" + (i + 1) + " | " + fmt(seg.start) + " to " + fmt(seg.end);
      cap.textContent = "";
      if (seg.idle) {
        var f = document.createElement("span");
        f.className = "flag";
        f.textContent = "Idle";
        cap.appendChild(f);
      }
      cap.appendChild(document.createTextNode(seg.caption));
    }
  }

  function tick(now) {
    if (!playing) return;
    t += (now - last) / 1000;
    last = now;
    if (t >= TOTAL) { t = 0; current = -1; }
    render();
    raf = requestAnimationFrame(tick);
  }

  function setPlaying(on) {
    playing = on;
    toggle.textContent = on ? "Pause" : "Play";
    toggle.setAttribute("aria-label", on ? "Pause the sample" : "Play the sample");
    cancelAnimationFrame(raf);
    if (on) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }

  toggle.addEventListener("click", function () { setPlaying(!playing); });
  render();
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  setPlaying(!reduce);

  var ok = segments.every(function (seg, i) { return i === 0 ? seg.start === 0 : seg.start === segments[i - 1].end; }) &&
    segments[segments.length - 1].end === TOTAL;
  if (status) status.textContent = ok ? "Check passed: segments run back to back with no gaps or overlaps." : "Check failed: gap or overlap found.";

  // Copy email button
  var copyBtn = document.getElementById("copy-email");
  var copyStatus = document.getElementById("copy-status");
  if (copyBtn && navigator.clipboard) {
    copyBtn.hidden = false;
    copyBtn.addEventListener("click", function () {
      navigator.clipboard.writeText("raza.sameer0412@gmail.com").then(function () {
        copyStatus.textContent = "Email address copied.";
      }, function () {
        copyStatus.textContent = "Could not copy. Please select the address above.";
      });
    });
  }
})();
