import axios from 'axios'
import React, { useEffect, useState } from 'react'
import moment from 'moment';
import { Spin } from 'antd';

import Summoner_Data from '../public/json_data/summoner_data.json';
import Perk_Data from '../public/json_data/runesReforged.json';
import Champion_Data from '../public/json_data/champion.json';
import Item_Data from '../public/json_data/item.json';

import './css/searchCSS.css';
import './css/Main.less'
import Tooltip from '../item/Tooltip';
import Detail_Data from './Detail_Data';

const Search_Data = (props) => {

    const [getSummonerBasicData, setSummonerBasicData] = useState({});
    const [getSummonerIconURL, setSummonerIconURL] =
        useState('http://ddragon.leagueoflegends.com/' +
            'cdn/11.16.1/img/profileicon/0.png');
    const [getSummonerRankData, setSummonerRankData] = useState({});

    const [get_Detail_Bar_Click, set_Detail_Bar_Click] = useState(false);
    const [get_GameId, set_GameId] = useState('');

    useEffect(() => {
        setSummonerBasicData(props.SummonerBasicData);
        setSummonerIconURL(props.SummonerIconURL);
        setSummonerRankData(props.SummonerRankData);

    }, [props])

    const detail_bar_handler = (game_id) => {

        const a = document.getElementById('detail_div');
        set_GameId(game_id);
        if (get_GameId == game_id) {
            set_Detail_Bar_Click(false);
            set_GameId('');
        }
        else {
            set_Detail_Bar_Click(true);
        }

    }


    return (
        <>
            <Spin spinning={props.loading}>
                <div className="width100">
                    <div className='userInfoWrap'>
                        <div className='userIcon'>
                            <img className='userIconImage' src={getSummonerIconURL} />
                        </div>
                        <div className='userBasicData'>
                            SummonerName : {getSummonerBasicData?.Summoner_Basic_Data?.name ?? "정보 없음"}
                            <br />
                            Level : {getSummonerBasicData?.Summoner_Basic_Data?.summonerLevel ?? "정보 없음"}
                            <br />
                            {getSummonerRankData?.tier}{getSummonerRankData?.rank}
                            {getSummonerRankData?.leaguePoints}
                            <br />
                            {getSummonerRankData?.wins}승
                            {getSummonerRankData?.losses}패
                            ({((getSummonerRankData?.wins / (getSummonerRankData?.wins + getSummonerRankData?.losses)) * 100).toFixed(3)}%)
                            <br />
                            revisionDate : {getSummonerBasicData?.Summoner_Basic_Data?.revisionDate ? moment(getSummonerBasicData?.Summoner_Basic_Data?.revisionDate).format('YYYY-MM-DD HH:mm') : "미검색"}
                            <br />
                        </div>
                    </div>
                    <div className="flex width100">
                        <div className="width30">
                            <div className="flex">
                                <div className="width30">
                                    <img className='userIconImage' src={"/images/ranked_emblems/Emblem_" + getSummonerRankData?.tier + ".png"} />
                                </div>
                                <div className="width70">
                                    <div>
                                        {getSummonerRankData?.tier}{getSummonerRankData?.rank}
                                    </div>
                                    <div>
                                        {getSummonerRankData?.leaguePoints}LP
                                    </div>
                                    <div>
                                        {getSummonerRankData?.wins}승 {getSummonerRankData?.losses}패
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="width70">
                            {getSummonerBasicData?.Summoner_Match_Data?.map((data, index) => {

                                console.log("DATA : ", data, getSummonerBasicData);
                                const user_index =
                                    data.info.participants.findIndex(
                                        (element) => element.summonerId === getSummonerBasicData?.Summoner_Basic_Data?.id
                                    );

                                const user_champion_data = data?.info?.participants[user_index];

                                console.log("user_champion_data : ", user_champion_data, "index : ", user_index);

                                //유저 챔피언
                                const user_Champion_ko_data = Champion_Data.data[user_champion_data?.championName];
                                const user_Champion_img = 'http://ddragon.leagueoflegends.com/cdn/11.23.1/img/'
                                    + 'champion/' + user_champion_data?.championName + '.png';

                                console.log("Each_Data : ", data);

                                //게임 시간
                                let temp_game_time = data.info.gameDuration;
                                let game_Duration = 0;

                                if (!data.info.gameEndTimestamp) {
                                    if (temp_game_time > 100000) {
                                        temp_game_time = temp_game_time / 1000;
                                    }
                                    const min = parseInt(temp_game_time / 60);
                                    const sec = (temp_game_time % 60).toFixed(0);
                                    game_Duration = min + "분 " + sec + "초";
                                }
                                else {
                                    game_Duration = moment(data.info.gameEndTimestamp
                                        - data.info.gameStartTimestamp).format('mm분 ss초');

                                }

                                //승패
                                const user_win = user_champion_data?.win;

                                //게임 타입
                                let game_type = '';
                                if (data.info.gameMode == 'CLASSIC')
                                    game_type = "솔로랭크";
                                else if (data.info.gameMode == 'ARAM')
                                    game_type = "칼바람나락";

                                //KDA
                                let kda_data = ((user_champion_data?.kills + user_champion_data?.assists)
                                    / user_champion_data?.deaths).toFixed(2);

                                if (user_champion_data?.deaths == 0)
                                    kda_data = "perfect";


                                //스펠
                                const user_summoner1 = Object.keys(Summoner_Data.data).filter(e => {
                                    return Summoner_Data.data[e].key == user_champion_data?.summoner1Id;
                                });
                                const user_summoner2 = Object.keys(Summoner_Data.data).filter(e => {
                                    return Summoner_Data.data[e].key == user_champion_data?.summoner2Id;
                                });

                                const user_summoner1_data = Summoner_Data.data[user_summoner1[0]];
                                const user_summoner2_data = Summoner_Data.data[user_summoner2[0]];

                                const user_summoner1_img = 'http://ddragon.leagueoflegends.com/cdn/11.23.1/'
                                    + 'img/spell/' + user_summoner1[0] + '.png';
                                const user_summoner2_img = 'http://ddragon.leagueoflegends.com/cdn/11.23.1/'
                                    + 'img/spell/' + user_summoner2[0] + '.png';


                                //특성
                                const get_user_primary_perk_category = user_champion_data?.perks.styles[0];
                                const get_user_primary_perk = get_user_primary_perk_category?.selections[0];
                                const get_user_sub_perk_category = user_champion_data?.perks.styles[1];


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

                                //아이템
                                let user_item_array = [];

                                for (let i = 0; i < 6; i++) {
                                    user_item_array.push(Item_Data.data[user_champion_data['item' + i]]);
                                }

                                user_item_array.splice(3, 0, Item_Data.data[user_champion_data['item6']]);
                                user_item_array.push(undefined);


                                console.log("ITEM : ", user_item_array);


                                //챔피언 이미지
                                let champion_image_array = [];

                                data.info.participants.map((item, index) => {
                                    champion_image_array.push(Champion_Data.data[item.championName]?.image);
                                })


                                return (
                                    <div>
                                        <div key={index} className="MatchWrap" id={user_win ? 'Match_true' : 'Match_false'}>
                                            <div className="MatchType">
                                                <div>
                                                    {game_type}
                                                </div>
                                                <div className="MatchStatWrap">
                                                    <div className={user_win ? 'win' : 'defeat'}>
                                                        {user_win ? '승리' : '패배'}
                                                    </div>
                                                    <div className="game_time">
                                                        {game_Duration}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="MyWrap flex">
                                                <div className="MyChampionInfo">
                                                    <Tooltip message={user_Champion_ko_data.blurb} childNode='MyChampionImage'>
                                                        <div className="MyChampionImage" id="MyChampionImage">
                                                            <img src={user_Champion_img} />
                                                        </div>
                                                    </Tooltip>
                                                    <div>
                                                        {user_Champion_ko_data.name}
                                                    </div>
                                                </div>
                                                <div className="width20">
                                                    <Tooltip message={user_summoner1_data.description} childNode='summoner1'>
                                                        <div className="summoner1">
                                                            <img src={user_summoner1_img} />
                                                        </div>
                                                    </Tooltip>
                                                    <Tooltip message={user_summoner2_data.description} childNode='summoner2'>
                                                        <div className="summoner2">
                                                            <img src={user_summoner2_img} />
                                                        </div>
                                                    </Tooltip>
                                                </div>
                                                <div className="perk width20">
                                                    <Tooltip message={primary_perk_data.longDesc} childNode='primary_perk'>
                                                        <div className="primary_perk">
                                                            <img src={primary_perk_img} />
                                                        </div>
                                                    </Tooltip>
                                                    <Tooltip message={sub_perk_data_name} childNode='sub_perk_image'>
                                                        <div className="sub_perk_image">
                                                            <img src={sub_perk_category_img} />
                                                        </div>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                            <div className="MatchStatWrap">
                                                <div className="KDA_ALL">
                                                    {user_champion_data.kills + " / "}
                                                    <span className="KDA_Death">{user_champion_data.deaths}</span>
                                                    {" / " + user_champion_data.assists}
                                                </div>
                                                <div className="KDA">
                                                    {kda_data} KDA
                                                </div>
                                                <div>
                                                    {
                                                        user_champion_data.pentaKills != 0 ?
                                                            <div className="KillSequence">펜타킬</div>
                                                            : user_champion_data.quadraKills != 0 ?
                                                                <div className="KillSequence">쿼드라킬</div>
                                                                : user_champion_data.tripleKills != 0 ?
                                                                    <div className="KillSequence"> 트리플킬</div>
                                                                    : user_champion_data.doubleKills != 0 ?
                                                                        <div className="KillSequence">더블킬</div>
                                                                        : null
                                                    }
                                                </div>
                                            </div>
                                            <div className="MyStatInfo">
                                                <div>
                                                    레벨 : {user_champion_data.champLevel}
                                                </div>
                                                <div>
                                                    CS : {user_champion_data.totalMinionsKilled
                                                        + user_champion_data.neutralMinionsKilled}
                                                </div>

                                            </div>
                                            <div className="itemWrap">
                                                {
                                                    user_item_array.map((item, index) => {

                                                        const item_image_data = item?.image;
                                                        const item_name_html = "<item_title>" + item?.name + "</item_title><br>";
                                                        const item_gold_html =
                                                            "<item_gold>구매 가격 : " + item?.gold.total +
                                                            " | 판매 가격 : " + item?.gold.sell +
                                                            "<br>조합 가격 : " + item?.gold.base +
                                                            "</item_gold><br>";


                                                        let item_description = item?.description;

                                                        item_description = item_name_html + item_description + item_gold_html;


                                                        let sprite_size = "240px 240px";
                                                        const icon_size = 24;

                                                        if (item == undefined) {

                                                            return (
                                                                <div className="user_item">
                                                                    <div
                                                                        style={{
                                                                            backgroundColor: '#dbdbdb',
                                                                            width: icon_size + "px",
                                                                            height: icon_size + "px",
                                                                        }}>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }

                                                        if (item_image_data?.sprite == 'item2.png')
                                                            sprite_size = "240px 24px";

                                                        return (
                                                            <div className="user_item">
                                                                <Tooltip message={item_description} childNode='item_image'>
                                                                    <div
                                                                        className="item_image"
                                                                        style={{
                                                                            backgroundImage: "url('/images/sprite/" + item_image_data?.sprite + "')",
                                                                            backgroundPositionX: -1 * icon_size * (item_image_data?.x / 48),
                                                                            backgroundPositionY: -1 * icon_size * (item_image_data?.y / 48),
                                                                            backgroundSize: sprite_size,
                                                                            width: icon_size + "px",
                                                                            height: icon_size + "px",
                                                                        }}>
                                                                    </div>
                                                                </Tooltip>
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                            <div className="teamWrap width25">
                                                <div className="team1 width50">
                                                    {data.info.participants.map((user, index) => {

                                                        const sprite = champion_image_array[index]?.sprite;
                                                        let sprite_size = '180px 54px';

                                                        if (sprite == "champion5.png") {
                                                            sprite_size = '180px 18px'
                                                        }

                                                        if (index > 4) {
                                                            return;
                                                        }

                                                        return (
                                                            <div key={index + 100}>
                                                                <div className="flex">
                                                                    <div>
                                                                        <div className="sub_champion_image"
                                                                            style={{
                                                                                backgroundImage: "url('/images/sprite/" + champion_image_array[index]?.sprite + "')",
                                                                                backgroundSize: sprite_size,
                                                                                backgroundPositionX: -18 * (champion_image_array[index]?.x / 48),
                                                                                backgroundPositionY: -18 * (champion_image_array[index]?.y / 48),
                                                                                width: "18px",
                                                                                height: "18px",
                                                                            }}>
                                                                        </div>
                                                                    </div>
                                                                    <span className="team_participants">
                                                                        {index < 5 &&
                                                                            user.summonerName}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                                <div className="team2 width50">
                                                    {data.info.participants.map((user, index) => {
                                                        const sprite = champion_image_array[index]?.sprite;
                                                        let sprite_size = '180px 54px';

                                                        if (sprite == "champion5.png") {
                                                            sprite_size = '180px 18px'
                                                        }

                                                        if (index < 5) {
                                                            return;
                                                        }
                                                        return (
                                                            <div key={index + 200}>
                                                                <div className="flex team_participants">
                                                                    <div>
                                                                        <div className="sub_champion_image"
                                                                            style={{
                                                                                backgroundImage: "url('/images/sprite/" + champion_image_array[index]?.sprite + "')",
                                                                                backgroundSize: sprite_size,
                                                                                backgroundPositionX: -18 * (champion_image_array[index]?.x / 48),
                                                                                backgroundPositionY: -18 * (champion_image_array[index]?.y / 48),
                                                                                width: "18px",
                                                                                height: "18px",
                                                                            }}>
                                                                        </div>
                                                                    </div>
                                                                    <span className="team_participants">
                                                                        {user.summonerName}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                            <div onClick={() => detail_bar_handler(data.info.gameId)}>
                                                {">"}
                                            </div>
                                        </div>
                                        <div className={"detail " + (get_Detail_Bar_Click &&
                                            data.info.gameId == get_GameId ? 'show'
                                            : 'hide')}>

                                            {
                                                get_Detail_Bar_Click &&
                                                data.info.gameId == get_GameId &&
                                                <Detail_Data
                                                    data={data}
                                                    userID={getSummonerBasicData?.Summoner_Basic_Data?.id}
                                                />
                                            }
                                        </div>
                                    </div>
                                )

                            }) ?? "정보 없음"}
                        </div>
                    </div>
                    {true || <div>false</div>}
                </div>
            </Spin>
        </>
    )
}

export default Search_Data;