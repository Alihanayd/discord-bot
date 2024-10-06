const axios = require("axios");
const RIOT_API_KEY = process.env.RIOT_API_KEY;
const REGION = "tr1";

async function getTFTData(playerName, playerID) {
  try {
    // Summoner bilgilerini al
    const accLink = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${playerName}/${playerID}?api_key=${RIOT_API_KEY}`;

    const summonerResponse = await axios.get(accLink);

    const puuidResponse = summonerResponse.data;
    const puuid = puuidResponse.puuid;

    const idLink = `https://${REGION}.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${puuid}?api_key=${RIOT_API_KEY}`;

    const idResponse = await axios.get(idLink);

    const summoner = idResponse.data;
    const id = summoner.id;

    // Ladder (Lig) bilgilerini al
    const leagueResponse = await axios.get(
      `https://${REGION}.api.riotgames.com/tft/league/v1/entries/by-summoner/${id}?api_key=${RIOT_API_KEY}`
    );

    const leagues = leagueResponse.data;

    if (leagues.length === 0) {
      return `${playerName} adlı oyuncu liglerde bulunamadı.`;
    }

    // TFT lig bilgilerini filtrele
    const tftLeague = leagues.find(
      (league) => league.queueType === "RANKED_TFT"
    );

    if (!tftLeague) {
      return `${playerName} adlı oyuncu TFT liginde oynamıyor.`;
    }

    const tier = tftLeague.tier;
    const rank = tftLeague.rank;
    const lp = tftLeague.leaguePoints;
    const wins = tftLeague.wins;
    const losses = tftLeague.losses;

    // Tier harflerini Türkçe karşılıklarıyla değiştirebilirsiniz
    const tierMapping = {
      IRON: "Demir",
      BRONZE: "Bronz",
      SILVER: "Gümüş",
      GOLD: "Altın",
      PLATINUM: "Platin",
      EMERALD: "Zümrüt",
      DIAMOND: "Elmas",
      MASTER: "Master",
      GRANDMASTER: "Grandmaster",
      CHALLENGER: "Challenger",
    };

    const mappedTier = tierMapping[tier] || tier;

    // Yanıtı oluştur
    const response = `**${playerName}**\nTier: ${mappedTier} ${rank}\nLP: ${lp}\nWins: ${wins}\nLosses: ${losses}\nWin Rate: ${(
      (wins / (wins + losses)) * 100 || 0
    ).toFixed(2)}%\nTotal Games: ${wins + losses}`;

    return response;
  } catch (error) {
    console.error(error);
    if (error.response) {
      if (error.response.status === 404) {
        return `${playerName} adlı oyuncu bulunamadı.`;
      } else if (error.response.status === 403) {
        return "Riot API anahtarınız geçersiz veya süresi dolmuş.";
      } else {
        return "Veri alınırken bir hata oluştu.";
      }
    } else {
      return "Veri alınırken bir hata oluştu.";
    }
  }
}

module.exports = getTFTData;
