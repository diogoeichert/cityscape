const fs = require("fs");
const os = require("os");
const path = require("path");
const { app, BrowserWindow, Menu } = require("electron");

const RESOLUTION = {
	width: 640,
	height: 400,
};

function checkGames() {
	const directory = path.join(os.homedir(), ".maragato");
	fs.mkdirSync(directory, { recursive: true });
	fs.writeFileSync(path.resolve(directory, app.name.toLowerCase().split(" ").join("").split(".").join("-")), "");
	return fs.readdirSync(directory);
}

function createWindow(games) {
	const browserWindow = new BrowserWindow({
		width: RESOLUTION.width,
		height: RESOLUTION.height,
	});

	browserWindow.loadFile("index.html", {query: {games: JSON.stringify(games)}});
}

app.whenReady().then(() => {
	Menu.setApplicationMenu(null);
	createWindow(checkGames());

	app.on("activate", function () {
		if (!BrowserWindow.getAllWindows().length) {
			createWindow();
		}
	});
});

app.on("window-all-closed", function () {
	app.quit();
});
