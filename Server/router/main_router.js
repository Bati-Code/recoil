const axios = require('axios');
const e = require('express');

let riotAPI_Key = 'RGAPI-4091d591-9c7d-43ac-b637-3178ef737577';
let riotVerision = '12.1.1';
let champion_Data = null;
let item_Data = null;
let item_child_data = null;
const champion_detail_data_array = {};

const makeChild = (list, itemDB) => {
    const list_data = list.map(item => {
        if (item.from) {
            item.children = makeChild(
                item.from.map(from => itemDB[from]),
                itemDB
            );
        }
        return item;
    });

    return list_data;
};

const get_Init_Data = async () => {
    try {
        const version = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json', {
            headers: {
                'X-Riot-Token': riotAPI_Key,
            },
        });
        riotVerision = version.data[0];
        const champion = await axios.get(
            `http://ddragon.leagueoflegends.com/cdn/${version.data[0]}/data/ko_KR/champion.json`,
            {
                headers: {
                    'X-Riot-Token': riotAPI_Key,
                },
            }
        );
        const itemdata = await axios.get(
            `http://ddragon.leagueoflegends.com/cdn/${version.data[0]}/data/ko_KR/item.json`,
            {
                headers: {
                    'X-Riot-Token': riotAPI_Key,
                },
            }
        );

        let fchampion_Data = Object.entries(champion.data.data).map(([key, value], index) => {
            delete value.info;
            delete value.partype;
            delete value.stats;
            delete value.version;
            value.num = index;

            return [key, value];
        });

        champion_Data = fchampion_Data.sort((a, b) => {
            if (a[1].name < b[1].name) return -1;
            else if (a[1].name == b[1].name) return 0;
            else return 1;
        });
        item_Data = itemdata.data.data;

        const itemList = [];
        for (let item in item_Data) {
            itemList.push({
                key: item,
                legendary:
                    itemdata.data.groups.findIndex(group => group.id === item && group.MaxGroupOwnable === '1') !== -1
                        ? true
                        : false,
                mythic: item_Data[item].description.includes('rarityMythic') ? true : false,

                ...item_Data[item],
            });
        }

        item_child_data = makeChild(itemList, item_Data);
    } catch (error) {
        console.log(error);
    }
};

