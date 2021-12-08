const axios = require('axios');


module.exports = (app) => {

    let riotAPI_Key = 'RGAPI-8ca38a35-3ea9-4461-95cc-d9839c806367';

    app.post('/refreshAPI', (req, res) => {

        riotAPI_Key = req.body.key_data;
        console.log(riotAPI_Key);
        res.json({ status: riotAPI_Key });
    })

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
            res.json({ "search_Error": error });
        }

    })

    app.post('/test', async (req, res) => {

        const match_id = req.body.match_id;

        await axios.get('https://asia.api.riotgames.com/lol/match/v5/matches/' + match_id + '/timeline',
            {
                headers: {
                    'X-Riot-Token': riotAPI_Key,
                }
            })
            .then((response) => {
                res.json(response.data);
            })

    })

    app.post('/rank', async (req, res) => {

        const user_array = req.body.user_array;
        let Match_User_Rank_Data = [];

        await axios.all(
            user_array.map(async (user, index) => {
                try {
                    await axios.get('https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/' + user,
                        {
                            headers: {
                                'X-Riot-Token': riotAPI_Key,
                            }
                        })
                        .then((response) => {
                            Match_User_Rank_Data.push({ data: response.data, index: index });
                        })
                } catch (error) {
                    console.log(error);
                    res.json({ 'Match_User_Rank_Data': -1 });
                }
            })
        )

        Match_User_Rank_Data.sort((a, b) => { return (a.index - b.index) })
        res.json({ 'Match_User_Rank_Data': Match_User_Rank_Data });
    })
}