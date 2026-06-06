








const slides = document.querySelectorAll('.slide');
const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.prev');
const dots = document.querySelectorAll('.dot-indicator');

let currentIndex = 0;
const slideDuration = 5000; // 5 Segundos por slide
let slideTimer;

function showSlide(index) {
    // Remover estados activos
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    // Validar límites del index (bucle continuo)
    if (index >= slides.length) currentIndex = 0;
    else if (index < 0) currentIndex = slides.length - 1;
    else currentIndex = index;

    // Activar slide e indicador actual
    slides[currentIndex].classList.add('active');
    dots[currentIndex].classList.add('active');

    // Resetear el temporizador automático
    resetTimer();
}

function nextSlide() {
    showSlide(currentIndex + 1);
}

function prevSlide() {
    showSlide(currentIndex - 1);
}

// Eventos de botones
nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// Eventos al hacer click directamente en las barras de abajo
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        showSlide(index);
    });
});

// Funciones del temporizador
function startTimer() {
    slideTimer = setInterval(nextSlide, slideDuration);
}

function resetTimer() {
    clearInterval(slideTimer);
    startTimer();
}

// Inicializar el Slider al cargar la página
startTimer();



/* Finisher Header - unminified / ES6 version
   Converted from finisher-header.es5.min.js
*/