module.exports = app => {
    get_Init_Data();
    app.post('/refreshAPI', (req, res) => {
        riotAPI_Key = req.body.key_data;
        console.log(riotAPI_Key);
        res.json({ status: riotAPI_Key });
    });

    app.post('/refreshVersion', (req, res) => {
        riotVerision = req.body.version;
        console.log(riotVerision);
        res.json({ version: riotVerision });
    });

    app.post('/search', async (req, res) => {
        const summonerName = req.body.summonerName;
        let type = '';
        let count = 10;
        const pre_api_uri = 'https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + summonerName;
        const encode_api_uri = encodeURI(pre_api_uri);

        let summoner_Basic_Data = {};
        let summoner_Rank_Data = [];
        let Summoner_Match_List = [];
        let Summoner_Match_Data = [];

        if (req.body.type) {
            type = req.body.type;
        }
        if (req.body.count) {
            count = req.body.count;
        }

        try {
            await axios
                .get(encode_api_uri, {
                    headers: {
                        'X-Riot-Token': riotAPI_Key,
                    },
                })
                .then(response => {
                    summoner_Basic_Data = response.data;
                });

            await axios
                .get('https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/' + summoner_Basic_Data.id, {
                    headers: {
                        'X-Riot-Token': riotAPI_Key,
                    },
                })
                .then(response => {
                    summoner_Rank_Data = response.data;
                });

            await axios
                .get(
                    'https://asia.api.riotgames.com/lol/match/v5/matches' +
                        '/by-puuid/' +
                        summoner_Basic_Data.puuid +
                        `/ids?type=${type}&start=0&count=${count}`,
                    {
                        headers: {
                            'X-Riot-Token': riotAPI_Key,
                        },
                    }
                )
                .then(response => {
                    Summoner_Match_List = response.data;
                });

            await axios.all(
                Summoner_Match_List.map(async (match, index) => {
                    try {
                        await axios
                            .get('https://asia.api.riotgames.com/lol/match/v5/matches/' + match, {
                                headers: {
                                    'X-Riot-Token': riotAPI_Key,
                                },
                            })
                            .then(response => {
                                Summoner_Match_Data.push(response.data);
                            });
                    } catch (error) {
                        console.log(error);
                    }
                })
            );
            Summoner_Match_Data.sort((a, b) => b.info.gameCreation - a.info.gameCreation);
            await res.json({
                Summoner_Basic_Data: summoner_Basic_Data,
                Summoner_Rank_Data: summoner_Rank_Data,
                Summoner_Match_Data: Summoner_Match_Data,
            });
        } catch (error) {
            console.log(error);
            res.json({ search_Error: error });
        }
    });
    app.post('/multi_search', async (req, res) => {
        const summonerName_array = req.body.summonerName_array;
        let summoner_Array_Data = [];
        let type = '';
        let count = 10;

        summonerName_array.map(async (summonerName, index) => {
            const pre_api_uri = 'https://kr.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + summonerName;
            const encode_api_uri = encodeURI(pre_api_uri);

            let summoner_Basic_Data = {};
            let summoner_Rank_Data = [];
            let Summoner_Match_List = [];
            let Summoner_Match_Data = [];

            if (req.body.type) {
                type = req.body.type;
            }
            if (req.body.count) {
                count = req.body.count;
            }

            try {
                await axios
                    .get(encode_api_uri, {
                        headers: {
                            'X-Riot-Token': riotAPI_Key,
                        },
                    })
                    .then(response => {
                        summoner_Basic_Data = response.data;
                    });

                await axios
                    .get('https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/' + summoner_Basic_Data.id, {
                        headers: {
                            'X-Riot-Token': riotAPI_Key,
                        },
                    })
                    .then(response => {
                        summoner_Rank_Data = response.data;
                    });

                await axios
                    .get(
                        'https://asia.api.riotgames.com/lol/match/v5/matches' +
                            '/by-puuid/' +
                            summoner_Basic_Data.puuid +
                            `/ids?type=${type}&start=0&count=${count}`,
                        {
                            headers: {
                                'X-Riot-Token': riotAPI_Key,
                            },
                        }
                    )
                    .then(response => {
                        Summoner_Match_List = response.data;
                    });

                await axios.all(
                    Summoner_Match_List.map(async (match, index) => {
                        try {
                            await axios
                                .get('https://asia.api.riotgames.com/lol/match/v5/matches/' + match, {
                                    headers: {
                                        'X-Riot-Token': riotAPI_Key,
                                    },
                                })
                                .then(response => {
                                    Summoner_Match_Data.push(response.data);
                                });
                        } catch (error) {
                            console.log(error);
                        }
                    })
                );

                summoner_Array_Data.push({
                    basic: Summoner_Basic_Data,
                    rank: Summoner_Rank_Data,
                    match: Summoner_Match_Data,
                });
            } catch (error) {
                summoner_Array_Data.push({ error: error });
                console.log(error);
            }
        });
    });

    app.post('/test', async (req, res) => {
        const match_id = req.body.match_id;

        await axios
            .get('https://asia.api.riotgames.com/lol/match/v5/matches/' + match_id + '/timeline', {
                headers: {
                    'X-Riot-Token': riotAPI_Key,
                },
            })
            .then(response => {
                res.json(response.data);
            });
    });

    app.post('/rank', async (req, res) => {
        const user_array = req.body.user_array;
        let Match_User_Rank_Data = [];

        await axios.all(
            user_array.map(async (user, index) => {
                try {
                    await axios
                        .get('https://kr.api.riotgames.com/lol/league/v4/entries/by-summoner/' + user, {
                            headers: {
                                'X-Riot-Token': riotAPI_Key,
                            },
                        })
                        .then(response => {
                            Match_User_Rank_Data.push({ data: response.data, index: index });
                        });
                } catch (error) {
                    console.log(error);
                    res.json({ Match_User_Rank_Data: -1 });
                }
            })
        );

        Match_User_Rank_Data.sort((a, b) => {
            return a.index - b.index;
        });
        res.json({ Match_User_Rank_Data: Match_User_Rank_Data });
    });

    app.get('/challenger', async (req, res) => {
        axios
            .get('https://kr.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5', {
                headers: {
                    'X-Riot-Token': riotAPI_Key,
                },
            })
            .then(async response => {
                let data = response.data;
                let sort = data.entries.sort((a, b) => {
                    return b.leaguePoints - a.leaguePoints;
                });
                let limit_num = 5;
                sort.splice(limit_num, sort.length);

                await axios.all(
                    sort.map(async (user, index) => {
                        await axios
                            .get('https://kr.api.riotgames.com/lol/summoner/v4/summoners/' + user.summonerId, {
                                headers: {
                                    'X-Riot-Token': riotAPI_Key,
                                },
                            })
                            .then(response => {
                                sort[index].summoner_data = response.data;
                            });
                    })
                );

                await res.json({ Challenger_Data: sort });
            })
            .catch(err => {
                console.log(err);
                res.json({ 'ERROR : ': err });
            });
    });

    app.get('/champion', async (req, res) => {
        res.json(champion_Data);
    });

    app.get('/champion/:champion_name', async (req, res) => {
        if (!champion_detail_data_array[req.params.champion_name]) {
            try {
                const { data } = await axios.get(
                    `http://ddragon.leagueoflegends.com/cdn/11.24.1/data/ko_KR/champion/${req.params.champion_name}.json`
                );
                const filtered_champion_sprite_num = champion_Data.filter(
                    e => e[1].id === req.params.champion_name
                )[0][1].num;
                data.data[req.params.champion_name].sprite_num = filtered_champion_sprite_num;
                champion_detail_data_array[req.params.champion_name] = data.data[req.params.champion_name];
            } catch (err) {
                res.json(err);
            }
        }
        res.json(champion_detail_data_array[req.params.champion_name]);
    });

    app.get('/item', async (req, res) => {
        res.json(item_child_data);
    });

    app.get('/version', (req, res) => {
        res.json(riotVerision);
    });
};
