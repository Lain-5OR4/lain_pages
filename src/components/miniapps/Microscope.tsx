"use client";

import { useEffect, useRef } from "react";

export default function Microscope() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stainIndexRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // biome-ignore lint/suspicious/noExplicitAny: p5 loaded dynamically via CDN
    let p5Instance: any = null;

    // biome-ignore lint/suspicious/noExplicitAny: p5 loaded dynamically via CDN
    function loadP5(): Promise<any> {
      const w = window as Window & { p5?: unknown };
      if (w.p5) return Promise.resolve(w.p5);
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.3/p5.min.js";
        script.onload = () => resolve((window as Window & { p5?: unknown }).p5);
        document.head.appendChild(script);
      });
    }

    loadP5().then((P5) => {
      // biome-ignore lint/suspicious/noExplicitAny: p5 instance mode
      const sketch = (p: any) => {
        // ============ State ============
        let organisms: Organism[] = [];
        const debris: DebrisObj[] = [];
        let zoom = 1;
        let targetZoom = 1;
        let offsetX = 0;
        let offsetY = 0;
        let isDragging = false;
        let lastMouseX = 0;
        let lastMouseY = 0;
        const brownianParticles: { x: number; y: number; size: number; alpha: number }[] = [];

        const stainModes = [
          { name: "Phase Contrast", bg: [10, 15, 10], tint: [150, 255, 150] },
          { name: "Gram Stain", bg: [20, 15, 25], tint: [200, 150, 255] },
          { name: "Methylene Blue", bg: [10, 15, 25], tint: [100, 180, 255] },
          { name: "Iodine", bg: [25, 20, 10], tint: [255, 200, 100] },
          { name: "Dark Field", bg: [0, 0, 0], tint: [255, 255, 255] },
        ];

        function getStain() {
          return stainModes[stainIndexRef.current];
        }

        // ============ Organism base ============
        interface Organism {
          x: number;
          y: number;
          update(): void;
          display(): void;
          canDivide?(): boolean;
          divide?(): Organism | null;
          energy?: number;
        }

        // ============ Amoeba ============
        class Amoeba implements Organism {
          x: number;
          y: number;
          baseSize: number;
          points: { angle: number; radius: number; phase: number; speed: number }[];
          numPoints = 12;
          phase: number;
          speed: number;
          direction: number;
          directionChangeTimer = 0;
          energy = 100;
          nucleusX = 0;
          nucleusY = 0;
          vacuoles: { angle: number; dist: number; size: number; phase: number }[];

          constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
            this.baseSize = p.random(60, 100);
            this.phase = p.random(p.TWO_PI);
            this.speed = p.random(0.3, 0.8);
            this.direction = p.random(p.TWO_PI);
            this.points = [];
            for (let i = 0; i < this.numPoints; i++) {
              this.points.push({
                angle: (p.TWO_PI / this.numPoints) * i,
                radius: this.baseSize * p.random(0.7, 1.3),
                phase: p.random(p.TWO_PI),
                speed: p.random(0.02, 0.05),
              });
            }
            this.vacuoles = [];
            for (let i = 0; i < p.floor(p.random(2, 5)); i++) {
              this.vacuoles.push({
                angle: p.random(p.TWO_PI),
                dist: p.random(0.2, 0.5),
                size: p.random(8, 15),
                phase: p.random(p.TWO_PI),
              });
            }
          }

          update() {
            this.phase += 0.02;
            this.directionChangeTimer++;
            if (this.directionChangeTimer > p.random(100, 300)) {
              this.direction += p.random(-p.PI / 2, p.PI / 2);
              this.directionChangeTimer = 0;
            }
            this.x += p.cos(this.direction) * this.speed;
            this.y += p.sin(this.direction) * this.speed;
            if (this.x < 0 || this.x > p.width) this.direction = p.PI - this.direction;
            if (this.y < 0 || this.y > p.height) this.direction = -this.direction;
            for (const pt of this.points) {
              pt.phase += pt.speed;
              pt.radius = this.baseSize * (0.8 + p.sin(pt.phase) * 0.3);
            }
            this.nucleusX = p.sin(this.phase * 0.5) * 10;
            this.nucleusY = p.cos(this.phase * 0.7) * 10;
            this.energy += 0.01;
          }

          display() {
            const stain = getStain();
            p.push();
            p.translate(this.x, this.y);

            p.noFill();
            p.stroke(stain.tint[0], stain.tint[1], stain.tint[2], 150);
            p.strokeWeight(2);
            p.beginShape();
            for (let i = 0; i <= this.numPoints; i++) {
              const pt = this.points[i % this.numPoints];
              p.curveVertex(p.cos(pt.angle) * pt.radius, p.sin(pt.angle) * pt.radius);
            }
            p.endShape(p.CLOSE);

            p.fill(stain.tint[0], stain.tint[1], stain.tint[2], 30);
            p.noStroke();
            p.beginShape();
            for (let i = 0; i <= this.numPoints; i++) {
              const pt = this.points[i % this.numPoints];
              p.curveVertex(p.cos(pt.angle) * pt.radius * 0.95, p.sin(pt.angle) * pt.radius * 0.95);
            }
            p.endShape(p.CLOSE);

            for (let i = 0; i < 30; i++) {
              const angle = p.noise(i, this.phase * 0.1) * p.TWO_PI * 2;
              const dist = p.noise(i + 100, this.phase * 0.1) * this.baseSize * 0.7;
              p.fill(stain.tint[0], stain.tint[1], stain.tint[2], 80);
              p.ellipse(p.cos(angle) * dist, p.sin(angle) * dist, p.noise(i + 200) * 4 + 1);
            }

            for (const v of this.vacuoles) {
              v.phase += 0.01;
              const vx = p.cos(v.angle + this.phase * 0.1) * this.baseSize * v.dist;
              const vy = p.sin(v.angle + this.phase * 0.1) * this.baseSize * v.dist;
              const vSize = v.size * (1 + p.sin(v.phase) * 0.2);
              p.noFill();
              p.stroke(stain.tint[0], stain.tint[1], stain.tint[2], 100);
              p.strokeWeight(1);
              p.ellipse(vx, vy, vSize);
            }

            p.fill(stain.tint[0], stain.tint[1], stain.tint[2], 60);
            p.noStroke();
            p.ellipse(this.nucleusX, this.nucleusY, this.baseSize * 0.35);
            p.fill(stain.tint[0], stain.tint[1], stain.tint[2], 120);
            p.ellipse(this.nucleusX + 5, this.nucleusY - 3, 8);

            p.pop();
          }

          canDivide() {
            return this.energy > 150 && p.random() < 0.001;
          }
          divide() {
            this.energy = 50;
            this.baseSize *= 0.8;
            return new Amoeba(this.x + p.random(-30, 30), this.y + p.random(-30, 30));
          }
        }

        // ============ Paramecium ============
        class Paramecium implements Organism {
          x: number;
          y: number;
          length: number;
          w: number;
          angle: number;
          speed: number;
          phase: number;
          turnRate = 0;
          ciliaPhase = 0;
          energy = 100;
          contractileVacuole = { size: 8, phase: 0, maxSize: 12 };

          constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
            this.length = p.random(80, 120);
            this.w = this.length * 0.35;
            this.angle = p.random(p.TWO_PI);
            this.speed = p.random(1.5, 3);
            this.phase = p.random(p.TWO_PI);
          }

          update() {
            this.phase += 0.03;
            this.ciliaPhase += 0.3;
            this.turnRate = p.sin(this.phase * 0.5) * 0.02;
            this.angle += this.turnRate;
            this.x += p.cos(this.angle) * this.speed;
            this.y += p.sin(this.angle) * this.speed;
            if (this.x < 0 || this.x > p.width) {
              this.angle = p.PI - this.angle;
              this.x = p.constrain(this.x, 0, p.width);
            }
            if (this.y < 0 || this.y > p.height) {
              this.angle = -this.angle;
              this.y = p.constrain(this.y, 0, p.height);
            }
            this.contractileVacuole.phase += 0.05;
            if (this.contractileVacuole.phase > p.TWO_PI) this.contractileVacuole.phase = 0;
            this.contractileVacuole.size =
              this.contractileVacuole.maxSize *
              (1 - (this.contractileVacuole.phase / p.TWO_PI) ** 2);
            this.energy += 0.01;
          }

          display() {
            const stain = getStain();
            p.push();
            p.translate(this.x, this.y);
            p.rotate(this.angle);

            // Cilia
            p.stroke(stain.tint[0], stain.tint[1], stain.tint[2], 60);
            p.strokeWeight(1);
            for (let i = 0; i < 40; i++) {
              const t = i / 40;
              const bx = (t - 0.5) * this.length;
              const by = p.sin(t * p.PI) * this.w * 0.5;
              const ciliaAngle = p.sin(this.ciliaPhase + i * 0.5) * 0.5;
              const ciliaLen = 12;
              p.line(
                bx,
                -by,
                bx + p.cos(-p.HALF_PI + ciliaAngle) * ciliaLen,
                -by + p.sin(-p.HALF_PI + ciliaAngle) * ciliaLen,
              );
              p.line(
                bx,
                by,
                bx + p.cos(p.HALF_PI - ciliaAngle) * ciliaLen,
                by + p.sin(p.HALF_PI - ciliaAngle) * ciliaLen,
              );
            }

            // Body
            p.fill(stain.tint[0], stain.tint[1], stain.tint[2], 25);
            p.stroke(stain.tint[0], stain.tint[1], stain.tint[2], 120);
            p.strokeWeight(2);
            p.beginShape();
            for (let i = 0; i <= 30; i++) {
              const t = i / 30;
              const bx = (t - 0.5) * this.length;
              let by = p.sin(t * p.PI) * this.w * 0.5;
              if (t > 0.3 && t < 0.5) by *= 0.7;
              p.vertex(bx, -by);
            }
            for (let i = 30; i >= 0; i--) {
              const t = i / 30;
              const bx = (t - 0.5) * this.length;
              const by = p.sin(t * p.PI) * this.w * 0.5;
              p.vertex(bx, by);
            }
            p.endShape(p.CLOSE);

            // Oral groove
            p.noFill();
            p.stroke(stain.tint[0], stain.tint[1], stain.tint[2], 80);
            p.strokeWeight(1);
            p.beginShape();
            for (let i = 0; i < 10; i++) {
              const t = 0.3 + i * 0.02;
              p.vertex((t - 0.5) * this.length, -this.w * 0.2 + i * 2);
            }
            p.endShape();

            // Macronucleus
            p.fill(stain.tint[0], stain.tint[1], stain.tint[2], 50);
            p.noStroke();
            p.ellipse(0, 0, this.length * 0.3, this.w * 0.5);
            // Micronucleus
            p.fill(stain.tint[0], stain.tint[1], stain.tint[2], 100);
            p.ellipse(this.length * 0.05, -this.w * 0.1, 8, 8);

            // Contractile vacuoles
            p.noFill();
            p.stroke(stain.tint[0], stain.tint[1], stain.tint[2], 100);
            p.strokeWeight(1);
            p.ellipse(-this.length * 0.25, 0, this.contractileVacuole.size);
            p.ellipse(this.length * 0.25, 0, this.contractileVacuole.size * 0.8);

            p.pop();
          }

          canDivide() {
            return this.energy > 150 && p.random() < 0.0005;
          }
          divide() {
            this.energy = 50;
            return new Paramecium(this.x + p.random(-20, 20), this.y + p.random(-20, 20));
          }
        }

        // ============ Euglena ============
        class Euglena implements Organism {
          x: number;
          y: number;
          length: number;
          angle: number;
          speed: number;
          phase: number;
          flagellaPhase = 0;

          constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
            this.length = p.random(40, 60);
            this.angle = p.random(p.TWO_PI);
            this.speed = p.random(1, 2);
            this.phase = p.random(p.TWO_PI);
          }

          update() {
            this.phase += 0.02;
            this.flagellaPhase += 0.4;
            const toCenter = p.atan2(p.height / 2 - this.y, p.width / 2 - this.x);
            const angleDiff = toCenter - this.angle;
            this.angle += angleDiff * 0.01 + p.sin(this.phase) * 0.03;
            this.x += p.cos(this.angle) * this.speed;
            this.y += p.sin(this.angle) * this.speed;
            if (this.x < 0) this.x = p.width;
            if (this.x > p.width) this.x = 0;
            if (this.y < 0) this.y = p.height;
            if (this.y > p.height) this.y = 0;
          }

          display() {
            const stain = getStain();
            p.push();
            p.translate(this.x, this.y);
            p.rotate(this.angle);

            // Flagellum
            p.noFill();
            p.stroke(stain.tint[0], stain.tint[1], stain.tint[2], 80);
            p.strokeWeight(1);
            p.beginShape();
            for (let i = 0; i < 15; i++) {
              const t = i / 15;
              p.vertex(
                this.length * 0.5 + t * this.length * 0.5,
                p.sin(this.flagellaPhase + t * 4) * 8 * t,
              );
            }
            p.endShape();

            // Body
            p.fill(stain.tint[0], stain.tint[1], stain.tint[2], 35);
            p.stroke(stain.tint[0], stain.tint[1], stain.tint[2], 100);
            p.strokeWeight(1.5);
            p.beginShape();
            for (let i = 0; i <= 20; i++) {
              const t = i / 20;
              const bx = (t - 0.5) * this.length;
              let bw = p.sin(t * p.PI) * this.length * 0.25;
              bw *= 1 + p.sin(this.phase * 3 + t * 2) * 0.1;
              p.vertex(bx, -bw);
            }
            for (let i = 20; i >= 0; i--) {
              const t = i / 20;
              const bx = (t - 0.5) * this.length;
              let bw = p.sin(t * p.PI) * this.length * 0.25;
              bw *= 1 + p.sin(this.phase * 3 + t * 2) * 0.1;
              p.vertex(bx, bw);
            }
            p.endShape(p.CLOSE);

            // Chloroplasts
            p.fill(100, 200, 100, 60);
            p.noStroke();
            for (let i = 0; i < 8; i++) {
              p.ellipse(
                p.random(-this.length * 0.3, this.length * 0.2),
                p.random(-this.length * 0.1, this.length * 0.1),
                p.random(6, 10),
                p.random(3, 5),
              );
            }

            // Eyespot
            p.fill(255, 100, 100, 150);
            p.ellipse(this.length * 0.3, -this.length * 0.05, 5, 5);

            // Nucleus
            p.fill(stain.tint[0], stain.tint[1], stain.tint[2], 60);
            p.ellipse(-this.length * 0.1, 0, this.length * 0.2, this.length * 0.15);

            p.pop();
          }
        }

        // ============ Bacteria ============
        class Bacteria implements Organism {
          x: number;
          y: number;
          type: number;
          size: number;
          angle: number;
          speed: number;
          phase: number;
          tumbleTimer = 0;
          energy = 100;

          constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
            this.type = p.floor(p.random(3));
            this.size = p.random(8, 15);
            this.angle = p.random(p.TWO_PI);
            this.speed = p.random(0.5, 1.5);
            this.phase = p.random(p.TWO_PI);
          }

          update() {
            this.phase += 0.1;
            this.tumbleTimer++;
            if (this.tumbleTimer > p.random(50, 150)) {
              this.angle = p.random(p.TWO_PI);
              this.tumbleTimer = 0;
            }
            this.x += p.cos(this.angle) * this.speed + p.random(-0.5, 0.5);
            this.y += p.sin(this.angle) * this.speed + p.random(-0.5, 0.5);
            if (this.x < 0) this.x = p.width;
            if (this.x > p.width) this.x = 0;
            if (this.y < 0) this.y = p.height;
            if (this.y > p.height) this.y = 0;
            this.energy += 0.02;
          }

          display() {
            const stain = getStain();
            p.push();
            p.translate(this.x, this.y);
            p.rotate(this.angle);
            p.fill(stain.tint[0], stain.tint[1], stain.tint[2], 80);
            p.stroke(stain.tint[0], stain.tint[1], stain.tint[2], 150);
            p.strokeWeight(1);

            if (this.type === 0) {
              p.ellipse(0, 0, this.size);
            } else if (this.type === 1) {
              p.arc(-this.size, 0, this.size, this.size, p.HALF_PI, -p.HALF_PI);
              p.arc(this.size, 0, this.size, this.size, -p.HALF_PI, p.HALF_PI);
              // Flagellum
              p.noFill();
              p.stroke(stain.tint[0], stain.tint[1], stain.tint[2], 60);
              p.beginShape();
              for (let i = 0; i < 10; i++) {
                const t = i / 10;
                p.vertex(-this.size * 1.5 - t * 15, p.sin(this.phase + t * 5) * 3);
              }
              p.endShape();
            } else {
              p.noFill();
              p.strokeWeight(this.size * 0.4);
              p.beginShape();
              for (let i = 0; i < 20; i++) {
                const t = i / 20;
                p.vertex(
                  (t - 0.5) * this.size * 4,
                  p.sin(t * p.TWO_PI * 2 + this.phase) * this.size * 0.5,
                );
              }
              p.endShape();
            }
            p.pop();
          }

          canDivide() {
            return this.energy > 120 && p.random() < 0.002;
          }
          divide() {
            this.energy = 50;
            return new Bacteria(this.x + p.random(-10, 10), this.y + p.random(-10, 10));
          }
        }

        // ============ Diatom ============
        class Diatom implements Organism {
          x: number;
          y: number;
          size: number;
          type: number;
          angle: number;
          rotationSpeed: number;
          driftX: number;
          driftY: number;
          phase: number;

          constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
            this.size = p.random(30, 50);
            this.type = p.floor(p.random(3));
            this.angle = p.random(p.TWO_PI);
            this.rotationSpeed = p.random(-0.005, 0.005);
            this.driftX = p.random(-0.2, 0.2);
            this.driftY = p.random(-0.2, 0.2);
            this.phase = p.random(p.TWO_PI);
          }

          update() {
            this.phase += 0.01;
            this.angle += this.rotationSpeed;
            this.x += this.driftX + p.random(-0.1, 0.1);
            this.y += this.driftY + p.random(-0.1, 0.1);
            if (this.x < -this.size) this.x = p.width + this.size;
            if (this.x > p.width + this.size) this.x = -this.size;
            if (this.y < -this.size) this.y = p.height + this.size;
            if (this.y > p.height + this.size) this.y = -this.size;
          }

          display() {
            const stain = getStain();
            p.push();
            p.translate(this.x, this.y);
            p.rotate(this.angle);
            p.stroke(stain.tint[0], stain.tint[1], stain.tint[2], 150);
            p.strokeWeight(1.5);
            p.fill(stain.tint[0], stain.tint[1], stain.tint[2], 20);

            if (this.type === 0) {
              p.ellipse(0, 0, this.size);
              for (let i = 0; i < 12; i++) {
                const a = (p.TWO_PI / 12) * i;
                p.line(0, 0, p.cos(a) * this.size * 0.45, p.sin(a) * this.size * 0.45);
              }
              p.fill(stain.tint[0], stain.tint[1], stain.tint[2], 80);
              p.ellipse(0, 0, 8);
            } else if (this.type === 1) {
              p.beginShape();
              p.vertex(-this.size * 0.6, 0);
              p.bezierVertex(
                -this.size * 0.4,
                -this.size * 0.25,
                this.size * 0.4,
                -this.size * 0.25,
                this.size * 0.6,
                0,
              );
              p.bezierVertex(
                this.size * 0.4,
                this.size * 0.25,
                -this.size * 0.4,
                this.size * 0.25,
                -this.size * 0.6,
                0,
              );
              p.endShape(p.CLOSE);
              p.line(0, -this.size * 0.2, 0, this.size * 0.2);
              for (let i = -4; i <= 4; i++) {
                if (i !== 0) {
                  const px = i * this.size * 0.1;
                  const py = this.size * 0.15 * (1 - p.abs(i) * 0.15);
                  p.line(px, -py, px, py);
                }
              }
            } else {
              const pts = 5;
              p.beginShape();
              for (let i = 0; i < pts * 2; i++) {
                const a = (p.TWO_PI / (pts * 2)) * i - p.HALF_PI;
                const r = i % 2 === 0 ? this.size * 0.5 : this.size * 0.25;
                p.vertex(p.cos(a) * r, p.sin(a) * r);
              }
              p.endShape(p.CLOSE);
              p.fill(stain.tint[0], stain.tint[1], stain.tint[2], 60);
              p.ellipse(0, 0, this.size * 0.3);
            }
            p.pop();
          }
        }

        // ============ Rotifer ============
        class Rotifer implements Organism {
          x: number;
          y: number;
          size: number;
          angle: number;
          speed: number;
          phase: number;
          coronaPhase = 0;
          bodySegments: { width: number; phase: number }[];

          constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
            this.size = p.random(50, 80);
            this.angle = p.random(p.TWO_PI);
            this.speed = p.random(0.3, 0.8);
            this.phase = p.random(p.TWO_PI);
            this.bodySegments = [];
            for (let i = 0; i < 5; i++) {
              this.bodySegments.push({
                width: p.map(i, 0, 4, 0.8, 0.3),
                phase: p.random(p.TWO_PI),
              });
            }
          }

          update() {
            this.phase += 0.02;
            this.coronaPhase += 0.3;
            this.angle += p.sin(this.phase) * 0.02;
            this.x += p.cos(this.angle) * this.speed;
            this.y += p.sin(this.angle) * this.speed;
            if (this.x < 0 || this.x > p.width) this.angle = p.PI - this.angle;
            if (this.y < 0 || this.y > p.height) this.angle = -this.angle;
            for (const seg of this.bodySegments) seg.phase += 0.03;
          }

          display() {
            const stain = getStain();
            p.push();
            p.translate(this.x, this.y);
            p.rotate(this.angle + p.HALF_PI);

            // Corona cilia
            p.stroke(stain.tint[0], stain.tint[1], stain.tint[2], 80);
            p.strokeWeight(1);
            for (let side = -1; side <= 1; side += 2) {
              for (let i = 0; i < 15; i++) {
                const baseAngle = p.map(i, 0, 15, -p.PI * 0.4, p.PI * 0.4) * side;
                const ciliaAngle = baseAngle + p.sin(this.coronaPhase + i * 0.3) * 0.3;
                const startX = p.cos(baseAngle + p.HALF_PI * side) * this.size * 0.2;
                const startY = -this.size * 0.4;
                p.line(
                  startX,
                  startY,
                  startX + p.cos(ciliaAngle - p.HALF_PI) * 15,
                  startY + p.sin(ciliaAngle - p.HALF_PI) * 15,
                );
              }
            }

            // Body segments
            p.fill(stain.tint[0], stain.tint[1], stain.tint[2], 30);
            p.stroke(stain.tint[0], stain.tint[1], stain.tint[2], 100);
            p.strokeWeight(1.5);
            p.beginShape();
            for (let i = 0; i < this.bodySegments.length; i++) {
              const seg = this.bodySegments[i];
              const y = p.map(
                i,
                0,
                this.bodySegments.length - 1,
                -this.size * 0.35,
                this.size * 0.4,
              );
              const w = seg.width * this.size * 0.25 * (1 + p.sin(seg.phase) * 0.1);
              p.vertex(-w, y);
            }
            p.vertex(-this.size * 0.05, this.size * 0.5);
            p.vertex(0, this.size * 0.55);
            p.vertex(this.size * 0.05, this.size * 0.5);
            for (let i = this.bodySegments.length - 1; i >= 0; i--) {
              const seg = this.bodySegments[i];
              const y = p.map(
                i,
                0,
                this.bodySegments.length - 1,
                -this.size * 0.35,
                this.size * 0.4,
              );
              const w = seg.width * this.size * 0.25 * (1 + p.sin(seg.phase) * 0.1);
              p.vertex(w, y);
            }
            p.endShape(p.CLOSE);

            // Head
            p.fill(stain.tint[0], stain.tint[1], stain.tint[2], 40);
            p.ellipse(0, -this.size * 0.35, this.size * 0.4, this.size * 0.25);

            // Mastax
            p.fill(stain.tint[0], stain.tint[1], stain.tint[2], 100);
            p.noStroke();
            const mastaxY = -this.size * 0.15;
            p.ellipse(0, mastaxY, 12, 10);
            p.stroke(stain.tint[0], stain.tint[1], stain.tint[2], 150);
            p.strokeWeight(1);
            const jawAngle = p.sin(this.coronaPhase * 2) * 0.3;
            p.line(-3, mastaxY, -3 - p.cos(jawAngle) * 4, mastaxY + p.sin(jawAngle) * 4);
            p.line(3, mastaxY, 3 + p.cos(jawAngle) * 4, mastaxY + p.sin(jawAngle) * 4);

            // Gut
            p.noFill();
            p.stroke(stain.tint[0], stain.tint[1], stain.tint[2], 50);
            p.beginShape();
            for (let i = 0; i < 10; i++) {
              const t = i / 10;
              p.vertex(
                p.sin(t * p.PI + this.phase) * 3,
                p.map(t, 0, 1, -this.size * 0.1, this.size * 0.35),
              );
            }
            p.endShape();

            p.pop();
          }
        }

        // ============ Debris ============
        interface DebrisObj {
          x: number;
          y: number;
          size: number;
          type: number;
          angle: number;
          rotSpeed: number;
          alpha: number;
          update(): void;
          display(): void;
        }

        function createDebris(): DebrisObj {
          return {
            x: p.random(p.width),
            y: p.random(p.height),
            size: p.random(2, 8),
            type: p.floor(p.random(3)),
            angle: p.random(p.TWO_PI),
            rotSpeed: p.random(-0.02, 0.02),
            alpha: p.random(30, 80),
            update() {
              this.x += p.random(-0.5, 0.5);
              this.y += p.random(-0.5, 0.5);
              this.angle += this.rotSpeed;
              if (this.x < -50) this.x = p.width + 50;
              if (this.x > p.width + 50) this.x = -50;
              if (this.y < -50) this.y = p.height + 50;
              if (this.y > p.height + 50) this.y = -50;
            },
            display() {
              const stain = getStain();
              p.push();
              p.translate(this.x, this.y);
              p.rotate(this.angle);
              p.noStroke();
              p.fill(stain.tint[0], stain.tint[1], stain.tint[2], this.alpha);
              if (this.type === 0) p.ellipse(0, 0, this.size);
              else if (this.type === 1)
                p.rect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
              else
                p.triangle(
                  0,
                  -this.size / 2,
                  -this.size / 2,
                  this.size / 2,
                  this.size / 2,
                  this.size / 2,
                );
              p.pop();
            },
          };
        }

        // ============ Helpers ============
        function addRandomOrganism() {
          const type = p.floor(p.random(6));
          const x = p.random(p.width * 0.2, p.width * 0.8);
          const y = p.random(p.height * 0.2, p.height * 0.8);
          switch (type) {
            case 0:
              organisms.push(new Amoeba(x, y));
              break;
            case 1:
              organisms.push(new Paramecium(x, y));
              break;
            case 2:
              organisms.push(new Euglena(x, y));
              break;
            case 3:
              organisms.push(new Bacteria(x, y));
              break;
            case 4:
              organisms.push(new Diatom(x, y));
              break;
            case 5:
              organisms.push(new Rotifer(x, y));
              break;
          }
        }

        function addOrganismAt(x: number, y: number) {
          const type = p.floor(p.random(6));
          switch (type) {
            case 0:
              organisms.push(new Amoeba(x, y));
              break;
            case 1:
              organisms.push(new Paramecium(x, y));
              break;
            case 2:
              organisms.push(new Euglena(x, y));
              break;
            case 3:
              organisms.push(new Bacteria(x, y));
              break;
            case 4:
              organisms.push(new Diatom(x, y));
              break;
            case 5:
              organisms.push(new Rotifer(x, y));
              break;
          }
        }

        // ============ p5 lifecycle ============
        p.setup = () => {
          p.createCanvas(window.innerWidth, window.innerHeight);
          for (let i = 0; i < 8; i++) addRandomOrganism();
          for (let i = 0; i < 100; i++) debris.push(createDebris());
          for (let i = 0; i < 200; i++) {
            brownianParticles.push({
              x: p.random(-p.width, p.width * 2),
              y: p.random(-p.height, p.height * 2),
              size: p.random(1, 3),
              alpha: p.random(20, 80),
            });
          }
        };

        p.draw = () => {
          const stain = getStain();
          p.background(stain.bg[0], stain.bg[1], stain.bg[2]);

          zoom = p.lerp(zoom, targetZoom, 0.1);

          p.push();
          p.translate(p.width / 2, p.height / 2);
          p.scale(zoom);
          p.translate(-p.width / 2 + offsetX, -p.height / 2 + offsetY);

          // Brownian particles
          p.noStroke();
          for (const bp of brownianParticles) {
            bp.x += p.random(-2, 2);
            bp.y += p.random(-2, 2);
            p.fill(stain.tint[0], stain.tint[1], stain.tint[2], bp.alpha * 0.3);
            p.ellipse(bp.x, bp.y, bp.size / zoom);
          }

          // Debris
          for (const d of debris) {
            d.update();
            d.display();
          }

          // Organisms
          for (let i = organisms.length - 1; i >= 0; i--) {
            organisms[i].update();
            organisms[i].display();
            if (organisms[i].canDivide?.() && organisms.length < 30) {
              const child = organisms[i].divide?.();
              if (child) organisms.push(child);
            }
          }

          p.pop();

          // Vignette
          drawVignette();

          // Lens artifacts
          p.noStroke();
          for (let i = 0; i < 3; i++) {
            p.fill(stain.tint[0], stain.tint[1], stain.tint[2], 5);
            p.ellipse(p.width * 0.3 + i * p.width * 0.2, p.height * 0.2, 100, 30);
          }

          // UI updates
          const countEl = document.getElementById("organism-count");
          const fpsEl = document.getElementById("fps-display");
          const magEl = document.getElementById("mag-display");
          if (countEl) countEl.textContent = `Organisms: ${organisms.length}`;
          if (fpsEl) fpsEl.textContent = `FPS: ${p.floor(p.frameRate())}`;
          if (magEl) magEl.textContent = `${p.floor(400 * zoom)}x`;
        };

        function drawVignette() {
          p.noFill();
          for (let i = 0; i < 50; i++) {
            const alpha = p.map(i, 0, 50, 0, 255);
            p.stroke(0, alpha);
            p.strokeWeight(20);
            const size = p.min(p.width, p.height) * 1.1 - i * 8;
            p.ellipse(p.width / 2, p.height / 2, size);
          }
          p.fill(0);
          p.noStroke();
          p.beginShape();
          p.vertex(0, 0);
          p.vertex(p.width, 0);
          p.vertex(p.width, p.height);
          p.vertex(0, p.height);
          p.beginContour();
          for (let a = p.TWO_PI; a >= 0; a -= 0.1) {
            const r = p.min(p.width, p.height) * 0.48;
            p.vertex(p.width / 2 + p.cos(a) * r, p.height / 2 + p.sin(a) * r);
          }
          p.endContour();
          p.endShape(p.CLOSE);
        }

        p.mousePressed = () => {
          if (p.mouseButton === p.LEFT) {
            const worldX = (p.mouseX - p.width / 2) / zoom + p.width / 2 - offsetX;
            const worldY = (p.mouseY - p.height / 2) / zoom + p.height / 2 - offsetY;
            addOrganismAt(worldX, worldY);
          }
          lastMouseX = p.mouseX;
          lastMouseY = p.mouseY;
          isDragging = true;
        };

        p.mouseReleased = () => {
          isDragging = false;
        };

        p.mouseDragged = () => {
          if (isDragging) {
            offsetX += (p.mouseX - lastMouseX) / zoom;
            offsetY += (p.mouseY - lastMouseY) / zoom;
            lastMouseX = p.mouseX;
            lastMouseY = p.mouseY;
          }
        };

        p.mouseWheel = (event: WheelEvent) => {
          targetZoom -= event.deltaY * 0.001;
          targetZoom = p.constrain(targetZoom, 0.5, 4);
          return false;
        };

        p.keyPressed = () => {
          if (p.key === " ") {
            organisms = [];
            for (let i = 0; i < 8; i++) addRandomOrganism();
            zoom = 1;
            targetZoom = 1;
            offsetX = 0;
            offsetY = 0;
          }
          if (p.key >= "1" && p.key <= "5") {
            stainIndexRef.current = Number.parseInt(p.key) - 1;
          }
        };

        p.windowResized = () => {
          p.resizeCanvas(window.innerWidth, window.innerHeight);
        };
      };

      p5Instance = new P5(sketch, container);
    });

    return () => {
      if (p5Instance) {
        p5Instance.remove();
      }
    };
  }, []);

  return <div ref={containerRef} className="absolute top-0 left-0 w-full h-full z-0" />;
}
