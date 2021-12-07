import axios from 'axios';
import React, { useEffect } from 'react'
import { useState } from 'react';
import championData from '../public/json_data/champion.json'
import MapData from '../public/json_data/map.json'
import Summoner_Data from '../public/json_data/summoner.json'
import Perk_Data from '../public/json_data/runesReforged.json'

import * as ECharts from 'echarts';
import Modal from 'antd/lib/modal/Modal';
import { Button, Tooltip } from 'antd';
import { Tabs } from 'antd';
import h337 from 'heatmap.js';
import { useRef } from 'react';
import { Server_Config } from '../public/config/config';



const { TabPane } = Tabs;

const Detail_Data = (props) => {

    const [get_visible, set_visible] = useState(false);
    const [get_Map_Data, set_Map_Data] = useState({});
    const [get_TimeLine_Data, set_TimeLine_Data] = useState([]);


    const [get_Kill_Data, set_Kill_Data] = useState([]);
    const [get_HeatMap, set_HeatMap] = useState('init');
    const [get_HeatMap_Data, set_HeatMap_Data] = useState([]);
    const [get_Temp_HeatMap_Data, set_Temp_HeatMap_Data] = useState([]);
    const [get_Temp_Kill_Data, set_Temp_Kill_Data] = useState([]);
    const [get_time, set_time] = useState(0);
    const [get_trigger, set_trigger] = useState(0);

    const [get_time_out, set_time_out] = useState('');

    const [get_User_Rank_Data, set_User_Rank_Data] = useState('');

    const canvasRef = useRef();


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
                gold: player.goldEarned,
                dpg: (player.totalDamageDealtToChampions / player.goldEarned).toFixed(1),
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
                                            style={{ width: (team1_player_deaL_data[key_data + "_avg"] * 0.92) + "%" }}>
                                            <div className="deal_text">
                                                {team1_player_deaL_data[key_data]}
                                                {team1_player_deaL_data.death != undefined && "(" + team1_player_deaL_data.death + ")"}
                                                {team1_player_deaL_data.gold != undefined && "(" + team1_player_deaL_data.gold + ")"}
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

    const Make_Total_Data = () => {
        const data = props.data.info.participants.map((player, index) => {
            const championName = player.championName;
            const champion_Image_Data = championData.data[championName].image;

            const one_sprite_size = 36;
            const summoner_one_sprite_size = 18;
            let sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 3 + 'px';
            if (champion_Image_Data?.sprite == "champion5.png")
                sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 1 + 'px';

            let summoner_sprite_size = summoner_one_sprite_size * 10 + 'px ' + summoner_one_sprite_size * 4 + 'px';


            const user_summoner1 = Object.keys(Summoner_Data.data).filter(e => {
                return Summoner_Data.data[e].key == player?.summoner1Id;
            });
            const user_summoner2 = Object.keys(Summoner_Data.data).filter(e => {
                return Summoner_Data.data[e].key == player?.summoner2Id;
            });

            const user_summoner1_data = Summoner_Data.data[user_summoner1[0]];
            const user_summoner2_data = Summoner_Data.data[user_summoner2[0]];

            //특성
            const get_user_primary_perk_category = player?.perks.styles[0];
            const get_user_primary_perk = get_user_primary_perk_category?.selections[0];
            const get_user_sub_perk_category = player?.perks.styles[1];


            const find_primary_perk_category = Perk_Data.filter(e =>
                e.id == get_user_primary_perk_category?.style)[0];
            const find_sub_category = Perk_Data.filter(e =>
                e.id == get_user_sub_perk_category?.style)[0];

            const find_primary_perk_main = find_primary_perk_category?.slots[0].runes.filter(e =>
                e.id == get_user_primary_perk?.perk);

            const primary_perk_img = '/images/' + find_primary_perk_main[0].icon;
            const sub_perk_category_img = '/images/' + find_sub_category?.icon;

            const primary_perk_data = find_primary_perk_main[0];
            const sub_perk_data_name = find_sub_category?.name;

            return (
                <>
                    <div className="flex" key={index * 9}>
                        <div key={player.championName + index}
                            style={{
                                backgroundImage: "url('/images/sprite/" + champion_Image_Data?.sprite + "')",
                                backgroundSize: sprite_size,
                                backgroundPositionX: -one_sprite_size * (champion_Image_Data?.x / 48),
                                backgroundPositionY: -one_sprite_size * (champion_Image_Data?.y / 48),
                                width: one_sprite_size + 'px',
                                height: one_sprite_size + 'px',
                            }} />
                        <div>
                            <div key={user_summoner1[0] + index}
                                style={{
                                    backgroundImage: "url('/images/sprite/" + user_summoner1_data?.image.sprite + "')",
                                    backgroundSize: summoner_sprite_size,
                                    backgroundPositionX: -summoner_one_sprite_size * (user_summoner1_data?.image?.x / 48),
                                    backgroundPositionY: -summoner_one_sprite_size * (user_summoner1_data?.image?.y / 48),
                                    width: summoner_one_sprite_size + 'px',
                                    height: summoner_one_sprite_size + 'px',
                                }} />
                            <div key={user_summoner2[0] + index}
                                style={{
                                    backgroundImage: "url('/images/sprite/" + user_summoner2_data?.image.sprite + "')",
                                    backgroundSize: summoner_sprite_size,
                                    backgroundPositionX: -summoner_one_sprite_size * (user_summoner2_data?.image?.x / 48),
                                    backgroundPositionY: -summoner_one_sprite_size * (user_summoner2_data?.image?.y / 48),
                                    width: summoner_one_sprite_size + 'px',
                                    height: summoner_one_sprite_size + 'px',
                                }} />
                        </div>
                        <div>
                            <div
                                style={{
                                    backgroundImage: "url('" + primary_perk_img + "')",
                                    backgroundSize: summoner_one_sprite_size + 'px ' + summoner_one_sprite_size + 'px',
                                    width: summoner_one_sprite_size + 'px',
                                    height: summoner_one_sprite_size + 'px',
                                }} />
                            <div
                                style={{
                                    backgroundImage: "url('" + sub_perk_category_img + "')",
                                    backgroundSize: summoner_one_sprite_size + 'px ' + summoner_one_sprite_size + 'px',
                                    width: summoner_one_sprite_size + 'px',
                                    height: summoner_one_sprite_size + 'px',
                                }} />
                        </div>
                        <div>
                            <div>
                                {player.summonerName}
                            </div>
                            <div>
                                DATA
                            </div>
                        </div>
                    </div>
                </>
            )
        })

        return data;
    }

    const Init_Charts = async () => {

        const newPromise = new Promise((resolve) => {
            resolve();
        })

        newPromise.then(async () => {
            ECharts.dispose(document.getElementById('chart_div'));
            let data = '';
            await axios.post(Server_Config.SERVER_ADDRESS + '/test',
                {
                    match_id: props.data.metadata.matchId
                })
                .then((response) => {
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
                            const championName_ko = championData.data[championName].name + " : "
                                + params.value[2] + "Gold";

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
                    }
                })
            })

            const gold_chart = ECharts.init(document.getElementById('chart_div'));
            gold_chart.setOption({
                animationDuration: 10000,
                dataset: [{
                    id: 'dataset_raw',
                    source: chart_dataSet
                },
                ...datasetWithFilters],
                title: { text: '골드' },
                label: ['gold'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    formatter: (params) => {
                        let tooltip_String = '';

                        for (let i = 0; i < 10; i++) {
                            const championName = props.data.info.participants[i].championName;
                            const champion_Image_Data = championData.data[championName].image;

                            const one_sprite_size = 18;
                            let sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 3 + 'px';
                            if (champion_Image_Data?.sprite == "champion5.png")
                                sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 1 + 'px';

                            "<span style=\"display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:#91cc75;\"></span>"
                            tooltip_String = tooltip_String +
                                params[i].marker + " " +
                                '<div ' +
                                'style="background-image:url(' + "'/images/sprite/" + champion_Image_Data?.sprite + "');" +
                                "background-size:" + sprite_size + ";" +
                                "background-position-x:" + -one_sprite_size * (champion_Image_Data?.x / 48) + "px;" +
                                "background-position-y:" + -one_sprite_size * (champion_Image_Data?.y / 48) + "px;" +
                                "width:" + one_sprite_size + "px;" +
                                "height:" + one_sprite_size + "px;" +
                                "display:inline-block" +
                                '"></div>'
                                + " : " + params[i].value[2] + "Gold" + "<br>";
                        }

                        return tooltip_String;
                    }
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
        })
    }

    const Init_Map_Canvas = () => {
        clearTimeout(get_time_out);
        let cnvs = document.getElementsByClassName('heatmap-canvas').item(0);
        let cnvs_move_ment = document.getElementsByClassName('movement_canvas').item(0);
        if (cnvs) {
            const ctx = cnvs.getContext('2d');
            ctx.clearRect(0, 0, cnvs.width, cnvs.height);
            ctx.beginPath();
        }
        if (cnvs_move_ment) {
            const ctx = cnvs_move_ment.getContext('2d');
            ctx.clearRect(0, 0, cnvs_move_ment.width, cnvs_move_ment.height);
            ctx.beginPath();
        }
    }

    const Make_Selected_Data = (participants) => {

        let kill_time_line_array = [];
        let position_array = [];

        Init_Map_Canvas();
        console.log("START");

        get_TimeLine_Data.info.frames.map((time, index) => {

            let find_data = time.events.filter((e) => e.type == 'CHAMPION_KILL' && e.killerId == participants + 1);
            let find_position = {};
            find_position.x = ((time.participantFrames[participants + 1].position.x * 700) / 15000).toFixed(0);
            find_position.y = 700 - ((time.participantFrames[participants + 1].position.y * 700) / 15000).toFixed(0);
            find_position.value = 5;
            find_position.radius = 70;

            kill_time_line_array.push({ kill: find_data, time: index });
            if (find_position)
                position_array.push(find_position);
        })

        set_Kill_Data([kill_time_line_array[0]]);
        set_Temp_Kill_Data(kill_time_line_array);
        set_HeatMap_Data([position_array[0]]);
        set_Temp_HeatMap_Data(position_array);
        set_time(1);
        set_trigger(get_trigger + 1);
        console.log("END");
    }


    const Draw_Movement = (x, y, time) => {
        console.log("DRAW : ", x, y, time);
        const canv = document.getElementsByClassName('movement_canvas').item(0);
        if (canv) {

            const ctx = canv.getContext('2d');
            if (time == 1) {
                ctx.beginPath();
                ctx.moveTo(x, y);
            }

            ctx.lineTo(x, y);
            ctx.strokeStyle = "white";
            ctx.stroke();
        }
    }

    const Map_Data = async () => {
        //map x,y = 14000
        Init_Map_Canvas();
        let data = '';
        let kill_time_line_array = [];
        let position_array = [];
        let map_data = MapData.data[props.data.info.mapId];

        await axios.post(Server_Config.SERVER_ADDRESS + '/test',
            {
                match_id: props.data.metadata.matchId
            })
            .then((response) => {
                data = response.data;
                console.log(data);
                set_TimeLine_Data(response.data);
            })

        data.info.frames.map((time, index) => {

            const user_index = props.data.info.participants.findIndex(
                (element) => element.summonerId === props.userID
            );

            console.log("INDEX : ", user_index)

            let find_data = time.events.filter((e) => e.type == 'CHAMPION_KILL');
            let find_position = {};
            find_position.x = ((time.participantFrames[user_index + 1].position.x * 700) / 15000).toFixed(0);
            find_position.y = 700 - ((time.participantFrames[user_index + 1].position.y * 700) / 15000).toFixed(0);
            find_position.value = 5;
            find_position.radius = 70;

            kill_time_line_array.push({ kill: find_data, time: index });
            if (find_position)
                position_array.push(find_position);
        })

        console.log("ARR : ", kill_time_line_array, " Heat Map : ", position_array);

        let heatmap = h337.create({
            container: document.getElementsByClassName('minimap_div').item(0)
        });

        console.log("PRops : ", props.data);
        set_HeatMap(heatmap);


        heatmap.setData({
            max: 7,
            data: [position_array[0]]
        })

        set_Kill_Data([kill_time_line_array[0]]);
        set_Temp_Kill_Data(kill_time_line_array);
        set_HeatMap_Data([position_array[0]]);
        set_Temp_HeatMap_Data(position_array);
        set_time(1);
        set_trigger(get_trigger + 1);

        set_Map_Data(map_data);
    }

    const Get_Match_User_Rank = () => {
        let user_array = [];
        props.data.info.participants.map((user, index) => {
            user_array.push(user.summonerId);
        })
        axios.post(Server_Config.SERVER_ADDRESS + '/rank',
            {
                'user_array': user_array
            })
            .then((response) => {
                console.log("RANK DATA : ", response.data);
                set_User_Rank_Data(response.data);
            })
    }

    useEffect(() => {
        Get_Match_User_Rank();
    }, [])

    useEffect(() => {
        console.log(get_time);
        if (get_time > 0 && get_time < get_Temp_Kill_Data.length && get_HeatMap != 'init') {
            set_time_out(setTimeout(() => {
                let arr = [];
                let heatmap_arr = [];

                arr.push(...get_Kill_Data);
                arr.push(get_Temp_Kill_Data[get_time]);
                heatmap_arr.push(...get_HeatMap_Data);
                heatmap_arr.push(get_Temp_HeatMap_Data[get_time]);
                console.log("ARRrrr : ", arr, "heatMap_ARR : ", heatmap_arr);
                set_Kill_Data(arr);
                set_HeatMap_Data(heatmap_arr);

                get_HeatMap.setData({
                    max: 7,
                    data: heatmap_arr
                })
                if (get_time < 7) {
                    Draw_Movement(get_Temp_HeatMap_Data[get_time].x, get_Temp_HeatMap_Data[get_time].y, get_time);
                }
                set_time(get_time + 1);
            }, 300));
        }
    }, [get_time, get_trigger])


    const Tab_Change_Handler = (key) => {
        console.log(key);
        Init_Map_Canvas();
        let cnvs = document.getElementsByClassName('heatmap-canvas').item(0);
        if (cnvs) {
            cnvs.className = "";
        }

        if (key == 'detail_graph') {
            Init_Charts();
        }
        else if (key == 'detail_map') {
            clearTimeout(get_time_out);
            Map_Data();
        }
        else if (key == 'detail_total') {
            Get_Match_User_Rank();
        }
    }

    const Champion_Select_Handler = ({ e, index }) => {
        console.log(e);
        Make_Selected_Data(index);
    }

    return (
        <>
            <Tabs defaultActiveKey="1" onChange={Tab_Change_Handler}>
                <TabPane tab="종합" key="detail_total">
                    <div>
                        <Make_Total_Data />
                    </div>
                </TabPane>
                <TabPane tab="상세 정보" key="detail_bar">
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
                        <div>
                            <div>
                                DPG - 성장 효율 (골드)
                            </div>
                            <div className="flex width100">
                                <Make_Detail_Data team='team1' key_data='dpg' wanted_data={['deal', 'gold']} />
                                <Make_Detail_Data team='team2' key_data='dpg' wanted_data={['deal', 'gold']} />
                            </div>
                        </div>
                    </div>
                </TabPane>
                <TabPane tab="그래프" key="detail_graph">
                    <div>
                        그래프
                    </div>
                    <div id="chart_div" style={{ width: '700px', height: '800px' }} />
                </TabPane>
                <TabPane tab="맵" key="detail_map">
                    <div className="champ_select_div flex width100 spaceevenly">
                        <div className="team1 flex width45 spaceevenly">
                            {
                                props.data.info.participants.map((item, index) => {
                                    if (index > 4)
                                        return;

                                    const championName = item.championName;
                                    const champion_Image_Data = championData.data[championName].image;

                                    const one_sprite_size = 48;
                                    let sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 3 + 'px';
                                    if (champion_Image_Data?.sprite == "champion5.png")
                                        sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 1 + 'px';

                                    return (
                                        <>
                                            <div onClick={(e) => Champion_Select_Handler({ e: e, index: index })} >
                                                <div key={item.championName}
                                                    style={{
                                                        backgroundImage: "url('/images/sprite/" + champion_Image_Data?.sprite + "')",
                                                        backgroundSize: sprite_size,
                                                        backgroundPositionX: -one_sprite_size * (champion_Image_Data?.x / 48),
                                                        backgroundPositionY: -one_sprite_size * (champion_Image_Data?.y / 48),
                                                        width: one_sprite_size + 'px',
                                                        height: one_sprite_size + 'px',
                                                    }} />
                                            </div>
                                        </>

                                    )
                                })
                            }
                        </div>
                        <div className="team2 flex width45 spaceevenly">
                            {
                                props.data.info.participants.map((item, index) => {
                                    if (index < 5)
                                        return;

                                    const championName = item.championName;
                                    const champion_Image_Data = championData.data[championName].image;

                                    const one_sprite_size = 48;
                                    let sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 3 + 'px';
                                    if (champion_Image_Data?.sprite == "champion5.png")
                                        sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 1 + 'px';

                                    return (
                                        <>
                                            <div onClick={(e) => Champion_Select_Handler({ e: e, index: index })}>
                                                <div key={item.championName}
                                                    style={{
                                                        backgroundImage: "url('/images/sprite/" + champion_Image_Data?.sprite + "')",
                                                        backgroundSize: sprite_size,
                                                        backgroundPositionX: -one_sprite_size * (champion_Image_Data?.x / 48),
                                                        backgroundPositionY: -one_sprite_size * (champion_Image_Data?.y / 48),
                                                        width: one_sprite_size + 'px',
                                                        height: one_sprite_size + 'px',
                                                    }} />
                                            </div>
                                        </>

                                    )
                                })
                            }
                        </div>

                    </div>
                    <div className="flex">
                        <div className="minimap_div"
                            style={{
                                backgroundImage: "url('/images/map/" + get_Map_Data?.image?.full + "')",
                                backgroundSize: '700px 700px',
                                width: '700px',
                                height: '700px',
                                position: 'relative',
                                zIndex: '100'
                            }}>
                            <div className="minimap_movement_div">
                                <canvas className="movement_canvas" width="700" height="700" id="canv" />
                            </div>
                            {
                                get_Kill_Data.map((item, index) => {

                                    const data = item.kill.map((kill, index) => {

                                        let map_size = 15000;
                                        if (get_Map_Data.MapId == 12)
                                            map_size = 14000;

                                        const kill_position_x = (kill.position.x / map_size) * 100;
                                        const kill_position_y = (kill.position.y / map_size) * 100;

                                        let team_color = '#bb0e0e';

                                        let killer_ID = kill.killerId;
                                        if (killer_ID == 0)
                                            killer_ID = 1;

                                        if (killer_ID < 6) {
                                            team_color = '#0084ff';
                                        }

                                        const champion_Name = props.data.info.participants[killer_ID - 1].championName;
                                        const champion_Image_Data = championData.data[champion_Name].image;

                                        const victim_champion_Name = props.data.info.participants[kill.victimId - 1].championName;
                                        const victim_champion_Image_Data = championData.data[victim_champion_Name].image;


                                        const one_sprite_size = 18;

                                        let sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 3 + 'px';
                                        let victim_sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 3 + 'px';
                                        if (champion_Image_Data?.sprite == "champion5.png")
                                            sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 1 + 'px';
                                        if (victim_champion_Image_Data?.sprite == "champion5.png")
                                            victim_sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 1 + 'px';

                                        const ToolTip_Data = () => {

                                            return (
                                                <>
                                                    <div>
                                                        {parseInt(kill.timestamp / 60000) + '분 ' +
                                                            ((kill.timestamp % 60000) / 1000).toFixed(0) + '초'}
                                                    </div>
                                                    <div>
                                                        KILL
                                                        <div className="flex spaceevenly">
                                                            <div key={(item.time * 100) + index + "kill"}
                                                                style={{
                                                                    backgroundImage: "url('/images/sprite/" + champion_Image_Data?.sprite + "')",
                                                                    backgroundSize: sprite_size,
                                                                    backgroundPositionX: -one_sprite_size * (champion_Image_Data?.x / 48),
                                                                    backgroundPositionY: -one_sprite_size * (champion_Image_Data?.y / 48),
                                                                    width: one_sprite_size + 'px',
                                                                    height: one_sprite_size + 'px',
                                                                }}>
                                                            </div>
                                                            <br />
                                                            <div
                                                                style={{
                                                                    backgroundImage: "url('https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-match-history/global/default/kills.png')",
                                                                    backgroundSize: '18px 18px',
                                                                    width: one_sprite_size + 'px',
                                                                    height: one_sprite_size + 'px',
                                                                }}>
                                                            </div>
                                                            <br />
                                                            <div key={(item.time * 100) + index + "victim"}
                                                                style={{
                                                                    backgroundImage: "url('/images/sprite/" + victim_champion_Image_Data?.sprite + "')",
                                                                    backgroundSize: victim_sprite_size,
                                                                    backgroundPositionX: -one_sprite_size * (victim_champion_Image_Data?.x / 48),
                                                                    backgroundPositionY: -one_sprite_size * (victim_champion_Image_Data?.y / 48),
                                                                    width: one_sprite_size + 'px',
                                                                    height: one_sprite_size + 'px',
                                                                }}>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {kill.assistingParticipantIds &&
                                                        <div>
                                                            ASSIST
                                                            <div className="flex">
                                                                {
                                                                    kill.assistingParticipantIds.map((assist, index) => {
                                                                        const champion_Name = props.data.info.participants[assist - 1].championName;
                                                                        const champion_Image_Data = championData.data[champion_Name].image;

                                                                        const one_sprite_size = 18;

                                                                        let sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 3 + 'px';
                                                                        if (champion_Image_Data?.sprite == "champion5.png")
                                                                            sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 1 + 'px';

                                                                        return (
                                                                            <>
                                                                                <div key={(item.time * 100) + index + "assist" + (assist * 9)}
                                                                                    style={{
                                                                                        backgroundImage: "url('/images/sprite/" + champion_Image_Data?.sprite + "')",
                                                                                        backgroundSize: sprite_size,
                                                                                        backgroundPositionX: -one_sprite_size * (champion_Image_Data?.x / 48),
                                                                                        backgroundPositionY: -one_sprite_size * (champion_Image_Data?.y / 48),
                                                                                        width: one_sprite_size + 'px',
                                                                                        height: one_sprite_size + 'px',
                                                                                    }} />
                                                                            </>
                                                                        )
                                                                    })}
                                                            </div>
                                                        </div>
                                                    }

                                                </>
                                            )
                                        }


                                        return (
                                            <Tooltip title={ToolTip_Data} placement="top" key={(item.time * 100) + index + "tooltip"}>
                                                <div key={(item.time * 100) + index}
                                                    style={{
                                                        position: 'absolute',
                                                        left: kill_position_x + "%",
                                                        bottom: kill_position_y + "%",
                                                        borderRadius: '100%',
                                                        border: '0.8px solid',
                                                        borderColor: team_color,
                                                        zIndex: '200'
                                                    }}>
                                                    <div key={(item.time * 100) + index + "sup"}
                                                        style={{

                                                            backgroundImage: "url('/images/sprite/" + champion_Image_Data?.sprite + "')",
                                                            backgroundSize: sprite_size,
                                                            backgroundPositionX: -one_sprite_size * (champion_Image_Data?.x / 48),
                                                            backgroundPositionY: -one_sprite_size * (champion_Image_Data?.y / 48),
                                                            width: one_sprite_size + 'px',
                                                            height: one_sprite_size + 'px',
                                                            borderRadius: '100%',
                                                        }}>
                                                    </div>
                                                </div>
                                            </Tooltip>
                                        )
                                    })

                                    return (data)
                                })
                            }
                        </div>
                        {/* <div className="killList">
                            {
                                get_Kill_Data.map((item, index) => {
                                    console.log("AA KILL : ", item);

                                    let kill_data = '';

                                    if (item.kill.length != 0) {
                                        kill_data = item.kill.map((kill, index) => {

                                            console.log("BB KILL : ", kill);

                                            let killer_ID = kill.killerId;

                                            const champion_Name = props.data.info.participants[killer_ID - 1].championName;
                                            const champion_Image_Data = championData.data[champion_Name].image;

                                            const victim_champion_Name = props.data.info.participants[kill.victimId - 1].championName;
                                            const victim_champion_Image_Data = championData.data[victim_champion_Name].image;

                                            let one_sprite_size = 18;
                                            let sprite_size = one_sprite_size * 10 + 'px ' + one_sprite_size * 3 + 'px';

                                            return (
                                                <>
                                                    <div>
                                                        <div className="flex spaceevenly">
                                                            <div key={(item.time * 500) + index + "main" + killer_ID * 1000}
                                                                style={{

                                                                    backgroundImage: "url('/images/sprite/" + champion_Image_Data?.sprite + "')",
                                                                    backgroundSize: sprite_size,
                                                                    backgroundPositionX: -one_sprite_size * (champion_Image_Data?.x / 48),
                                                                    backgroundPositionY: -one_sprite_size * (champion_Image_Data?.y / 48),
                                                                    width: one_sprite_size + 'px',
                                                                    height: one_sprite_size + 'px',
                                                                }}>
                                                            </div>
                                                            <div
                                                                style={{
                                                                    backgroundImage: "url('https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-match-history/global/default/kills.png')",
                                                                    backgroundSize: '18px 18px',
                                                                    width: one_sprite_size + 'px',
                                                                    height: one_sprite_size + 'px',
                                                                }}>
                                                            </div>
                                                            <div key={(item.time * 500) + index + "main"}
                                                                style={{

                                                                    backgroundImage: "url('/images/sprite/" + victim_champion_Image_Data?.sprite + "')",
                                                                    backgroundSize: sprite_size,
                                                                    backgroundPositionX: -one_sprite_size * (victim_champion_Image_Data?.x / 48),
                                                                    backgroundPositionY: -one_sprite_size * (victim_champion_Image_Data?.y / 48),
                                                                    width: one_sprite_size + 'px',
                                                                    height: one_sprite_size + 'px',
                                                                }}>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div>
                                                                <div key={(item.time * 500) + index + "main" + killer_ID * 1000}
                                                                    style={{

                                                                        backgroundImage: "url('/images/sprite/" + champion_Image_Data?.sprite + "')",
                                                                        backgroundSize: sprite_size,
                                                                        backgroundPositionX: -one_sprite_size * (champion_Image_Data?.x / 48),
                                                                        backgroundPositionY: -one_sprite_size * (champion_Image_Data?.y / 48),
                                                                        width: one_sprite_size + 'px',
                                                                        height: one_sprite_size + 'px',
                                                                    }}>
                                                                </div>
                                                                <div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div key={(item.time * 500) + index + "main"}
                                                                    style={{

                                                                        backgroundImage: "url('/images/sprite/" + victim_champion_Image_Data?.sprite + "')",
                                                                        backgroundSize: sprite_size,
                                                                        backgroundPositionX: -one_sprite_size * (victim_champion_Image_Data?.x / 48),
                                                                        backgroundPositionY: -one_sprite_size * (victim_champion_Image_Data?.y / 48),
                                                                        width: one_sprite_size + 'px',
                                                                        height: one_sprite_size + 'px',
                                                                    }}>
                                                                </div>
                                                                <div>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )
                                        })
                                    }

                                    return (kill_data);
                                })
                            }
                        </div> */}
                    </div>

                </TabPane>
            </Tabs>
        </>
    )
}

export default Detail_Data;