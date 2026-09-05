const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");

const GAMES_DIR = path.join(__dirname, "..", "uploads", "games");

async function downloadImage(imageUrl, imagePath) {
	let url = imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl;
	url=url.replace("/t_thumb/","/t_original/")
	const res = await axios.get(url, { responseType: "arraybuffer" });
	await fs.writeFile(imagePath, res.data);
}

exports.downloadGameImages = async (game) => {
	const gameDir = path.join(GAMES_DIR, String(game.id));
	const screenshotsDir = path.join(gameDir, "screenshots");

	await fs.mkdir(screenshotsDir, { recursive: true });
	let cover = null;
	if (game.cover?.url) {
		const coverPath = path.join(gameDir, "cover.jpg");
		await downloadImage(game.cover.url, coverPath);
		cover = `/uploads/games/${game.id}/cover.jpg`;
	}
	const screenshots = [];
	if (game.screenshots) {
		for (let i = 0; i < game.screenshots.length; i++) {
			const screenshot = game.screenshots[i];

			if (!screenshot.url) continue;

			const screenshotPath = path.join(screenshotsDir, `${i + 1}.jpg`);

			await downloadImage(screenshot.url, screenshotPath);

			screenshots.push(`/uploads/games/${game.id}/screenshots/${i + 1}.jpg`);
		}
	}
	return { cover, screenshots };
};
