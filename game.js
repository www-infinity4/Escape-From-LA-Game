/**
 * Escape from L.A. – Snake Plissken's Escape
 * A top-down action game inspired by the cancelled 1996 John Carpenter film adaptation.
 *
 * Year 2013. Los Angeles has been declared a federal prison island. Snake Plissken
 * is sent in to retrieve the SWORD OF DAMOCLES – a device capable of shutting down
 * all electronics on Earth. Fight through hostile gangs, recover the weapon, and
 * reach the extraction point. Failure is not an option.
 */

(function () {
  'use strict';

  // ── Canvas setup ────────────────────────────────────────────────────────────
  const canvas = document.getElementById('gameCanvas');
  const ctx    = canvas.getContext('2d');

  const TILE   = 32;
  const COLS   = 25;
  const ROWS   = 17;
  const MAP_PX_W = COLS * TILE;   // 800
  const MAP_PX_H = ROWS * TILE;   // 544
  const CANVAS_W = MAP_PX_W;      // 800
  const CANVAS_H = 600;
  const HUD_Y    = MAP_PX_H;      // 544  (HUD starts here)
  const HUD_H    = CANVAS_H - HUD_Y; // 56

  // ── Game parameters ─────────────────────────────────────────────────────────
  const PLAYER_SPEED    = 2.5;
  const PLAYER_MAX_HP   = 100;
  const PLAYER_SHOOT_CD = 18;     // frames between shots
  const PLAYER_RADIUS   = 10;
  const START_AMMO      = 12;
  const MAX_AMMO        = 30;

  const BULLET_SPEED    = 7;
  const BULLET_TTL      = 65;     // frames before expiry
  const BULLET_RADIUS   = 4;
  const P_BULLET_DMG    = 34;     // damage per player bullet
  const E_BULLET_DMG    = 10;     // damage per enemy bullet

  const ENEMY_SPEED     = 1.1;
  const ENEMY_MAX_HP    = 30;
  const ENEMY_RADIUS    = 11;
  const ENEMY_SHOOT_CD  = 75;
  const ENEMY_CHASE_R   = 192;    // pixels – aggro range
  const ENEMY_SHOOT_R   = 140;    // pixels – shoot range

  const HEALTH_RESTORE  = 30;
  const AMMO_RESTORE    = 8;
  const ITEM_RADIUS     = 10;

  // Escape extraction point (top-right open area)
  const ESCAPE_ROW      = 1;
  const ESCAPE_COL      = 23;

  // ── Colours ─────────────────────────────────────────────────────────────────
  const C = {
    floor:    '#111122',
    floorAlt: '#0e0e1c',
    wall:     '#3b1838',
    wallTop:  '#7a306e',
    player:   '#c8c8c8',
    eye:      '#ff5522',
    enemy:    '#993333',
    enemyCh:  '#cc3333',   // chase state
    eEye:     '#ffcc00',
    bullet:   '#ffff44',
    eBullet:  '#ff6600',
    health:   '#00dd55',
    ammo:     '#3388ff',
    obj:      '#ffd700',
    escape:   '#00ff88',
    hud:      '#08080f',
    hudBrd:   '#c8a000',
    text:     '#c8a000',
    barHpBg:  '#330000',
    barHp:    '#cc2222',
    barAmBg:  '#001133',
    barAm:    '#3388ff',
  };

  // ── Map (0 = floor, 1 = wall) ────────────────────────────────────────────────
  //   Columns: 0                       24
  const MAP = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // row 0
    [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1], // row 1
    [1,0,1,1,0,0,1,0,1,1,0,0,0,0,1,1,0,0,1,0,1,1,0,0,1], // row 2
    [1,0,1,0,0,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,1], // row 3
    [1,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0,1,0,1,0,0,0,1,0,1], // row 4
    [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1], // row 5
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 6
    [1,1,1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1,1,1,1,1], // row 7
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 8
    [1,0,1,1,1,0,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,0,1], // row 9
    [1,0,0,0,1,0,1,0,1,0,1,0,0,0,0,1,0,0,1,0,1,0,0,0,1], // row 10
    [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,1], // row 11
    [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,0,1,1,1,0,1,0,1,0,1], // row 12
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 13
    [1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,0,1], // row 14
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // row 15
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // row 16
  ];

  // ── Items (all positions verified as floor tiles) ────────────────────────────
  const ITEM_DEFS = [
    // Ammo packs
    { row:1,  col:1,  type:'ammo'   },
    { row:1,  col:15, type:'ammo'   },
    { row:3,  col:10, type:'ammo'   },
    { row:5,  col:9,  type:'ammo'   },
    { row:6,  col:12, type:'ammo'   },
    { row:8,  col:11, type:'ammo'   },
    { row:10, col:22, type:'ammo'   },
    { row:13, col:2,  type:'ammo'   },
    { row:15, col:3,  type:'ammo'   },
    { row:15, col:21, type:'ammo'   },
    // Health packs
    { row:1,  col:9,  type:'health' },
    { row:1,  col:22, type:'health' },
    { row:3,  col:3,  type:'health' },
    { row:3,  col:17, type:'health' },
    { row:6,  col:5,  type:'health' },
    { row:6,  col:19, type:'health' },
    { row:8,  col:3,  type:'health' },
    { row:8,  col:21, type:'health' },
    { row:10, col:3,  type:'health' },
    { row:10, col:14, type:'health' },
    { row:13, col:7,  type:'health' },
    { row:13, col:17, type:'health' },
    { row:15, col:11, type:'health' },
    // Objective: Sword of Damocles (centre of map)
    { row:8,  col:12, type:'objective' },
  ];

  // ── Enemy spawn positions (all verified as floor tiles) ──────────────────────
  // Note: no enemy placed in the player's starting corridor (row 1, cols 1-5)
  const ENEMY_DEFS = [
    { row:2,  col:11 },  // moved from row 1 col 4 – gives player breathing room
    { row:1,  col:20 },
    { row:3,  col:7  },
    { row:3,  col:22 },
    { row:5,  col:5  },
    { row:5,  col:21 },
    { row:6,  col:10 },
    { row:8,  col:7  },
    { row:8,  col:19 },
    { row:10, col:1  },
    { row:11, col:19 },
    { row:13, col:12 },
    { row:13, col:22 },
    { row:15, col:7  },
    { row:15, col:17 },
  ];

  // ── Utilities ────────────────────────────────────────────────────────────────
  function tileCenter(row, col) {
    return { x: col * TILE + TILE / 2, y: row * TILE + TILE / 2 };
  }

  function dist2(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  function dist(a, b) { return Math.sqrt(dist2(a, b)); }

  function angleTo(from, to) {
    return Math.atan2(to.y - from.y, to.x - from.x);
  }

  function isWallAt(px, py) {
    const col = Math.floor(px / TILE);
    const row = Math.floor(py / TILE);
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return true;
    return MAP[row][col] === 1;
  }

  function wallCollides(x, y, r) {
    return isWallAt(x - r, y - r) || isWallAt(x + r, y - r) ||
           isWallAt(x - r, y + r) || isWallAt(x + r, y + r);
  }

  function slide(ent, dx, dy, r) {
    const nx = ent.x + dx;
    const ny = ent.y + dy;
    if (!wallCollides(nx, ent.y, r)) ent.x = nx;
    if (!wallCollides(ent.x, ny, r)) ent.y = ny;
  }

  // ── Input ────────────────────────────────────────────────────────────────────
  // Single keydown listener: tracks held keys AND handles state transitions.
  const keys  = {};
  const mouse = { x: CANVAS_W / 2, y: CANVAS_H / 2, down: false };

  document.addEventListener('keydown', e => {
    keys[e.code] = true;
    if (e.code === 'Enter') {
      if (gameState === 'menu' || gameState === 'dead' || gameState === 'win') {
        initGame();
        gameState = 'playing';
      }
    }
  });
  document.addEventListener('keyup',   e => { keys[e.code] = false; });
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * (CANVAS_W / r.width);
    mouse.y = (e.clientY - r.top)  * (CANVAS_H / r.height);
  });
  canvas.addEventListener('mousedown', () => { mouse.down = true; });
  canvas.addEventListener('mouseup',   () => { mouse.down = false; });

  // ── Classes ──────────────────────────────────────────────────────────────────
  class Player {
    constructor() {
      const p = tileCenter(1, 3);
      this.x = p.x;
      this.y = p.y;
      this.hp       = PLAYER_MAX_HP;
      this.ammo     = START_AMMO;
      this.score    = 0;
      this.shootCD  = 0;
      this.angle    = 0;
      this.hasObj   = false;
      this.spawnCD  = 120; // 2 s of spawn invincibility
    }
    get alive() { return this.hp > 0; }
    get invincible() { return this.spawnCD > 0; }
  }

  class Enemy {
    constructor(row, col) {
      const p = tileCenter(row, col);
      this.x       = p.x;
      this.y       = p.y;
      this.hp      = ENEMY_MAX_HP;
      this.alive   = true;
      this.state   = 'patrol';
      this.shootCD = Math.floor(Math.random() * ENEMY_SHOOT_CD);
      this.pAngle  = Math.random() * Math.PI * 2;
      this.pTimer  = 0;
    }
  }

  class Bullet {
    constructor(x, y, angle, fromPlayer) {
      this.x          = x;
      this.y          = y;
      this.vx         = Math.cos(angle) * BULLET_SPEED;
      this.vy         = Math.sin(angle) * BULLET_SPEED;
      this.fromPlayer = fromPlayer;
      this.ttl        = BULLET_TTL;
      this.alive      = true;
    }
  }

  class Item {
    constructor(row, col, type) {
      const p    = tileCenter(row, col);
      this.x     = p.x;
      this.y     = p.y;
      this.type  = type;
      this.alive = true;
      this.phase = Math.random() * Math.PI * 2;
    }
  }

  // ── Game state ───────────────────────────────────────────────────────────────
  let gameState;   // 'menu' | 'playing' | 'dead' | 'win'
  let player, enemies, bullets, items;
  let kills, frame;
  let msgText, msgTimer;
  let escapeMode;

  function initGame() {
    player     = new Player();
    enemies    = ENEMY_DEFS.map(d => new Enemy(d.row, d.col));
    bullets    = [];
    items      = ITEM_DEFS.map(d => new Item(d.row, d.col, d.type));
    kills      = 0;
    frame      = 0;
    msgText    = '';
    msgTimer   = 0;
    escapeMode = false;
  }

  function flash(text, dur) {
    msgText  = text;
    msgTimer = dur || 150;
  }

  // ── Update ───────────────────────────────────────────────────────────────────
  function update() {
    if (gameState !== 'playing') return;
    frame++;
    if (msgTimer > 0) msgTimer--;
    tickPlayer();
    tickEnemies();
    tickBullets();
    tickItems();
  }

  function tickPlayer() {
    if (player.spawnCD > 0) player.spawnCD--;

    let dx = 0, dy = 0;
    if (keys['ArrowLeft']  || keys['KeyA']) dx -= PLAYER_SPEED;
    if (keys['ArrowRight'] || keys['KeyD']) dx += PLAYER_SPEED;
    if (keys['ArrowUp']    || keys['KeyW']) dy -= PLAYER_SPEED;
    if (keys['ArrowDown']  || keys['KeyS']) dy += PLAYER_SPEED;
    // Normalise diagonal movement to avoid faster-than-PLAYER_SPEED travel (√2/2 ≈ 0.7071)
    if (dx && dy) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }

    slide(player, dx, dy, PLAYER_RADIUS);

    player.angle = angleTo(player, mouse);

    if (player.shootCD > 0) player.shootCD--;
    if ((keys['Space'] || mouse.down) && player.shootCD === 0 && player.ammo > 0) {
      bullets.push(new Bullet(player.x, player.y, player.angle, true));
      player.ammo--;
      player.shootCD = PLAYER_SHOOT_CD;
    }
  }

  function tickEnemies() {
    for (const e of enemies) {
      if (!e.alive) continue;

      const d = dist(e, player);

      // State machine
      if (d < ENEMY_CHASE_R) {
        e.state = 'chase';
      } else if (e.state === 'chase' && d > ENEMY_CHASE_R * 1.6) {
        e.state = 'patrol';
      }

      if (e.state === 'patrol') {
        e.pTimer--;
        if (e.pTimer <= 0) {
          e.pAngle = Math.random() * Math.PI * 2;
          e.pTimer = 60 + Math.floor(Math.random() * 120);
        }
        const ox = e.x, oy = e.y;
        slide(e, Math.cos(e.pAngle) * ENEMY_SPEED * 0.5,
                 Math.sin(e.pAngle) * ENEMY_SPEED * 0.5, ENEMY_RADIUS);
        if (e.x === ox && e.y === oy) { e.pAngle = Math.random() * Math.PI * 2; e.pTimer = 20; }
      } else {
        // Chase
        if (d > ENEMY_RADIUS + PLAYER_RADIUS + 2) {
          const a = angleTo(e, player);
          slide(e, Math.cos(a) * ENEMY_SPEED, Math.sin(a) * ENEMY_SPEED, ENEMY_RADIUS);
        }
        // Shoot
        if (e.shootCD > 0) e.shootCD--;
        if (d < ENEMY_SHOOT_R && e.shootCD === 0) {
          bullets.push(new Bullet(e.x, e.y, angleTo(e, player), false));
          e.shootCD = ENEMY_SHOOT_CD;
        }
      }
    }
  }

  function tickBullets() {
    for (const b of bullets) {
      b.x += b.vx;
      b.y += b.vy;
      b.ttl--;
      if (b.ttl <= 0 || isWallAt(b.x, b.y)) { b.alive = false; continue; }

      if (b.fromPlayer) {
        for (const e of enemies) {
          if (!e.alive) continue;
          if (dist2(b, e) < (ENEMY_RADIUS + BULLET_RADIUS) ** 2) {
            e.hp -= P_BULLET_DMG;
            b.alive = false;
            if (e.hp <= 0) { e.alive = false; kills++; player.score += 100; }
            break;
          }
        }
      } else {
        if (!player.invincible && dist2(b, player) < (PLAYER_RADIUS + BULLET_RADIUS) ** 2) {
          player.hp = Math.max(0, player.hp - E_BULLET_DMG);
          b.alive = false;
          if (!player.alive) gameState = 'dead';
        }
      }
    }
    bullets = bullets.filter(b => b.alive);
  }

  function tickItems() {
    for (const it of items) {
      if (!it.alive) continue;
      it.phase += 0.05;
      if (dist2(it, player) < (ITEM_RADIUS + PLAYER_RADIUS) ** 2) {
        it.alive = false;
        if (it.type === 'health') {
          player.hp = Math.min(PLAYER_MAX_HP, player.hp + HEALTH_RESTORE);
          player.score += 10;
          flash('+ HEALTH PACK', 90);
        } else if (it.type === 'ammo') {
          player.ammo = Math.min(MAX_AMMO, player.ammo + AMMO_RESTORE);
          player.score += 10;
          flash('+ AMMO', 90);
        } else if (it.type === 'objective') {
          player.hasObj = true;
          player.score += 500;
          escapeMode = true;
          flash('SWORD OF DAMOCLES SECURED! REACH THE EXTRACTION POINT!', 300);
        }
      }
    }

    // Check escape condition
    if (escapeMode) {
      const ep = tileCenter(ESCAPE_ROW, ESCAPE_COL);
      if (dist2(player, ep) < (PLAYER_RADIUS + 18) ** 2) {
        player.score += 1000;
        gameState = 'win';
      }
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  function render() {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    if (gameState === 'menu') {
      drawMenu();
    } else {
      drawTiles();
      drawItems();
      drawEntities();
      drawBullets();
      drawFlash();
      drawHUD();
      if (gameState === 'dead') drawOverlay('GAME OVER',     '"I thought you were dead, Plissken." - You failed.', '#cc2222');
      if (gameState === 'win')  drawOverlay('MISSION COMPLETE', '"Call me Snake." - You made it out alive.', '#ffd700');
    }
  }

  // ── Menu screen ──────────────────────────────────────────────────────────────
  function drawMenu() {
    ctx.fillStyle = '#06060f';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Scanlines
    for (let y = 0; y < CANVAS_H; y += 4) {
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(0, y, CANVAS_W, 2);
    }

    ctx.textAlign = 'center';

    // Title
    ctx.font = 'bold 54px "Courier New"';
    ctx.fillStyle = C.text;
    ctx.fillText('ESCAPE FROM L.A.', CANVAS_W / 2, 148);

    ctx.font = 'bold 20px "Courier New"';
    ctx.fillStyle = '#ffffff';
    ctx.fillText("SNAKE PLISSKEN'S ESCAPE", CANVAS_W / 2, 185);

    ctx.fillStyle = C.text;
    ctx.fillRect(80, 202, 640, 2);

    // Story
    ctx.font = '13px "Courier New"';
    ctx.fillStyle = '#999';
    [
      'Year 2013. The city of Los Angeles has been declared a maximum security',
      'prison island following a catastrophic earthquake. Snake Plissken has been',
      'sent in to retrieve the SWORD OF DAMOCLES – a superweapon capable of',
      'shutting down every electronic system on Earth.',
      '',
      'Fight through hostile gang territory, recover the weapon, then reach',
      'the extraction point. You have one shot at this. Don\'t blow it.',
    ].forEach((line, i) => ctx.fillText(line, CANVAS_W / 2, 230 + i * 22));

    ctx.fillStyle = C.text;
    ctx.fillRect(80, 400, 640, 1);

    ctx.font = '13px "Courier New"';
    ctx.fillStyle = '#fff';
    ctx.fillText('CONTROLS', CANVAS_W / 2, 424);
    ctx.fillStyle = '#888';
    ctx.fillText('WASD / Arrow Keys : Move player', CANVAS_W / 2, 448);
    ctx.fillText('Mouse Aim + Left Click / Spacebar : Shoot', CANVAS_W / 2, 468);
    ctx.fillText('Collect the glowing  ★  to secure the Sword of Damocles', CANVAS_W / 2, 488);
    ctx.fillText('Reach the  ⊕  extraction marker to escape', CANVAS_W / 2, 508);

    // Blink prompt
    if (Math.floor(Date.now() / 550) % 2 === 0) {
      ctx.font = 'bold 17px "Courier New"';
      ctx.fillStyle = C.text;
      ctx.fillText('[ PRESS  ENTER  TO  BEGIN ]', CANVAS_W / 2, 558);
    }
  }

  // ── Tile rendering ───────────────────────────────────────────────────────────
  function drawTiles() {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = col * TILE, y = row * TILE;
        if (MAP[row][col] === 1) {
          ctx.fillStyle = C.wall;
          ctx.fillRect(x, y, TILE, TILE);
          // Top highlight gives a 3-D ledge feel
          ctx.fillStyle = C.wallTop;
          ctx.fillRect(x, y, TILE, 5);
          ctx.fillRect(x, y, 3, TILE);
        } else {
          ctx.fillStyle = (row + col) % 2 === 0 ? C.floor : C.floorAlt;
          ctx.fillRect(x, y, TILE, TILE);
        }
      }
    }

    // Extraction point marker (visible after objective retrieved, or always dim)
    const ep = tileCenter(ESCAPE_ROW, ESCAPE_COL);
    const gAlpha = escapeMode ? 0.85 + Math.sin(frame * 0.12) * 0.15 : 0.2;
    ctx.globalAlpha = gAlpha;
    ctx.fillStyle   = C.escape;
    ctx.beginPath();
    ctx.arc(ep.x, ep.y, 14 + (escapeMode ? Math.sin(frame * 0.1) * 4 : 0), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = escapeMode ? '#000' : '#333';
    ctx.font      = 'bold 13px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText('⊕', ep.x, ep.y + 5);
  }

  // ── Item rendering ───────────────────────────────────────────────────────────
  function drawItems() {
    for (const it of items) {
      if (!it.alive) continue;
      const r = ITEM_RADIUS + Math.sin(it.phase) * 2.5;

      if (it.type === 'health') {
        ctx.fillStyle = C.health;
        ctx.beginPath();
        ctx.arc(it.x, it.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('+', it.x, it.y + 5);

      } else if (it.type === 'ammo') {
        ctx.fillStyle = C.ammo;
        ctx.beginPath();
        ctx.arc(it.x, it.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('A', it.x, it.y + 4);

      } else if (it.type === 'objective') {
        // Glow rings
        for (let gr = r + 14; gr >= r; gr -= 3) {
          ctx.globalAlpha = ((r + 14 - gr) / 14) * 0.18;
          ctx.fillStyle = C.obj;
          ctx.beginPath();
          ctx.arc(it.x, it.y, gr, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = C.obj;
        ctx.beginPath();
        ctx.arc(it.x, it.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillText('★', it.x, it.y + 5);
      }
    }
  }

  // ── Entity rendering ─────────────────────────────────────────────────────────
  function drawEntities() {
    // Enemies
    for (const e of enemies) {
      if (!e.alive) continue;

      ctx.fillStyle = e.state === 'chase' ? C.enemyCh : C.enemy;
      ctx.beginPath();
      ctx.arc(e.x, e.y, ENEMY_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Eye dot (points toward player)
      const a  = angleTo(e, player);
      ctx.fillStyle = C.eEye;
      ctx.beginPath();
      ctx.arc(e.x + Math.cos(a) * 6, e.y + Math.sin(a) * 6, 3, 0, Math.PI * 2);
      ctx.fill();

      // HP bar (only when damaged)
      if (e.hp < ENEMY_MAX_HP) {
        const bw = 22, bh = 3;
        ctx.fillStyle = '#330000';
        ctx.fillRect(e.x - bw / 2, e.y - ENEMY_RADIUS - 6, bw, bh);
        ctx.fillStyle = '#ee2222';
        ctx.fillRect(e.x - bw / 2, e.y - ENEMY_RADIUS - 6, bw * (e.hp / ENEMY_MAX_HP), bh);
      }
    }

    // Player (blink during spawn invincibility)
    const showPlayer = !player.invincible || Math.floor(frame / 5) % 2 === 0;
    if (showPlayer) {
      ctx.fillStyle = C.player;
      ctx.beginPath();
      ctx.arc(player.x, player.y, PLAYER_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      // Eye / aim indicator
      ctx.fillStyle = C.eye;
      ctx.beginPath();
      ctx.arc(
        player.x + Math.cos(player.angle) * 7,
        player.y + Math.sin(player.angle) * 7,
        3.5, 0, Math.PI * 2
      );
      ctx.fill();
    }
  }

  // ── Bullet rendering ─────────────────────────────────────────────────────────
  function drawBullets() {
    for (const b of bullets) {
      ctx.fillStyle = b.fromPlayer ? C.bullet : C.eBullet;
      ctx.beginPath();
      ctx.arc(b.x, b.y, BULLET_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Flash message ─────────────────────────────────────────────────────────────
  function drawFlash() {
    if (msgTimer <= 0) return;
    ctx.globalAlpha = Math.min(1, msgTimer / 25);
    ctx.font = 'bold 15px "Courier New"';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(msgText, CANVAS_W / 2, MAP_PX_H - 14);
    ctx.globalAlpha = 1;
  }

  // ── HUD ───────────────────────────────────────────────────────────────────────
  function drawHUD() {
    const y0 = HUD_Y;

    ctx.fillStyle = C.hud;
    ctx.fillRect(0, y0, CANVAS_W, HUD_H);
    ctx.fillStyle = C.hudBrd;
    ctx.fillRect(0, y0, CANVAS_W, 2);

    ctx.textAlign = 'left';
    ctx.font = '11px "Courier New"';

    // ─ HP bar ─
    ctx.fillStyle = C.text;
    ctx.fillText('HP', 12, y0 + 17);
    ctx.fillStyle = C.barHpBg;
    ctx.fillRect(38, y0 + 7, 160, 13);
    ctx.fillStyle = C.barHp;
    ctx.fillRect(38, y0 + 7, 160 * (player.hp / PLAYER_MAX_HP), 13);
    ctx.fillStyle = '#fff';
    ctx.font = '10px "Courier New"';
    ctx.fillText(`${player.hp}`, 204, y0 + 17);

    // ─ Ammo bar ─
    ctx.font = '11px "Courier New"';
    ctx.fillStyle = C.text;
    ctx.fillText('AMMO', 240, y0 + 17);
    ctx.fillStyle = C.barAmBg;
    ctx.fillRect(290, y0 + 7, 90, 13);
    ctx.fillStyle = C.barAm;
    ctx.fillRect(290, y0 + 7, 90 * (player.ammo / MAX_AMMO), 13);
    ctx.fillStyle = '#fff';
    ctx.font = '10px "Courier New"';
    ctx.fillText(`${player.ammo}`, 386, y0 + 17);

    // ─ Score ─
    ctx.textAlign = 'center';
    ctx.font = '11px "Courier New"';
    ctx.fillStyle = C.text;
    ctx.fillText('SCORE', CANVAS_W / 2, y0 + 17);
    ctx.font = 'bold 15px "Courier New"';
    ctx.fillStyle = '#fff';
    ctx.fillText(String(player.score).padStart(7, '0'), CANVAS_W / 2, y0 + 36);

    // ─ Kills ─
    ctx.textAlign = 'right';
    ctx.font = '11px "Courier New"';
    ctx.fillStyle = C.text;
    ctx.fillText(`KILLS: ${kills}`, CANVAS_W - 10, y0 + 17);

    // ─ Objective / escape indicator ─
    ctx.font = '10px "Courier New"';
    if (escapeMode) {
      ctx.fillStyle = C.escape;
      ctx.fillText('⊕  REACH EXTRACTION POINT  ⊕', CANVAS_W - 10, y0 + 36);
    } else {
      const objAlive = items.some(i => i.type === 'objective' && i.alive);
      if (objAlive) {
        ctx.fillStyle = C.obj;
        ctx.fillText('★  FIND THE SWORD OF DAMOCLES  ★', CANVAS_W - 10, y0 + 36);
      }
    }

    // ─ Hint row ─
    ctx.textAlign = 'left';
    ctx.font = '9px "Courier New"';
    ctx.fillStyle = '#444';
    ctx.fillText('WASD:MOVE  MOUSE AIM+CLICK/SPACE:SHOOT', 12, y0 + 50);
    ctx.textAlign = 'right';
    ctx.fillText("ESCAPE FROM L.A. – SNAKE PLISSKEN'S ESCAPE", CANVAS_W - 8, y0 + 50);
  }

  // ── End-state overlay ────────────────────────────────────────────────────────
  function drawOverlay(title, subtitle, colour) {
    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.textAlign = 'center';
    ctx.font = 'bold 58px "Courier New"';
    ctx.fillStyle = colour;
    ctx.fillText(title, CANVAS_W / 2, CANVAS_H / 2 - 40);

    ctx.font = '18px "Courier New"';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(subtitle, CANVAS_W / 2, CANVAS_H / 2 + 14);

    ctx.font = '14px "Courier New"';
    ctx.fillStyle = '#888';
    ctx.fillText(`Score: ${player.score}   Kills: ${kills}`, CANVAS_W / 2, CANVAS_H / 2 + 44);

    if (Math.floor(Date.now() / 600) % 2 === 0) {
      ctx.font = '14px "Courier New"';
      ctx.fillStyle = C.text;
      ctx.fillText('Press ENTER to play again', CANVAS_W / 2, CANVAS_H / 2 + 76);
    }
  }

  // ── Game loop ─────────────────────────────────────────────────────────────────
  function loop() {
    update();
    render();
    requestAnimationFrame(loop);
  }

  // ── Boot ──────────────────────────────────────────────────────────────────────
  gameState = 'menu';
  loop();

})();
