const axios = require("axios");
const logger = require("../log/logger");

const IGDB_URL = "https://api.igdb.com/v4";

exports.searchByName = async (name, type = "Main Game") => {
	try {
		const res = await axios.post(
			`${IGDB_URL}/games`,
			`
				search "${name}";
				fields id,name,cover.url;
				limit 20;
				where game_type.type="${type}";
			`,
			{
				headers: {
					"Client-ID": process.env.IGDB_CLIENT_ID,
					Authorization: `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
					"Content-Type": "text/plain",
				},
			},
		);

		return res.data;
	} catch (err) {
		logger.error("IGDB ERROR: Search By Name Failed");
		throw err;
	}
};

exports.searchByID = async (id) => {
	try {
		const res = await axios.post(
			`${IGDB_URL}/games`,
			`
				fields
					id,
					name,
					summary,
					cover.url,
					screenshots.url,
					genres.name,
					involved_companies.company.name,
					involved_companies.developer,
					involved_companies.publisher,
					first_release_date,
                    dlcs.name,
                    language_supports.language.name,
                    total_rating,
                    total_rating_count,
					rating;
				where id = ${id};
			`,
			{
				headers: {
					"Client-ID": process.env.IGDB_CLIENT_ID,
					Authorization: `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
					"Content-Type": "text/plain",
				},
			},
		);

		return res.data[0];
	} catch (err) {
		logger.error("IGDB ERROR: Search By ID Failed");
		throw err;
	}
};

exports.getDlcs = async (id) => {
	try {
		const res = await axios.post(
			`${IGDB_URL}/games`,
			`fields
				id,
				expansions.name,
				expansions.cover.url;
		where id = ${id};`,
			{
				headers: {
					"Client-ID": process.env.IGDB_CLIENT_ID,
					Authorization: `Bearer ${process.env.IGDB_ACCESS_TOKEN}`,
					"Content-Type": "text/plain",
				},
			},
		);
		return res.data[0] || null;
	} catch (err) {
		logger.error("IGDB ERROR: Get Dlcs Failed");
		throw err;
	}
};
