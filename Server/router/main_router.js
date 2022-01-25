const axios = require('axios');
const e = require('express');

let riotAPI_Key = 'RGAPI-aa2781c8-4edf-492c-896c-c7ffd21be849';
let riotVerision = '12.1.1';
let champion_Data_Array = {};
let item_Data_Array = {};
let champion_detail_data_array = {};
let summoner_Array = {};
let rune_Array = {};

const stats = [
    {
        id: 5001,
        name: 'HealthScaling',
        majorChangePatchVersion: '',
        tooltip: '체력 +@f1@ (레벨에 비례)',
        shortDesc: '체력 +15~140 (레벨에 비례)',
        longDesc: '체력 +15~140 (레벨에 비례)',
        icon: 'perk-images/StatMods/StatModsHealthScalingIcon.png',
        endOfGameStatDescs: [],
    },
    {
        id: 5002,
        name: 'Armor',
        majorChangePatchVersion: '',
        tooltip: '방어력 +6',
        shortDesc: '방어력 +6',
        longDesc: '방어력 +6',
        icon: 'perk-images/StatMods/StatModsArmorIcon.png',
        endOfGameStatDescs: [],
    },
    {
        id: 5003,
        name: 'MagicRes',
        majorChangePatchVersion: '',
        tooltip: '마법 저항력 +8',
        shortDesc: '마법 저항력 +8',
        longDesc: '마법 저항력 +8',
        icon: 'perk-images/StatMods/StatModsMagicResIcon.png',
        endOfGameStatDescs: [],
    },
    {
        id: 5007,
        name: 'CDRScaling',
        majorChangePatchVersion: '',
        tooltip: '스킬 가속 +@f1@',
        shortDesc:
            "<lol-uikit-tooltipped-keyword key='LinkTooltip_Description_CDR'>스킬 가속</lol-uikit-tooltipped-keyword> +8 ",
        longDesc:
            "<lol-uikit-tooltipped-keyword key='LinkTooltip_Description_CDR'>스킬 가속</lol-uikit-tooltipped-keyword> +8 ",
        icon: 'perk-images/StatMods/StatModsCDRScalingIcon.png',
        endOfGameStatDescs: [],
    },
    {
        id: 5005,
        name: 'AttackSpeed',
        majorChangePatchVersion: '',
        tooltip: '공격 속도 +10%',
        shortDesc: '공격 속도 +10%',
        longDesc: '공격 속도 +10%',
        icon: 'perk-images/StatMods/StatModsAttackSpeedIcon.png',
        endOfGameStatDescs: [],
    },
    {
        id: 5008,
        name: 'Adaptive',
        majorChangePatchVersion: '',
        tooltip: '<scaleAD>+공격력 @f2@</scaleAD>',
        shortDesc:
            "<lol-uikit-tooltipped-keyword key='LinkTooltip_Description_Adaptive'><font color='#48C4B7'>적응형 능력치</font></lol-uikit-tooltipped-keyword> +9",
        longDesc:
            "<lol-uikit-tooltipped-keyword key='LinkTooltip_Description_Adaptive'><font color='#48C4B7'>적응형 능력치</font></lol-uikit-tooltipped-keyword> +9",
        icon: 'perk-images/StatMods/StatModsAdaptiveForceIcon.png',
        endOfGameStatDescs: [],
    },
];

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

