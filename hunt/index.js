const endpoint = "https://luluwaffless-rbxproxy.glitch.me";
const $ = (e) => document.getElementById(e);
const userDetails = $("userDetails");
const headshot = $("headshot");
const cards = $("cards");
const count = $("count");
const name = $("name");
const hub = $("hub")
const id = $("id");

const normalizeName = (name) => name.toLowerCase().replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '').replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim();

const userInfo = async (userId) => {
    const user = {}
    const details = await axios.get(`${endpoint}/users/v1/users/${userId}`);
    const image = await axios.get(`${endpoint}/thumbnails/v1/users/avatar-headshot?userIds=${userId}&size=720x720&format=png`);
    user.name = details.data.name;
    user.displayName = details.data.displayName;
    user.imageUrl = image.data.data[0].imageUrl;
    return user;
};

const parseIDs = async (userId, ids) => {
    const results = [];
    const getIndexById = (id) => results.findIndex((badge) => badge.id === id);
    await Promise.all(ids.map((id) => new Promise(async (resolve) => {
        await axios.get(`${endpoint}/badges/v1/badges/${id}`)
            .then((response) => {
                results.push(response.data);
                resolve();
            })
            .catch((err) => {
                console.error(`Failed to fetch badge ${id}:`, err);
                resolve();
            });
    })));
    const badges = await axios.get(`${endpoint}/badges/v1/users/${userId}/badges/awarded-dates?badgeIds=${ids.join(",")}`);
    console.log(badges.data);
    await Promise.all(badges.data.data.map((badge) => {
        const i = getIndexById(badge.badgeId);
        if (!isNaN(i)) results[i].owned = true;
    }));
    return results;
};
const parseResults = (results, element, title, useBadgeName) => {
    const owned = [];
    const notOwned = [];
    if (results.length === 0) return 
    for (const badge of results) {
        if (badge.owned) {
            owned.push(`<a class="true" ${useBadgeName ? `href="https://www.roblox.com/games/${badge.id}/">${`${owned.length + 1}`}. ${normalizeName(badge.name)}` : `href="https://www.roblox.com/games/${badge.awardingUniverse.rootPlaceId}/">${`${owned.length + 1}`}. ${normalizeName(badge.awardingUniverse.name)}`}</a>`);
        } else {
            notOwned.push(`<a class="false" ${useBadgeName ? `href="https://www.roblox.com/games/${badge.id}/">${`${notOwned.length + 1}`}. ${normalizeName(badge.name)}` : `href="https://www.roblox.com/games/${badge.awardingUniverse.rootPlaceId}/">${`${notOwned.length + 1}`}. ${normalizeName(badge.awardingUniverse.name)}`}</a>`);
        };
    };
    console.log(results);
    console.log(owned);
    console.log(notOwned);
    $(element).innerHTML = `<b>${title || `${element} tokens`} (${Math.floor((owned.length / results.length) * 100)}% | ${owned.length}/${results.length}):</b><br>${owned.length > 0 ? `${notOwned.length > 0 ? 'owned:<br>' : ''}${owned.join('<br>')}` : ''}${notOwned.length > 0 ? `${owned.length > 0 ? '<br><br>not owned:<br>' : ''}${notOwned.join("<br>")}` : ''}`;
};
count.addEventListener("click", async () => {
    headshot.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
    const userId = id.value;
    if (!userId) return alert("please insert an user id!")
    id.value = "";
    id.disabled = true;
    id.placeholder = "loading...";
    userDetails.style.display = "none";
    cards.style.display = "none";

    const user = await userInfo(userId);
    id.placeholder = "loading... (25%)";
    const hubBadgesRequest = await parseIDs(userId, hubBadges);
    id.placeholder = "loading... (50%)";
    const regularTokensRequest = await parseIDs(userId, regularTokens);
    id.placeholder = "loading... (75%)";
    const megaTokensRequest = await parseIDs(userId, megaTokens);
    id.placeholder = "loading... (100%)";

    cards.style.display === "flex";
    userDetails.style.display = "block";
    userDetails.href = `https://www.roblox.com/users/${userId}/profile`;
    headshot.src = user.imageUrl;
    name.innerHTML = `${user.displayName}<br>(@${user.name})`;
    cards.style.display = "flex";
    parseResults(hubBadgesRequest, "hub", "<a href='https://www.roblox.com/games/124180448122765/The-Hunt-Mega-Edition'>hub badges</a>", true);
    parseResults(regularTokensRequest, "regular");
    parseResults(megaTokensRequest, "mega");

    id.placeholder = "insert an user id";
    id.disabled = false;
});