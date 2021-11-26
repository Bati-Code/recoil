import axios from 'axios';
import React, { useEffect } from 'react'
import { useState } from 'react';
import championData from '../public/json_data/champion.json'

const Detail_Data = (props) => {

    const [get_deal_data, set_deal_data] = useState(false);
    const [get_dpd_data, set_dpd_data] = useState(false);
    const [get_tpd_data, set_tpd_data] = useState(false);
    console.log("Props Data : ", props.data);

    const Make_Detail_Data = ({ team1_array, team2_array, setState, key_data, wanted_data }) => {

        console.log(wanted_data);


        team1_array.sort((a, b) => { return b[key_data] - a[key_data] });
        team2_array.sort((a, b) => { return b[key_data] - a[key_data] });
        console.log(team1_array, team2_array);

        let team1_base = team1_array[0][key_data];
        let team2_base = team2_array[0][key_data];
        // let team1_result_array = [];
        // let team2_result_array = [];


        let wanted_data_avg = key_data + "_avg";

        const result_array1 = team1_array.map((item, index) => {
            const addData = {
                index,
                [wanted_data_avg]: (item[key_data] / team1_base) * 100
            };
            wanted_data.forEach((wanted) => {
                addData[wanted] = item[wanted];
            });
            return (addData);
        });

        const result_array2 = team2_array.map((item, index) => {
            const addData = {}
            addData.index = index;
            addData[wanted_data_avg] = (item[key_data] / team2_base) * 100;
            wanted_data.forEach((wanted) => {
                addData[wanted] = item[wanted];
            });
            return (addData);
        });

        // team2_array.map((item, index) => {
        //     team2_result_array.push(
        //         {
        //             [wanted_data]: item[wanted_data],
        //             [wanted_data_avg]: (item[wanted_data] / team2_base) * 100,
        //             'index': item.index
        //         });
        // })

        result_array1.sort((a, b) => { return a.index - b.index });
        result_array2.sort((a, b) => { return a.index - b.index });

        console.log("DDDD : ", result_array1, result_array2);

        setState({ team1: result_array1, team2: result_array2 });
    }

    useEffect(() => {
        let team1_array = [];
        let team2_array = [];

        let team1_dpd_array = [];
        let team2_dpd_array = [];

        let team1_tpd_array = [];
        let team2_tpd_array = [];

        props.data.info.participants.map((player, index) => {

            let cal_death = 0;
            if (player.deaths == 0)
                cal_death = 1;
            else cal_death = player.deaths;

            if (index < 5)
                team1_array.push(
                    {
                        deal: player.totalDamageDealtToChampions,
                        dpd: (player.totalDamageDealtToChampions / cal_death).toFixed(1),
                        death: player.deaths,
                        index: index
                    });
            else {
                team2_array.push(
                    {
                        deal: player.totalDamageDealtToChampions,
                        dpd: (player.totalDamageDealtToChampions / cal_death).toFixed(1),
                        death: player.deaths,
                        index: index
                    });
            }
        })

        Make_Detail_Data({ team1_array: team1_array, team2_array: team2_array, setState: set_deal_data, key_data: 'deal', wanted_data: ['death'] });

        team1_array.sort((a, b) => { return b.dpd - a.dpd });
        team2_array.sort((a, b) => { return b.dpd - a.dpd });

        let team1_base = team1_array[0].dpd;
        let team2_base = team2_array[0].dpd;

        team1_array.map((item, index) => {
            team1_dpd_array.push(
                {
                    deal: item.deal,
                    death: item.death,
                    dpd: item.dpd,
                    dpd_avg: (item.dpd / team1_base) * 100,
                    'index': item.index
                }
            );
        })
        team2_array.map((item, index) => {
            team2_dpd_array.push(
                {
                    deal: item.deal,
                    death: item.death,
                    dpd: item.dpd,
                    dpd_avg: (item.dpd / team2_base) * 100,
                    'index': item.index
                });
        })
        team1_dpd_array.sort((a, b) => { return a.index - b.index });
        team2_dpd_array.sort((a, b) => { return a.index - b.index });
        set_dpd_data({ team1: team1_dpd_array, team2: team2_dpd_array });



        axios.post('http://localhost:9900/test',
            {
                match_id: props.data.metadata.matchId
            })
            .then((response) => {
                console.log(response.data);
            })

    }, [])

    console.log("GG : ", get_dpd_data);

    return (
        <>
            <div className="detail_data_main">
                <div>
                    <div>
                        적 챔피언에게 가한 피해량
                    </div>
                    <div className="flex width100">
                        <div className="team_data_wrap flex column width100">
                            {
                                props.data.info.participants.map((player, index) => {

                                    if (index > 4) return;

                                    const champion_Image_Data = championData.data[player.championName].image;
                                    let team1_player_deaL_data = '';

                                    team1_player_deaL_data = get_deal_data && get_deal_data?.team1[index];
                                    console.log(team1_player_deaL_data);

                                    const one_sprite_size = 36;

                                    let sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 3 + 'px';
                                    if (champion_Image_Data?.sprite == "champion5.png")
                                        sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 1 + 'px';

                                    return (
                                        <div key={player.summonerName + "totalDamageDealtToChampions"}>
                                            <div className="team1_deal flex">
                                                <div className="sub_champion_image"
                                                    style={{
                                                        backgroundImage: "url('/images/sprite/" + champion_Image_Data?.sprite + "')",
                                                        backgroundSize: sprite_size,
                                                        backgroundPositionX: -one_sprite_size * (champion_Image_Data?.x / 48),
                                                        backgroundPositionY: -one_sprite_size * (champion_Image_Data?.y / 48),
                                                        width: one_sprite_size + "px",
                                                        height: one_sprite_size + "px",
                                                    }}>
                                                </div>
                                                <div className="team1_bar"
                                                    style={{ width: team1_player_deaL_data?.deal_avg + "%" }}>
                                                    <div className="deal_text">
                                                        {team1_player_deaL_data?.deal}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div className="team_data_wrap flex column width100">
                            {
                                props.data.info.participants.map((player, index) => {

                                    if (index < 5) return;

                                    const champion_Image_Data = championData.data[player.championName].image;
                                    let team2_player_deaL_data = '';

                                    team2_player_deaL_data = get_deal_data && get_deal_data?.team2[index - 5];
                                    console.log(team2_player_deaL_data);

                                    const one_sprite_size = 36;

                                    let sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 3 + 'px';
                                    if (champion_Image_Data?.sprite == "champion5.png")
                                        sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 1 + 'px';

                                    return (
                                        <div key={player.summonerName + "totalDamageDealtToChampions"}>
                                            <div className="team1_deal flex">
                                                <div className="sub_champion_image"
                                                    style={{
                                                        backgroundImage: "url('/images/sprite/" + champion_Image_Data?.sprite + "')",
                                                        backgroundSize: sprite_size,
                                                        backgroundPositionX: -one_sprite_size * (champion_Image_Data?.x / 48),
                                                        backgroundPositionY: -one_sprite_size * (champion_Image_Data?.y / 48),
                                                        width: one_sprite_size + "px",
                                                        height: one_sprite_size + "px",
                                                    }}>
                                                </div>
                                                <div className="team2_bar"
                                                    style={{ width: team2_player_deaL_data?.deal_avg + "%" }}>
                                                    <div className="deal_text">
                                                        {team2_player_deaL_data?.deal}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                <div>
                    <div>
                        DPD - 데스 당 적 챔피언에게 가한 피해량
                    </div>
                    <div className="flex width100">
                        <div className="team_data_wrap flex column width100">
                            {
                                props.data.info.participants.map((player, index) => {

                                    if (index > 4) return;

                                    const champion_Image_Data = championData.data[player.championName].image;
                                    let team1_player_deaL_data = '';

                                    team1_player_deaL_data = get_dpd_data && get_dpd_data?.team1[index];
                                    console.log(team1_player_deaL_data);

                                    const one_sprite_size = 36;

                                    let sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 3 + 'px';
                                    if (champion_Image_Data?.sprite == "champion5.png")
                                        sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 1 + 'px';

                                    return (
                                        <div key={player.summonerName + "totalDamageDealtToChampions"}>
                                            <div className="team1_deal flex">
                                                <div className="sub_champion_image"
                                                    style={{
                                                        backgroundImage: "url('/images/sprite/" + champion_Image_Data?.sprite + "')",
                                                        backgroundSize: sprite_size,
                                                        backgroundPositionX: -one_sprite_size * (champion_Image_Data?.x / 48),
                                                        backgroundPositionY: -one_sprite_size * (champion_Image_Data?.y / 48),
                                                        width: one_sprite_size + "px",
                                                        height: one_sprite_size + "px",
                                                    }}>
                                                </div>
                                                <div className="team1_bar"
                                                    style={{ width: team1_player_deaL_data?.dpd_avg + "%" }}>
                                                    <div className="deal_text">
                                                        {team1_player_deaL_data?.dpd}({team1_player_deaL_data?.death})
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div className="team_data_wrap flex column width100">
                            {
                                props.data.info.participants.map((player, index) => {

                                    if (index < 5) return;

                                    const champion_Image_Data = championData.data[player.championName].image;
                                    let team2_player_deaL_data = '';

                                    team2_player_deaL_data = get_dpd_data && get_dpd_data?.team2[index - 5];
                                    console.log(team2_player_deaL_data);

                                    const one_sprite_size = 36;

                                    let sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 3 + 'px';
                                    if (champion_Image_Data?.sprite == "champion5.png")
                                        sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 1 + 'px';

                                    return (
                                        <div key={player.summonerName + "totalDamageDealtToChampions"}>
                                            <div className="team1_deal flex">
                                                <div className="sub_champion_image"
                                                    style={{
                                                        backgroundImage: "url('/images/sprite/" + champion_Image_Data?.sprite + "')",
                                                        backgroundSize: sprite_size,
                                                        backgroundPositionX: -one_sprite_size * (champion_Image_Data?.x / 48),
                                                        backgroundPositionY: -one_sprite_size * (champion_Image_Data?.y / 48),
                                                        width: one_sprite_size + "px",
                                                        height: one_sprite_size + "px",
                                                    }}>
                                                </div>
                                                <div className="team2_bar"
                                                    style={{ width: team2_player_deaL_data?.dpd_avg + "%" }}>
                                                    <div className="deal_text">
                                                        {team2_player_deaL_data?.dpd}({team2_player_deaL_data?.death})
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Detail_Data;