const makeChampionData = async ({ lang }) => {
    if (!champion_Data_Array[lang]) {
        const champion = await axios.get(
            `http://ddragon.leagueoflegends.com/cdn/${riotVerision}/data/${lang}/champion.json`,
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

        fchampion_Data.sort((a, b) => {
            if (a[1].name < b[1].name) return -1;
            else if (a[1].name == b[1].name) return 0;
            else return 1;
        });
        champion_Data_Array[lang] = fchampion_Data;
    }
};

const get_Init_Data = async () => {
    try {
        const version = await axios.get('https://ddragon.leagueoflegends.com/api/versions.json', {
            headers: {
                'X-Riot-Token': riotAPI_Key,
            },
        });
        riotVerision = version.data[0];
    } catch (err) {
        res.json(err);
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
        champion_Data_Array = {};
        champion_detail_data_array = {};
        item_Data_Array = {};
        summoner_Array = {};
        rune_Array = {};
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
        let Summoner_Active_GAME = {};

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

            axios
                .get(
                    'https://kr.api.riotgames.com/lol/spectator/v4/active-games/by-summoner/' + summoner_Basic_Data.id,
                    {
                        headers: {
                            'X-Riot-Token': riotAPI_Key,
                        },
                    }
                )
                .then(response => {
                    Summoner_Active_GAME = response.data;
                })
                .catch(error => {
                    Summoner_Active_GAME = { message: 'NODATA', error: error.message };
                });

            axios
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
                            .then(async response => {
                                let match = response.data;

                                if (match.info.queueId === 420) {
                                    const team = [null, null, null, null, null, null, null, null, null, null];

                                    await match.info.participants.map((user, index) => {
                                        if (user.teamPosition !== '') {
                                            switch (user.teamPosition) {
                                                case 'TOP':
                                                    user.teamId === 100 ? (team[0] = user) : (team[5] = user);
                                                    break;
                                                case 'JUNGLE':
                                                    user.teamId === 100 ? (team[1] = user) : (team[6] = user);
                                                    break;
                                                case 'MIDDLE':
                                                    user.teamId === 100 ? (team[2] = user) : (team[7] = user);
                                                    break;
                                                case 'BOTTOM':
                                                    user.teamId === 100 ? (team[3] = user) : (team[8] = user);
                                                    break;
                                                case 'UTILITY':
                                                    user.teamId === 100 ? (team[4] = user) : (team[9] = user);
                                                    break;
                                            }
                                        }
                                    });

                                    match.info.participants = team;
                                }

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
                Summoner_Active_GAME: Summoner_Active_GAME,
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
                                    console.log(response.data);
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
        try {
            await makeChampionData({ lang: req.query.lang });
            res.json(champion_Data_Array[req.query.lang]);
        } catch (error) {
            res.json(error);
        }
    });

    app.get('/champion/:champion_name', async (req, res) => {
        const data_name = req.params.champion_name + req.query.lang;

        if (!champion_detail_data_array[data_name]) {
            try {
                const { data } = await axios.get(
                    `http://ddragon.leagueoflegends.com/cdn/${riotVerision}/data/${req.query.lang}/champion/${req.params.champion_name}.json`
                );

                if (!champion_Data_Array[req.query.lang]) {
                    await makeChampionData({ lang: req.query.lang });
                }

                const filtered_champion_sprite_num = champion_Data_Array[req.query.lang].filter(
                    e => e[1].id === req.params.champion_name
                )[0][1].num;
                data.data[req.params.champion_name].sprite_num = filtered_champion_sprite_num;
                champion_detail_data_array[data_name] = data.data[req.params.champion_name];
            } catch (err) {
                res.json(err);
            }
        }
        res.json(champion_detail_data_array[data_name]);
    });

    app.get('/item', async (req, res) => {
        try {
            if (!item_Data_Array[req.query.lang]) {
                const { data } = await axios.get(
                    `http://ddragon.leagueoflegends.com/cdn/${riotVerision}/data/${req.query.lang}/item.json`,
                    {
                        headers: {
                            'X-Riot-Token': riotAPI_Key,
                        },
                    }
                );

                let item_Data = data.data;
                const itemList = [];
                for (let item in item_Data) {
                    itemList.push({
                        key: item,
                        legendary:
                            data.groups.findIndex(group => group.id === item && group.MaxGroupOwnable === '1') !== -1
                                ? true
                                : false,
                        mythic: item_Data[item].description.includes('rarityMythic') ? true : false,

                        ...item_Data[item],
                    });
                }

                item_Data_Array[req.query.lang] = makeChild(itemList, item_Data);
            }

            res.json(item_Data_Array[req.query.lang]);
        } catch (error) {
            res.json(error);
        }
    });

    app.get('/summoner', async (req, res) => {
        try {
            if (!summoner_Array[req.query.lang]) {
                const { data } = await axios.get(
                    `http://ddragon.leagueoflegends.com/cdn/${riotVerision}/data/${req.query.lang}/summoner.json`,
                    {
                        headers: {
                            'X-Riot-Token': riotAPI_Key,
                        },
                    }
                );
                summoner_Array[req.query.lang] = data;
            }

            res.json(summoner_Array[req.query.lang]);
        } catch (error) {
            res.json(error);
        }
    });

    app.get('/rune', async (req, res) => {
        try {
            if (!rune_Array[req.query.lang]) {
                const { data } = await axios.get(
                    `http://ddragon.leagueoflegends.com/cdn/${riotVerision}/data/${req.query.lang}/runesReforged.json`,
                    {
                        headers: {
                            'X-Riot-Token': riotAPI_Key,
                        },
                    }
                );

                data.push(...stats);
                rune_Array[req.query.lang] = data;
            }

            res.json(rune_Array[req.query.lang]);
        } catch (error) {
            res.json(error);
        }
    });

    app.get('/version', (req, res) => {
        res.json(riotVerision);
    });
};
