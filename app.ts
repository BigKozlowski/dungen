const MAP_HEIGHT = 80;
const MAP_WIDTH = 160;

const MAX_LEAF_SIZE: number = 20;
const MIN_LEAF_SIZE: number = 6;

class Rectangle {
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

function coinFlip(chance?: number) {
  if (!chance) {
    if (Math.round(Math.random()) === 1) {
      return true;
    }
    return false;
  }
  return Math.random() < chance;
}

function randomIntervalInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

class Leaf {
  #MIN_LEAF_SIZE: number = MIN_LEAF_SIZE;

  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public layer: number;
  public roomNumber: number;

  public leftChild?: Leaf;
  public rightChild?: Leaf;
  public room?: Rectangle;
  public halls?: Rectangle[];

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    layer: number
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.layer = layer;
    this.roomNumber = randomIntervalInt(1, 9);
  }

  public split(): boolean {
    if (this.leftChild || this.rightChild) {
      return false;
    }

    const layer: number = this.layer + 1;

    let isSplitHorizontal = coinFlip();

    if (this.width / this.height >= 1.25) {
      isSplitHorizontal = false;
    } else if (this.height / this.width >= 1.25) {
      isSplitHorizontal = true;
    }

    const maxSplittedMeasure =
      (isSplitHorizontal ? this.height : this.width) - this.#MIN_LEAF_SIZE;

    if (maxSplittedMeasure <= this.#MIN_LEAF_SIZE) {
      return false;
    }

    const split = randomIntervalInt(this.#MIN_LEAF_SIZE, maxSplittedMeasure);

    if (isSplitHorizontal) {
      this.leftChild = new Leaf(this.x, this.y, this.width, split, layer);
      this.rightChild = new Leaf(
        this.x,
        this.y + split,
        this.width,
        this.height - split,
        layer
      );
    } else {
      this.leftChild = new Leaf(this.x, this.y, split, this.height, layer);
      this.rightChild = new Leaf(
        this.x + split,
        this.y,
        this.width - split,
        this.height,
        layer
      );
    }
    return true;
  }

  public createRooms() {
    if (this.leftChild || this.rightChild) {
      if (this.leftChild) {
        this.leftChild.createRooms();
      }
      if (this.rightChild) {
        this.rightChild.createRooms();
      }

      if (this.leftChild && this.rightChild) {
        this.createHall(this.leftChild.getRoom(), this.rightChild.getRoom());
      }
    } else {
      const roomWidth = randomIntervalInt(3, this.width - 2);
      const roomHeight = randomIntervalInt(3, this.height - 2);
      const roomX = randomIntervalInt(1, this.width - roomWidth - 1);
      const roomY = randomIntervalInt(1, this.height - roomHeight - 1);
      this.room = new Rectangle(
        this.x + roomX,
        this.y + roomY,
        roomWidth,
        roomHeight
      );
    }
  }

  public getRoom(): Rectangle {
    if (this.room) {
      return this.room;
    }

    let leftRoom: Rectangle;
    let rightRoom: Rectangle;
    if (this.leftChild) {
      leftRoom = this.leftChild.getRoom();
    }
    if (this.rightChild) {
      rightRoom = this.rightChild.getRoom();
    }

    if (coinFlip()) {
      return leftRoom!;
    }
    return rightRoom!;
  }

  public createHall(left: Rectangle, right: Rectangle): void {
    this.halls = [];

    const leftX = randomIntervalInt(left.x + 1, left.x + left.width - 2);
    const leftY = randomIntervalInt(left.y + 1, left.y + left.height - 2);
    const rightX = randomIntervalInt(right.x + 1, right.x + right.width - 2);
    const rightY = randomIntervalInt(right.y + 1, right.y + right.height - 2);

    const width = rightX - leftX;
    const height = rightY - leftY;

    if (width < 0) {
      if (height < 0) {
        if (coinFlip()) {
          this.halls.push(new Rectangle(rightX, leftY, Math.abs(width), 1));
          this.halls.push(new Rectangle(rightX, rightY, 1, Math.abs(height)));
        } else {
          this.halls.push(new Rectangle(rightX, rightY, Math.abs(width), 1));
          this.halls.push(new Rectangle(leftX, rightY, 1, Math.abs(height)));
        }
      } else if (height > 0) {
        if (coinFlip()) {
          this.halls.push(new Rectangle(rightX, leftY, Math.abs(width), 1));
          this.halls.push(new Rectangle(rightX, leftY, 1, Math.abs(height)));
        } else {
          this.halls.push(new Rectangle(rightX, rightY, Math.abs(width), 1));
          this.halls.push(new Rectangle(leftX, leftY, 1, Math.abs(height)));
        }
      } else {
        this.halls.push(new Rectangle(rightX, rightY, Math.abs(width), 1));
      }
    } else if (width > 0) {
      if (height < 0) {
        if (coinFlip()) {
          this.halls.push(new Rectangle(leftX, rightY, Math.abs(width), 1));
          this.halls.push(new Rectangle(leftX, rightY, 1, Math.abs(height)));
        } else {
          this.halls.push(new Rectangle(leftX, leftY, Math.abs(width) + 1, 1));
          this.halls.push(new Rectangle(rightX, rightY, 1, Math.abs(height)));
        }
      } else if (height > 0) {
        if (coinFlip()) {
          this.halls.push(new Rectangle(leftX, leftY, Math.abs(width), 1));
          this.halls.push(new Rectangle(rightX, leftY, 1, Math.abs(height)));
        } else {
          this.halls.push(new Rectangle(leftX, rightY, Math.abs(width), 1));
          this.halls.push(new Rectangle(leftX, leftY, 1, Math.abs(height)));
        }
      } else {
        this.halls.push(new Rectangle(leftX, leftY, Math.abs(width), 1));
      }
    } else {
      if (height < 0) {
        this.halls.push(new Rectangle(rightX, rightY, 1, Math.abs(height)));
      } else {
        this.halls.push(new Rectangle(leftX, leftY, 1, Math.abs(height)));
      }
    }
  }
}

let leafs: Leaf[] = [];

const root: Leaf = new Leaf(0, 0, MAP_WIDTH, MAP_HEIGHT, 0);
leafs.push(root);

let isSplittable: boolean = true;

while (isSplittable) {
  isSplittable = false;
  for (const l of leafs) {
    if (!l.leftChild && !l.rightChild) {
      if (
        l.width > MAX_LEAF_SIZE ||
        l.height > MAX_LEAF_SIZE ||
        coinFlip(0.5)
      ) {
        if (l.split()) {
          leafs.push(l.leftChild!);
          leafs.push(l.rightChild!);
          isSplittable = true;
        }
      }
    }
  }
}

root.createRooms();

////////////////////////////////
// Just console dungeon "rendering"
////////////////////////////////

const finalLeafs: Leaf[] = [];

for (const l of leafs) {
  if (!l.leftChild && !l.rightChild) {
    finalLeafs.push(l);
  }
}

const levelMap: any[][] = [];

for (let i = 0; i < MAP_HEIGHT; i++) {
  levelMap.push([]);
  for (let j = 1; j <= MAP_WIDTH; j++) {
    levelMap[i].push("#");
  }
}

for (const l of finalLeafs) {
  for (let i = l.x + 1; i < l.x + l.width - 1; i++) {
    for (let j = l.y + 1; j < l.y + l.height - 1; j++) {
      levelMap[j][i] = "#";
    }
  }
  if (l.room) {
    for (let i = l.room.x; i < l.room.x + l.room.width; i++) {
      for (let j = l.room.y; j < l.room.y + l.room.height; j++) {
        levelMap[j][i] = ".";
      }
    }
  }
}

for (const l of leafs) {
  if (l.halls) {
    for (const hall of l.halls) {
      for (let i = hall.x; i < hall.x + hall.width; i++) {
        for (let j = hall.y; j < hall.y + hall.height; j++) {
          levelMap[j][i] = ".";
        }
      }
    }
  }
}

levelMap.map((string) => console.log(string.join("")));
