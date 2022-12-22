let can, con;
let timePrior = 0;
let stopSize;
let neurons = [];

const MIN_NUM_BRANCHES = 8;
const MAX_NUM_BRANCHES = 15;
const MIN_BRANCH_ANGLE = 0;
const MAX_BRANCH_ANGLE = Math.PI * 2;
const BRANCH_POS_X = 0.5;
const BRANCH_POS_Y = 0.5;
const MIN_SHRINK_FACTOR = 0.3;
const MAX_SHRINK_FACTOR = 0.4;
const BRANCH_COLOR = "black";
const MIN_PIXEL_SIZE = 5;
const PERCENT_INC = 0.001;
const MAX_NUM_NEURONS = 10;

window.onload = init;

function init() {
  can = document.getElementById("can");
  con = can.getContext("2d");

  window.onresize = resize;
  resize();
  createNeuron();
  requestAnimationFrame(animate);
}

function createNeuron() {
  const neuron = new Neuron(con);
  neuron.initialize();
  neurons.push(neuron);
  // console.log(neurons);
  if (neurons.length > MAX_NUM_NEURONS + 1) {
    // fade out neurons[0]
    neurons.shift();
  }
}

function animate(timeNow) {
  const timeDelta = timeNow - timePrior;

  drawAll();

  const currNeuron = neurons[neurons.length - 1];

  currNeuron.percent += PERCENT_INC * timeDelta;

  if (currNeuron.percent > 1) {
    if (currNeuron.branchFrontier > currNeuron.branches.length - 3) {
      createNeuron();
    } else {
      currNeuron.percent = 0;
      currNeuron.branchFrontier++;
    }
  }

  timePrior = timeNow;
  requestAnimationFrame(animate);
}

function drawAll() {
  con.clearRect(0, 0, can.width, can.height);
  con.lineWidth = 1;
  con.strokeStyle = BRANCH_COLOR;

  for (let i = 0; i < neurons.length; i++) {
    if (i < 1) {
      if (neurons.length > MAX_NUM_NEURONS) {
        const cNeuron = neurons[neurons.length - 1];
        const strokePercent =
          1 -
          (1 / cNeuron.branches.length) * (cNeuron.branchFrontier + 1) -
          (1 / cNeuron.branches.length) * cNeuron.percent;
        con.strokeStyle = "rgba(0,0,0," + strokePercent + ")";
        console.log(strokePercent);
        neurons[i].draw();
        con.strokeStyle = BRANCH_COLOR;
        continue;
      }
    }
    neurons[i].draw();
  }
}

function resize() {
  can.width = window.innerWidth;
  can.height = window.innerHeight;

  stopSize = MIN_PIXEL_SIZE / Math.max(can.width, can.height);
}

class Neuron {
  constructor(con) {
    this.con = con;
    this.branches = [];
    this.nextBranches = [];
    this.percent = 0;
    this.branchFrontier = 0;
  }

  addBranch(branch, frontier) {
    let numBranches = getRandomInt(MIN_NUM_BRANCHES, MAX_NUM_BRANCHES + 1);

    let posX = Math.cos(branch.angle) * branch.len + branch.pos.x;
    let posY = Math.sin(branch.angle) * branch.len + branch.pos.y;

    for (let i = 0; i < numBranches; i++) {
      let branchLength =
        branch.len * getRandom(MIN_SHRINK_FACTOR, MAX_SHRINK_FACTOR);
      if (branchLength < stopSize) continue;
      this.branches[frontier].push({
        isStem: branch.isStem ? true : false,
        pos: { x: posX, y: posY },
        angle: -getRandom(MIN_BRANCH_ANGLE, MAX_BRANCH_ANGLE),
        len: branchLength,
      });
    }
  }

  initialize() {
    this.branches = [this.makeTrunks()];
    let frontier = 0;
    while (this.branches[frontier].length) {
      this.branches.push([]);
      for (let branch of this.branches[frontier]) {
        this.addBranch(branch, frontier + 1);
      }
      frontier++;
    }
  }

  makeTrunks() {
    let posX = getRandom(0.1, 0.9);
    let posY = getRandom(0.1, 0.9);
    let angle = getRandom(0, Math.PI * 2);
    const trunk1 = {
      pos: { x: posX, y: posY },
      angle: angle,
      len: 0.05,
      isStem: true,
    };
    const trunk2 = {
      pos: { x: posX, y: posY },
      angle:
        angle - Math.PI + getRandom(0, 0.2) * (Math.random() > 0.5 ? -1 : 1),
      len: 0.03,
      isStem: false,
    };
    return [trunk1, trunk2];
  }

  draw() {
    this.con.beginPath();

    for (let i = 0; i < this.branchFrontier + 1; i++) {
      if (i === this.branchFrontier) {
        for (let branch of this.branches[i]) {
          this.con.moveTo(branch.pos.x * can.width, branch.pos.y * can.height); // can
          this.con.lineTo(
            branch.pos.x * can.width +
              this.percent * branch.len * Math.cos(branch.angle) * can.width,
            branch.pos.y * can.height +
              this.percent * branch.len * Math.sin(branch.angle) * can.height
          ); // can
        }
      } else {
        for (let branch of this.branches[i]) {
          this.con.moveTo(branch.pos.x * can.width, branch.pos.y * can.height); // can
          this.con.lineTo(
            branch.pos.x * can.width +
              branch.len * Math.cos(branch.angle) * can.width,
            branch.pos.y * can.height +
              branch.len * Math.sin(branch.angle) * can.height
          ); // can
        }
      }
    }
    this.con.closePath();
    this.con.stroke();
  }
}

function getRandom(min, max) {
  return min + Math.random() * (max - min);
}

function getRandomInt(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}
