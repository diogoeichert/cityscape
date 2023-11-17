"use strict";

import { Animation } from "./node_modules/core2d/src/Animation.mjs";
import { Color } from "./node_modules/core2d/src/Color.mjs";
import { Command } from "./node_modules/core2d/src/Command.mjs";
import { Core2D } from "./node_modules/core2d/src/Core2D.mjs";
import { Frame } from "./node_modules/core2d/src/Frame.mjs";
import { Scene } from "./node_modules/core2d/src/Scene.mjs";
import { Sprite } from "./node_modules/core2d/src/Sprite.mjs";
import { Transition } from "./node_modules/core2d/src/Transition.mjs";
import { FontSprite } from "./node_modules/core2d/src/plugin/FontSprite.mjs";

const CARS = 6;
const CORN_TO_LIFE_UP = 8;
const MAX_LIVES = 9;

const SECRET = [
	Command.UP,
	Command.UP,
	Command.DOWN,
	Command.DOWN,
	Command.LEFT,
	Command.RIGHT,
	Command.LEFT,
	Command.RIGHT,
	Command.B,
	Command.A,
	Command.SELECT,
	Command.START
];

const SPEED = 1;
const STEP = 16;

const TITLE_MAP = [
	[],
	["  ", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01"],
	["  ", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00"],
	["  ", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02"],
	[],
	[],
	[],
	[],
	[],
	["  ", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05"],
	[],
	[],
	[],
	[],
	[],
	["  ", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05"]
];

let game;

class BootScene extends Scene {
	init() {
		this.alphaIncrease = 0.01;
		this.color = Color.RoyalBlue;
		this.controller = Core2D.getController();
		this.expiration = 300;
		this.next = new TitleScene();
		this.state = 0;

		this.logoWhite = new Sprite()
			.setImage(Core2D.image("logoWhite"))
			.setCenter(this.center);

		this.drape = new Sprite()
			.setColor(this.color)
			.setPosition(this.logoWhite)
			.setSpeedY(0.5)
			.setSize(this.logoWhite);

		this.overlay = new Sprite()
			.setAlpha(0)
			.setColor(Color.Snow)
			.setWidth(this.width)
			.setHeight(this.height);

		this.logoColor = new Sprite()
			.setAlpha(0)
			.setImage(Core2D.image("logoColor"))
			.setPosition(this.logoWhite);

		this.add(this.logoWhite);
		this.add(this.drape);
		this.add(this.overlay);
		this.add(this.logoColor);
	}

	update() {
		if (this.controller.keyPush(Command.START)) {
			this.expire();
		}

		switch (this.state) {
		case 0:
			if (this.drape.top > this.logoWhite.bottom) {
				Core2D.play("maragatoSound");
				this.drape.expire();
				++this.state;
			}

			break;

		case 1:
			if (this.overlay.alpha < 1) {
				this.overlay.alpha += this.alphaIncrease;
				this.logoColor.alpha += this.alphaIncrease;
			} else {
				this.expiration = this.tick + 200;
				++this.state;
			}

			break;
		}
	}
}

class TitleScene extends Scene {
	init() {
		this.color = Color.Black;
		this.controller = Core2D.getController();
		this.loops = 0;
		this.next = new BootScene();
		this.build(TITLE_MAP);
		const titleSprite = Core2D.sprite().setImage("title").setCenter(this.center);
		titleSprite.y -= 8;
		this.add(titleSprite);
		const signFontSprite = new FontSprite("maragato 2014").setCenter(this.center);
		signFontSprite.y += signFontSprite.height * 2;
		this.add(signFontSprite);
		this.instructionSprite = new FontSprite("press enter or push start").setBottom(this.bottom - 16).setCenterX(this.centerX);
		this.add(this.instructionSprite);

		const HEN = new Sprite()
			.setAnimation(new Animation([
				new Frame(Core2D.image("hen1", true), 6),
				new Frame(Core2D.image("hen0", true), 6),
				new Frame(Core2D.image("hen2", true), 6),
				new Frame(Core2D.image("hen0", true), 7)
			]))
			.setBoundary(this)
			.setRight(this.left)
			.setSpeedX(1);

		HEN.setTop(HEN.height * 2);

		HEN.offBoundary = () => {
			if (++this.loops > 2) {
				this.expire();
			}

			HEN.setRight(this.left);
		};

		this.add(HEN);
	}

	update() {
		if (this.controller.keyPush(Command.START)) {
			this.next = new MenuScene();
			this.expire();
		}

		this.instructionSprite.visible = (Math.floor(this.tick / 16) % 2 == 0);
	}
}

class MenuScene extends Scene {
	init() {
		this.boost = false;
		this.color = Color.Black;
		this.controller = Core2D.getController();
		this.transition = new Transition();
		this.build(TITLE_MAP);
		this.menuIndex = 0;
		this.continueFontSprite = new FontSprite("continue");
		this.continueFontSprite.setCenterX(this.centerX);
		this.continueFontSprite.setBottom(this.bottom - 24);
		this.add(this.continueFontSprite);
		this.startFontSprite = new FontSprite("start game");
		this.startFontSprite.setLeft(this.continueFontSprite.left);
		this.startFontSprite.setTop(this.continueFontSprite.bottom + 1);
		this.add(this.startFontSprite);
		this.hand = new Sprite();
		this.hand.setImage("hand");
		this.hand.setRight(this.continueFontSprite.left - 5);
		this.add(this.hand);
	}

	get next() {
		Core2D.clear();
		Core2D.playTheme("gameTheme");
		return new GameScene();
	}

	update() {
		if (this.controller.keyPush(Command.START)) {
			if (this.menuIndex == 0) {
				game = Core2D.load() || new Game();
			} else if (this.controller.didPerform(SECRET)) {
				const searchParams = new URLSearchParams(location.search);
				game = new Game(searchParams.has("games") && JSON.parse(searchParams.get("games")).includes("starship"));
			} else {
				game = new Game();
			}

			this.expire();
		}

		if (this.controller.keyPush(Command.DOWN)) {
			if (++this.menuIndex > 1) {
				this.menuIndex = 1;
			}
		} else if (this.controller.keyPush(Command.UP)) {
			if (--this.menuIndex < 0) {
				this.menuIndex = 0;
			}
		}

		if (this.menuIndex == 0) {
			this.hand.setTop(this.continueFontSprite.top);
		} else if (this.menuIndex == 1) {
			this.hand.setTop(this.startFontSprite.top);
		}
	}
}

class Game {
	constructor(boost) {
		this.corn = 0;
		this.level = 1;
		this.lives = 2;

		if (boost) {
			Core2D.play("lifeSound");
			this.lives *= 2;
		}
	}
}

class GameScene extends Scene {
	init() {
		this.color = Color.Black;
		this.transition = new Transition();

		const MAP = [
			["03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03", "03"],
			["01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01"],
			["00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00"],
			["00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00"],
			["00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00"],
			["00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00"],
			["00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00"],
			["00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00"],
			["00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00"],
			["00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00"],
			["02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02"],
			["05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05"],
			["01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01", "01"],
			["00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00"],
			["00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00"],
			["00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00"],
			["00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00"],
			["00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00"],
			["00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00"],
			["00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00"],
			["00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00", "00"],
			["02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02", "02"],
			["04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04", "04"],
			["05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05", "05"]
		];

		this.build(MAP);
		this.addManHoles();
		this.add(new Player());
		this.addCars();
		const livesFontSprite = new FontSprite("lives " + game.lives).setBottom(this.bottom);
		this.add(livesFontSprite);
		this.add(new FontSprite("level " + game.level).setBottom(this.bottom).setRight(this.right));

		for (let i = 0; i < game.corn; ++i) {
			const corn = new Sprite().setImage("cornIcon").setBottom(this.bottom);
			this.add(corn.setLeft(livesFontSprite.right + (corn.width * (i + 1))));
		}
	}

	addCars() {
		for (let i = 0; i < Math.min(1 + Math.floor(game.level / 2), 10); ++i) {
			this.add(new Car());
		}
	}

	addManHoles() {
		for (let i = 0; i < Math.min(Math.floor(game.level / 5), 10); ++i) {
			this.add(new ManHole());
		}
	}

	get next() {
		if (game.lives < 0) {
			Core2D.save();
			return new OverScene();
		} else if (game.level > 50) {
			Core2D.save();
			return new EndingScene();
		}

		return new GameScene();
	}

	update() {
		if (this.tick == 100) {
			this.add(new Snake());
		} else if (this.tick == 150) {
			this.add(new Corn());
		}
	}
}

class OverScene extends Scene {
	init() {
		this.transition = new Transition();
		Core2D.fadeOut();
		this.controller = Core2D.getController();
		this.add(new FontSprite("game over\n\nlevel - " + game.level).setCenter(this.center));
	}

	get next() {
		return new BootScene();
	}

	update() {
		if (this.controller.keyPush(Command.START)) {
			this.expire();
		}
	}
}

class EndingScene extends Scene {
	init() {
		this.setExpiration(400);
		this.transition = new Transition();

		const MAP = [
			["05", "05", "05", "05", "05", "04", "02", "00", "00", "01", "05", "02", "00", "00", "01", "03"],
			["05", "05", "05", "05", "05", "04", "02", "00", "00", "01", "05", "02", "00", "00", "01", "03"],
			["05", "05", "05", "05", "05", "04", "02", "00", "00", "01", "05", "02", "00", "00", "01", "03"],
			["05", "05", "05", "05", "05", "04", "02", "00", "00", "01", "05", "02", "00", "00", "01", "03"],
			["05", "05", "05", "05", "05", "04", "02", "00", "00", "01", "05", "02", "00", "00", "01", "03"],
			["05", "05", "05", "05", "05", "04", "02", "00", "00", "01", "05", "02", "00", "00", "01", "03"],
			["05", "05", "05", "05", "05", "04", "02", "00", "00", "01", "05", "02", "00", "00", "01", "03"],
			["05", "05", "05", "05", "05", "04", "02", "00", "00", "01", "05", "02", "00", "00", "01", "03"],
			["05", "05", "05", "05", "05", "04", "02", "00", "00", "01", "05", "02", "00", "00", "01", "03"],
			["05", "05", "05", "05", "05", "04", "02", "00", "00", "01", "05", "02", "00", "00", "01", "03"],
			["05", "05", "05", "05", "05", "04", "02", "00", "00", "01", "05", "02", "00", "00", "01", "03"],
			["05", "05", "05", "05", "05", "04", "02", "00", "00", "01", "05", "02", "00", "00", "01", "03"]
		];

		this.build(MAP, function (id) {
			return new EndingTile(id);
		});

		for (let i = 0; i < MAP.length; ++i) {
			const CORN = new Sprite().setImage("corn");
			CORN.setImage("corn");
			CORN.setTop(i * CORN.height);
			this.add(CORN);
		}

		const CORN = new Sprite();
		CORN.setImage("corn");
		CORN.setLeft(CORN.width);
		this.add(CORN);
		const SNAKE = new Sprite();
		SNAKE.setImage("snake0");
		SNAKE.setRight(this.right - (SNAKE.width * 5));
		SNAKE.setTop(SNAKE.height);

		this.add(SNAKE);
		const HEN = new Sprite();

		HEN.setAnimation(new Animation([
			new Frame(Core2D.image("hen1", true), 6),
			new Frame(Core2D.image("hen0", true), 6),
			new Frame(Core2D.image("hen2", true), 6),
			new Frame(Core2D.image("hen0", true), 7)
		]));

		HEN.setLeft(HEN.width);
		HEN.setBottom(this.bottom - (HEN.height * 2));
		HEN.setSpeedX(0.5);
		HEN.setSolid();

		HEN.onCollision = (car) => {
			Core2D.play("carSound");
			HEN.expire();
			car.setAccelerationX(0.01);
			car.setMaxSpeedX(0.5);
			car.setAccelerationY(-0.05);
			car.setMaxSpeedY(2);
		};

		this.add(HEN);
		const ID = Core2D.random(Math.min(game.level, CARS) - 1);
		const CAR = new Sprite();
		CAR.setImage(Core2D.rotate(document.getElementById("car" + ID), 270));
		CAR.setRight(this.right - (CAR.width * 9));
		CAR.setTop(this.bottom - 48);
		CAR.setSolid();

		CAR.update = () => {
			if (CAR.top < SNAKE.bottom) {
				SNAKE.setImage("snake1");
			}
		};

		this.add(CAR);
	}

	get next() {
		Core2D.fadeOut();
		return new BootScene();
	}
}

class EndingTile extends Sprite {
	constructor(code) {
		super();
		this.setImage(Core2D.rotate(document.getElementById(code), 90));
	}
}

class Player extends Sprite {
	init() {
		this.setImage(Core2D.image("hen0"));
		this.addTag("player");
		this.controller = Core2D.getController();
		this.isRight = true;
		this.layerIndex = 1;
		this.setCenterX(this.scene.centerX);
		this.setSolid();
		this.hitBox = new Sprite(0, 0, 8, 8);
		this.walking = 0;

		this.animationLeft = new Animation([
			new Frame(Core2D.image("hen1"), 4),
			new Frame(Core2D.image("hen0"), 4),
			new Frame(Core2D.image("hen2"), 4),
			new Frame(Core2D.image("hen0"), 4)
		]);

		this.animationRight = new Animation([
			new Frame(Core2D.image("hen1", true), 4),
			new Frame(Core2D.image("hen0", true), 4),
			new Frame(Core2D.image("hen2", true), 4),
			new Frame(Core2D.image("hen0", true), 4)
		]);
	}

	respond() {
		if (!this.solid) {
			return;
		}

		if (this.controller.keyDown(Command.UP) && this.top > 0) {
			this.walking = -STEP;

			if (this.isRight) {
				this.setAnimation(this.animationRight);
			} else {
				this.setAnimation(this.animationLeft);
			}
		} else if (this.controller.keyDown(Command.DOWN) && this.bottom < this.scene.bottom) {
			this.walking = STEP;

			if (this.isRight) {
				this.setAnimation(this.animationRight);
			} else {
				this.setAnimation(this.animationLeft);
			}
		} else if (this.controller.keyDown(Command.LEFT) && this.left > 0) {
			this.x -= SPEED;
			this.isRight = false;
			this.setAnimation(this.animationLeft);
		} else if (this.controller.keyDown(Command.RIGHT) && this.right < this.scene.right) {
			this.x += SPEED;
			this.isRight = true;
			this.setAnimation(this.animationRight);
		} else {
			if (this.isRight) {
				this.setImage(Core2D.image("hen0", true));
			} else {
				this.setImage(Core2D.image("hen0"));
			}
		}
	}

	update() {
		if (this.walking != 0) {
			if (this.walking < 0) {
				if (this.controller.keyPush(Command.DOWN)) {
					this.walking = STEP + this.walking;
				} else {
					this.y -= SPEED;
					this.walking += SPEED;
				}
			} else {
				if (this.controller.keyPush(Command.UP)) {
					this.walking = this.walking - STEP;
				} else {
					this.y += SPEED;
					this.walking -= SPEED;
				}
			}
		} else {
			this.respond();
		}

		if (this.bottom > this.scene.bottom - this.height - 1) {
			this.solid = false;
			this.speedY = SPEED / 2;
		}

		if (this.top > this.scene.bottom) {
			++game.level;
			this.scene.expire();
			Core2D.save(game);
		}
	}

	updateHitBox() {
		this.hitBox.setX(this.x + 4);
		this.hitBox.setY(this.y + 8);
	}

	onCollision(sprite) {
		if (sprite.hasTag("enemy")) {
			this.updateHitBox();

			if (this.hitBox.hasCollision(sprite)) {
				if (sprite.hasTag("manHole")) {
					sprite.setImage("manHole1");
				} else if (sprite.hasTag("snake")) {
					sprite.chomp();
				}

				this.die();
			}
		}
	}

	die() {
		Core2D.play("deathSound");
		--game.lives;
		Core2D.save(game);
		this.expire();
		this.scene.add(new Feather().setAccelerationX(0.1).setLeft(this.left).setTop(this.top));
		this.scene.add(new Feather().setAccelerationX(-0.1).setRight(this.right).setTop(this.top));
		this.scene.add(new Feather().setAccelerationX(0.1).setRight(this.right).setTop(this.top));
		this.scene.add(new Feather().setAccelerationX(-0.1).setLeft(this.left).setTop(this.top));
	}
}

class Corn extends Sprite {
	init() {
		this.setImage("corn");
		this.setBottom(this.scene.bottom - this.height);
		this.setLeft(this.width + Core2D.random(this.scene.width - (3 * this.width)));
		this.setSolid();
	}

	onCollision(sprite) {
		if (sprite.hasTag("player")) {
			if (++game.corn > CORN_TO_LIFE_UP) {
				Core2D.play("lifeSound");
				game.corn = 0;

				if (++game.lives > MAX_LIVES) {
					game.lives = MAX_LIVES;
				}
			} else {
				Core2D.play("goalSound");
			}

			this.expire();
		}
	}
}

class Feather extends Sprite {
	init() {
		this.setEssential();
		this.setImage(Core2D.image("feather0"));
		this.setSpeedY(0.2);
	}

	update() {
		if (this.tick > 100) {
			this.expire();
		}

		if (this.tick > 50) {
			this.accelerationX = 0;
			this.stop();
		} else if (Math.abs(this.speedX) > 1) {
			this.setAccelerationX(- this.accelerationX);
		} else if (Math.abs(this.speedX) < 0.5) {
			this.setImage(Core2D.image("feather0"));
		} else if (this.speedX < 0) {
			this.setImage(Core2D.image("feather1"));
		} else if (this.speedX > 0) {
			this.setImage(Core2D.image("feather1", true));
		}
	}
}

class Beam extends Sprite {
	init() {
		this.setBoundary(this.scene).setSolid();
	}

	onCollision(sprite) {
		if (sprite.hasTag("car")) {
			this.car.setSpeedX(this.car.speedX *= 0.5);
			this.expire();
		}
	}
}

class Car extends Sprite {
	init() {
		this.addTag("car");
		this.addTag("enemy");
		this.setSolid();
		this.beam = new Beam();
		this.setBoundary(this.scene);
		const ID = Core2D.random(Math.min(game.level, CARS) - 1);

		if (Core2D.random(1)) {
			this.setImage(Core2D.image("car" + ID));
			this.setRight(0);
			this.setTop(this.height * (12 + Core2D.random(9)));
			this.setSpeedX(this.randomSpeed());

			this.beam
				.setWidth(this.width)
				.setHeight(this.height)
				.setLeft(this.right + 1);
		} else {
			this.setImage(Core2D.image("car" + ID, true));
			this.setLeft(this.scene.right);
			this.setTop(this.height * (1 + Core2D.random(9)));
			this.setSpeedX(this.randomSpeed() * -1);

			this.beam
				.setWidth(this.width)
				.setHeight(this.height)
				.setRight(this.left - 1);
		}

		this.beam
			.setTop(this.top)
			.setSpeedX(this.speedX);

		this.beam.car = this;
		this.scene.add(this.beam);
	}

	offBoundary() {
		Core2D.play("carSound");
		this.expire();
		this.scene.add(new Car());
	}

	onCollision(sprite) {
		if (sprite.hasTag("car")) {
			if (this.tick <= sprite.tick) {
				if (this.speedX > 0) {
					this.setRight(sprite.left - 2);

					if (this.speedX > sprite.speedX) {
						this.setSpeedX(sprite.speedX);
					}
				} else {
					this.setLeft(sprite.right + 2);

					if (this.speedX < sprite.speedX) {
						this.setSpeedX(sprite.speedX);
					}
				}
			}
		}
	}

	randomSpeed() {
		return Math.min(game.level, 1 + (Core2D.random(20) / 10));
	}
}

class ManHole extends Sprite {
	init() {
		this.addTag("enemy");
		this.addTag("manHole");
		this.setImage("manHole0");
		this.setSolid();
		this.setTop(this.height * (1 + Core2D.random(20)));
		this.setLeft(Core2D.random(this.scene.width - this.width));
	}

	onCollision(sprite) {
		if (sprite.hasTag("manHole")) {
			this.expire();
			this.scene.add(new ManHole());
		}
	}
}

class Snake extends Sprite {
	init() {
		this.addTag("enemy");
		this.addTag("snake");
		this.layerIndex = 1;
		this.setBoundary(this.scene);
		this.setSolid();

		this.animationLeft = Animation.fromImages([
			Core2D.image("snake0"),
			Core2D.image("snake1")
		], 6);

		this.animationRight = Animation.fromImages([
			Core2D.image("snake0", true),
			Core2D.image("snake1", true)
		], 6);

		this.animationEatLeft = new Animation([
			new Frame(Core2D.image("snake2"), 8),
			new Frame(Core2D.image("snake3"), 0)
		]);

		this.animationEatRight = new Animation([
			new Frame(Core2D.image("snake2", true), 8),
			new Frame(Core2D.image("snake3", true), 0)
		]);

		if (Core2D.random(1)) {
			this.setAnimation(this.animationRight);
			this.setRight(0);
			this.setSpeedX((Core2D.random(2) + 8) / 10);
		} else {
			this.setAnimation(this.animationLeft);
			this.setLeft(this.scene.right);
			this.setSpeedX(- (Core2D.random(2) + 8) / 10);
		}

		if (Core2D.random(2) == 1) {
			this.setTop(this.height * 11);
		} else {
			this.setTop(this.height * 22);
		}
	}

	chomp() {
		if (this.speedX < 0) {
			this.setAnimation(this.animationEatLeft);
		} else {
			this.setAnimation(this.animationEatRight);
		}

		this.stop();
	}

	offBoundary() {
		this.expire();
		this.scene.add(new Snake());
	}
}

Core2D.setName("Cityscape");
Core2D.setFrameTime(20);
Core2D.init(new BootScene());