(function (window) {
    'use strict';

    // Utility: compute skew offset in px from degrees and width
    function skewOffset(deg, width) {
        const radians = 0.017453 * Math.abs(deg); // deg to radians
        const tangent = Math.tan(radians);
        return Math.ceil(width * tangent);
    }

    // Utility: parse #RGB or #RRGGBB to {r,g,b}
    function parseHexColor(hex) {
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            let chars = hex.substring(1).split('');
            if (chars.length === 3) {
                chars = [chars[0], chars[0], chars[1], chars[1], chars[2], chars[2]];
            }
            const intVal = parseInt(chars.join(''), 16);
            return {
                r: (intVal >> 16) & 255,
                g: (intVal >> 8) & 255,
                b: intVal & 255
            };
        }
        return { r: 0, g: 0, b: 0 };
    }

    class Particle {
        constructor(colorHex, positionType, options) {
            this.o = options;
            this.r = parseHexColor(colorHex);
            this.d = this.randomDirection();
            this.h = this.randomShape();
            this.s = Math.abs(this.randomFromRange(this.o.size));
            this.setInitialPosition(positionType);
            this.vx = this.randomFromRange(this.o.speed.x) * this.randomDirection();
            this.vy = this.randomFromRange(this.o.speed.y) * this.randomDirection();
        }

        setInitialPosition(type) {
            const pos = this.randomPositionSeed();
            if (type === 3) {
                this.x = pos.x + pos.halfWidth;
                this.y = pos.y;
            } else if (type === 2) {
                this.x = pos.x;
                this.y = pos.y + pos.halfHeight;
            } else if (type === 1) {
                this.x = pos.x + pos.halfWidth;
                this.y = pos.y + pos.halfHeight;
            } else {
                this.x = pos.x;
                this.y = pos.y;
            }
        }

        randomPositionSeed() {
            const halfW = this.o.c.w / 2;
            const halfH = this.o.c.h / 2;
            return {
                x: Math.random() * halfW,
                y: Math.random() * halfH,
                halfHeight: halfH,
                halfWidth: halfW
            };
        }

        randomFromRange(range) {
            if (range.min === range.max) return range.min;
            const diff = range.max - range.min;
            return Math.random() * diff + range.min;
        }

        randomDirection() {
            return Math.random() > 0.5 ? 1 : -1;
        }

        randomShape() {
            return this.o.shapes[Math.floor(Math.random() * this.o.shapes.length)];
        }

        rgba(colorObj, alpha) {
            return `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${alpha})`;
        }

        animate(ctx, width, height) {
            // pulse logic
            if (this.o.size.pulse) {
                this.s += this.o.size.pulse * this.d;
                if (this.s > this.o.size.max || this.s < this.o.size.min) {
                    this.d *= -1;
                }
                this.s = Math.abs(this.s);
            }

            // movement & bounce
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0) {
                this.vx *= -1;
                this.x += 1;
            } else if (this.x > width) {
                this.vx *= -1;
                this.x -= 1;
            }

            if (this.y < 0) {
                this.vy *= -1;
                this.y += 1;
            } else if (this.y > height) {
                this.vy *= -1;
                this.y -= 1;
            }

            ctx.beginPath();

            if (this.o.blending && this.o.blending !== 'none') {
                ctx.globalCompositeOperation = this.o.blending;
            } else {
                ctx.globalCompositeOperation = 'source-over';
            }

            const centerColor = this.rgba(this.r, this.o.opacity.center);
            const edgeColor = this.rgba(this.r, this.o.opacity.edge);

            // size modifier per shape
            let sizeForGradient = this.s;
            if (this.h === 'c') sizeForGradient = this.s / 2;
            else if (this.h === 't') sizeForGradient = 0.577 * this.s;
            else if (this.h === 's') sizeForGradient = 0.707 * this.s;

            const grad = ctx.createRadialGradient(this.x, this.y, 0.01, this.x, this.y, sizeForGradient);
            grad.addColorStop(0, centerColor);
            grad.addColorStop(1, edgeColor);
            ctx.fillStyle = grad;

            const half = Math.abs(this.s / 2);

            if (this.h === 'c') {
                ctx.arc(this.x, this.y, half, 0, Math.PI * 2, false);
            } else if (this.h === 's') {
                const left = this.x - half;
                const right = this.x + half;
                const top = this.y - half;
                const bottom = this.y + half;
                ctx.moveTo(left, bottom);
                ctx.lineTo(right, bottom);
                ctx.lineTo(right, top);
                ctx.lineTo(left, top);
            } else if (this.h === 't') {
                // small triangle vertical dimension
                const v = Particle.triangleOffset(30, half);
                const g = this.y + v;
                ctx.moveTo(this.x - half, g);
                ctx.lineTo(this.x + half, g);
                ctx.lineTo(this.x, this.y - 2 * v);
            }

            ctx.closePath();
            ctx.fill();
        }

        // Helper to compute triangle offset (kept same formula as original)
        static triangleOffset(angleDeg, radius) {
            // original code used a helper i(30,r) where i computes tan(.017453*abs(t)) * halfWidth then ceil
            // Here we emulate: Math.tan(.017453 * Math.abs(angleDeg)) * radius then ceil
            const radians = 0.017453 * Math.abs(angleDeg);
            return Math.ceil(radius * Math.tan(radians));
        }
    }

    class FinisherHeader {
        constructor(options) {
            this.c = document.createElement('canvas');
            this.x = this.c.getContext('2d');
            this.c.setAttribute('id', 'finisher-canvas');

            this.getElement(options.className).appendChild(this.c);

            // debounce resize
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(this.resize.bind(this), 150);
            }, false);

            this.init(options);
            window.requestAnimationFrame(this.animate.bind(this));
        }

        getElement(className) {
            const els = document.getElementsByClassName(className || 'finisher-header');
            if (!els.length) {
                throw new Error('No .finisher-header element found');
            }
            return els[0];
        }

        resize() {
            const el = this.getElement(this.o.className);
            this.o.c = { w: el.clientWidth, h: el.clientHeight };
            this.c.width = this.o.c.w;
            this.c.height = this.o.c.h;

            const offset = skewOffset(this.o.skew, this.o.c.w / 2);
            const transform = `skewY(${this.o.skew}deg) translateY(-${offset}px)`;

            this.c.setAttribute('style',
                'position:absolute;z-index:-1;top:0;left:0;right:0;bottom:0;-webkit-transform:' + transform +
                ';transform:' + transform +
                ';outline: 1px solid transparent;background-color:rgba(' + this.bc.r + ',' + this.bc.g + ',' + this.bc.b + ',1);'
            );
        }

        init(options) {
            this.o = options;
            this.bc = parseHexColor(this.o.colors.background);
            this.ps = [];
            this.resize();
            this.createParticles();
        }

        createParticles() {
            let colorIndex = 0;
            this.ps = [];
            // reduce particle count on narrow screens
            this.o.ac = window.innerWidth < 600 && this.o.count > 5 ? Math.round(this.o.count / 2) : this.o.count;

            for (let i = 0; i < this.o.ac; i++) {
                const posType = i % 4;
                const p = new Particle(this.o.colors.particles[colorIndex], posType, this.o);
                colorIndex++;
                if (colorIndex >= this.o.colors.particles.length) colorIndex = 0;
                this.ps[i] = p;
            }
        }

        animate() {
            window.requestAnimationFrame(this.animate.bind(this));
            this.x.clearRect(0, 0, this.o.c.w, this.o.c.h);
            for (let i = 0; i < this.o.ac; i++) {
                this.ps[i].animate(this.x, this.o.c.w, this.o.c.h);
            }
        }
    }

    window.FinisherHeader = FinisherHeader;

})(window);


new FinisherHeader({
      "count": 6,
      "size": {
        "min": 1100,
        "max": 1300,
        "pulse": 0
      },
      "speed": {
        "x": {
          "min": 0.1,
          "max": 0.3
        },
        "y": {
          "min": 0.1,
          "max": 0.3
        }
      },
      "colors": {
        "background": "#9138e5",
        "particles": [
          "#6bd6ff",
          "#ffcb57",
          "#ff333d"
        ]
      },
      "blending": "overlay",
      "opacity": {
        "center": 1,
        "edge": 0.1
      },
      "skew": 0,
      "shapes": [
        "c"
      ]
    });




