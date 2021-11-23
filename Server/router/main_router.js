const axios = require('axios');

const riotAPI_Key = 'RGAPI-e5393875-43e3-4260-97f4-577f1b70b6a0';


module.exports = (app) => {

    app.post('/search', async (req, res) => {

        const summonerName = req.body.summonerName;
        const pre_api_uri = 'https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + summonerName;
        const encode_api_uri = encodeURI(pre_api_uri);

        let summoner_Basic_Data = {};
        let summoner_Rank_Data = [];
        let Summoner_Match_List = [];
        let Summoner_Match_Data = [];

        try {

            await axios.get(encode_api_uri,
                {
                    headers: {
                        'X-Riot-Token': riotAPI_Key,
                    }
                })
                .then((response) => {
                    summoner_Basic_Data = response.data;
                    console.log(summoner_Basic_Data);
                })

            await axios.get('https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/'
                + summoner_Basic_Data.id,
                {
                    headers: {
                        'X-Riot-Token': riotAPI_Key,
                    }
                })
                .then((response) => {
                    summoner_Rank_Data = response.data;
                })


            await axios.get('https://asia.api.riotgames.com/lol/match/v5/matches' +
                '/by-puuid/' + summoner_Basic_Data.puuid + '/ids?start=0&count=10',
                {
                    headers: {
                        'X-Riot-Token': riotAPI_Key,
                    }
                })
                .then((response) => {
                    Summoner_Match_List = response.data;
                    console.log(Summoner_Match_List);
                })


            await axios.all(
                Summoner_Match_List.map(async (match, index) => {

                    try {
                        await axios.get('https://asia.api.riotgames.com/lol/match/v5/matches/' + match,
                            {
                                headers: {
                                    'X-Riot-Token': riotAPI_Key,
                                }
                            })
                            .then((response) => {
                                Summoner_Match_Data.push(response.data);
                            })
                    } catch (error) {
                        console.log(error);
                    }

                })
            )

            await res.json({
                'Summoner_Basic_Data': summoner_Basic_Data,
                'Summoner_Rank_Data': summoner_Rank_Data,
                'Summoner_Match_Data': Summoner_Match_Data
            })

        } catch (error) {
            console.log(error);
        }

    })

    app.get('/test', async (req, res) => {

        res.json("AA");
    })

}