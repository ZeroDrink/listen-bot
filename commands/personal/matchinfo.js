const matchEmbed = require("../../embeds/match");

async function exec(ctx) {
    let match_id = String(ctx.match_id || ctx.options[0]);
    if (!match_id) {
        return ctx.failure(ctx.strings.get("matchinfo_no_matchid"));
    }

    if (match_id.includes("dotabuff") || match_id.includes("opendota")) {
        match_id = match_id.split("/").slice(-1)[0];
    }

    if (isNaN(match_id)) {
        return ctx.failure(ctx.strings.get("matchinfo_bad_matchid"));
    }

    try {
        let key = `matchinfo:${match_id}`;
        let match = await ctx.client.redis.getAsync(key);

        if (match) {
            match = JSON.parse(match);
        } else {
            match = await ctx.client.mika.getMatch(match_id);
            await ctx.client.redis.setexAsync(key, 604800, JSON.stringify(match));
        }

        // sometimes the scores are broken
        match.radiant_score = match.players.slice(0, 5).map(player => player.kills).reduce((a, b) => a + b, 0);
        match.dire_score = match.players.slice(5, 10).map(player => player.kills).reduce((a, b) => a + b, 0);

        let embed = await matchEmbed.call(ctx.strings, ctx, match);
        return ctx.embed(embed);
    } catch (err) {
        console.error(err);
        return ctx.failure(ctx.strings.get("bot_generic_error"));
    }
}

module.exports = {
    name: "matchinfo",
    category: "personal",
    typing: true,
    exec
};
