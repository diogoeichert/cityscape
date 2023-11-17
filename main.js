const fs = require("fs");
const os = require("os");
const path = require("path");
const { app, BrowserWindow, Menu } = require("electron");

const WINDOW_SIZE = {
	width: 640,
	height: 400,
};

function checkApps() {
	const directory = path.join(os.homedir(), ".maragato");
	fs.mkdirSync(directory, { recursive: true });
	fs.writeFileSync(path.resolve(directory, app.name.toLowerCase().split(" ").join("").split(".").join("-")), "");
	return fs.readdirSync(directory);
}

function createWindow(apps) {
	const browserWindow = new BrowserWindow({
		width: WINDOW_SIZE.width,
		height: WINDOW_SIZE.height,
	});

	browserWindow.loadFile("index.html", {query: {apps: JSON.stringify(apps)}});
}

app.whenReady().then(() => {
	Menu.setApplicationMenu(null);
	createWindow(checkApps());

	app.on("activate", function () {
		if (!BrowserWindow.getAllWindows().length) {
			createWindow();
		}
	});
});

app.on("window-all-closed", function () {
	app.quit();
});
