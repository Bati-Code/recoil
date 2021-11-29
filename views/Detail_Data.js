import axios from 'axios';
import React, { useEffect } from 'react'
import { useState } from 'react';
import championData from '../public/json_data/champion.json'

import * as ECharts from 'echarts';

const Detail_Data = (props) => {

    const [get_deal_data, set_deal_data] = useState(false);
    const [get_dpd_data, set_dpd_data] = useState(false);
    const [get_tpd_data, set_tpd_data] = useState(false);

    const Make_Detail_Data = ({ team, key_data, wanted_data }) => {
        let team1_array = [];
        let team2_array = [];

        props.data.info.participants.map((player, index) => {
            let cal_death = 0;
            if (player.deaths == 0)
                cal_death = 1;
            else cal_death = player.deaths;

            const player_data = {
                deal: player.totalDamageDealtToChampions,
                dpd: (player.totalDamageDealtToChampions / cal_death).toFixed(1),
                death: player.deaths,
                damageTaken: player.totalDamageTaken,
                dtpd: (player.totalDamageTaken / cal_death).toFixed(1),
                index: index
            }
            if (index < 5)
                team1_array.push(player_data);
            else {
                team2_array.push(player_data);
            }
        })

        team1_array.sort((a, b) => { return b[key_data] - a[key_data] });
        team2_array.sort((a, b) => { return b[key_data] - a[key_data] });

        let team1_base = team1_array[0][key_data];
        let team2_base = team2_array[0][key_data];

        let wanted_data_avg = key_data + "_avg";

        const result_array1 = team1_array.map((item, index) => {
            const addData = {
                index: item.index,
                [key_data]: item[key_data],
                [wanted_data_avg]: (item[key_data] / team1_base) * 100
            };
            wanted_data.forEach((wanted) => {
                addData[wanted] = item[wanted];
            });
            return (addData);
        });

        const result_array2 = team2_array.map((item, index) => {
            const addData = {
                index: item.index,
                [key_data]: item[key_data],
                [wanted_data_avg]: (item[key_data] / team2_base) * 100
            };

            wanted_data.forEach((wanted) => {
                addData[wanted] = item[wanted];
            });
            return (addData);
        });

        result_array1.sort((a, b) => { return a.index - b.index });
        result_array2.sort((a, b) => { return a.index - b.index });

        console.log("death : ", result_array1.death);


        let deal_data = { team1: result_array1, team2: result_array2 };

        return (
            <>
                <div className="team_data_wrap flex column width100">
                    {
                        props.data.info.participants.map((player, index) => {

                            let team1_player_deaL_data = '';

                            if (team == 'team1') {
                                if (index > 4) {
                                    return;
                                }
                                else {
                                    team1_player_deaL_data = deal_data && deal_data?.team1[index];
                                }
                            }
                            else if (team == 'team2') {
                                if (index < 5) {
                                    return;
                                }
                                else {
                                    team1_player_deaL_data = deal_data && deal_data?.team2[index - 5];
                                }
                            }

                            const champion_Image_Data = championData.data[player.championName].image;
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
                                        <div className={team + "_bar"}
                                            style={{ width: (team1_player_deaL_data[key_data + "_avg"] * 0.9) + "%" }}>
                                            <div className="deal_text">
                                                {team1_player_deaL_data[key_data]}{team1_player_deaL_data.death != undefined && "(" + team1_player_deaL_data.death + ")"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </>
        )

    }

    const Init_Charts = async () => {


        let data = '';
        await axios.post('http://localhost:9900/test',
            {
                match_id: props.data.metadata.matchId
            })
            .then((response) => {
                console.log(response.data);
                data = response.data;
            })

        console.log("TimeLine_Data : ", data);

        let users = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
        let chart_dataSet = [['user', 'time', 'gold']];
        let datasetWithFilters = [];
        let seriesList = [];

        data.info.frames.map((time, index) => {
            for (let i = 1; i < 11; i++) {
                chart_dataSet.push([i, index, time.participantFrames[i].totalGold]);
            }
        })

        ECharts.util.each(users, (user) => {
            let datasetId = 'dataset_' + user + 'user';

            datasetWithFilters.push({
                id: datasetId,
                fromDatasetId: 'dataset_raw',
                transform: {
                    type: 'filter',
                    config: {
                        dimension: 'user',
                        '=': user
                    }
                }
            })

            seriesList.push({
                type: 'line',
                datasetId: datasetId,
                showSymbol: false,
                name: user,
                endLabel: {
                    show: true,
                    formatter: (params) => {
                        const championName = props.data.info.participants[params.value[0] - 1].championName;
                        const championName_ko = championData.data[championName].name;

                        return (
                            championName_ko
                        )
                    }
                },
                labelLayout: {
                    moveOverlap: 'shiftY'
                },
                emphasis: {
                    focus: 'series'
                },
                encode: {
                    x: 'time',
                    y: 'gold',
                    label: ['user', 'gold'],
                    itemName: 'Time',
                    tooltip: ['gold']
                }
            })
        })

        console.log("Chart_DataSet : ", chart_dataSet);

        const gold_chart = ECharts.init(document.getElementById('chart_div'));
        gold_chart.setOption({
            animationDuration: 10000,
            dataset: [{
                id: 'dataset_raw',
                source: chart_dataSet
            },
            ...datasetWithFilters],
            title: { text: '골드' },
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                boundaryGap: false
            },
            yAxis: {
                type: 'value',
            },
            series: seriesList,
        })
    }

    useEffect(() => {
        Init_Charts();
    }, [])

    return (
        <>
            <div className="detail_data_main">
                <div>
                    <div>
                        적 챔피언에게 가한 피해량
                    </div>
                    <div className="flex width100">
                        <Make_Detail_Data team='team1' key_data='deal' wanted_data={[]} />
                        <Make_Detail_Data team='team2' key_data='deal' wanted_data={[]} />
                    </div>
                </div>
                <div>
                    <div>
                        DPD - 데스 당 적 챔피언에게 가한 피해량
                    </div>
                    <div className="flex width100">
                        <Make_Detail_Data team='team1' key_data='dpd' wanted_data={['deal', 'death']} />
                        <Make_Detail_Data team='team2' key_data='dpd' wanted_data={['deal', 'death']} />
                    </div>
                </div>
                <div>
                    <div>
                        받은 피해량
                    </div>
                    <div className="flex width100">
                        <Make_Detail_Data team='team1' key_data='damageTaken' wanted_data={[]} />
                        <Make_Detail_Data team='team2' key_data='damageTaken' wanted_data={[]} />
                    </div>
                </div>
                <div>
                    <div>
                        DTPD - 데스 당 받은 피해량
                    </div>
                    <div className="flex width100">
                        <Make_Detail_Data team='team1' key_data='dtpd' wanted_data={['death']} />
                        <Make_Detail_Data team='team2' key_data='dtpd' wanted_data={['death']} />
                    </div>
                </div>
                <div id="chart_div" style={{ width: '600px', height: '1000px' }}>

                </div>
            </div>
        </>
    )
}

export default Detail_Data;