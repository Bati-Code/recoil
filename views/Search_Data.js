import axios from 'axios'
import React, { useEffect, useState } from 'react'
import moment from 'moment';
import { Spin } from 'antd';

import Summoner_Data from '../public/json_data/summoner_data.json'
import './css/searchCSS.css';
import './css/Main.less'

const Search_Data = (props) => {

    const [getSummonerName, setSummonerName] = useState();
    const [getSummonerBasicData, setSummonerBasicData] = useState({});
    const [getSummonerIconURL, setSummonerIconURL] =
        useState('http://ddragon.leagueoflegends.com/' +
            'cdn/11.16.1/img/profileicon/0.png');
    const [getSummonerRankData, setSummonerRankData] = useState({});

    useEffect(() => {
        setSummonerBasicData(props.SummonerBasicData);
        setSummonerIconURL(props.SummonerIconURL);
        setSummonerRankData(props.SummonerRankData);

    }, [props])

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
                        <div className="width20">
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
                        <div className="width80">
                            {getSummonerBasicData?.Summoner_Match_Data?.map((data, index) => {

                                console.log("DATA : ", getSummonerBasicData);
                                const user_index =
                                    data.info.participants.findIndex(
                                        (element) => element.summonerName === getSummonerBasicData?.Summoner_Basic_Data?.name
                                    );

                                const user_champion_data = data.info.participants[user_index];

                                const user_Champion_img = 'http://ddragon.leagueoflegends.com/cdn/11.23.1/img/'
                                    + 'champion/' + user_champion_data.championName + '.png';

                                console.log(data);

                                let temp_game_time = data.info.gameDuration;
                                let game_Duration = 0;

                                if (!data.info.gameEndTimestamp) {
                                    if(temp_game_time > 100000){
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

                                const user_win = user_champion_data.win;

                                const user_summoner1 = Object.keys(Summoner_Data.data).filter(e => {
                                    return Summoner_Data.data[e].key == user_champion_data.summoner1Id;
                                });

                                const user_summoner2 = Object.keys(Summoner_Data.data).filter(e => {
                                    return Summoner_Data.data[e].key == user_champion_data.summoner2Id;
                                });

                                const user_summoner1_img = 'http://ddragon.leagueoflegends.com/cdn/11.23.1/'
                                    + 'img/spell/' + user_summoner1[0] + '.png';
                                const user_summoner2_img = 'http://ddragon.leagueoflegends.com/cdn/11.23.1/'
                                    + 'img/spell/' + user_summoner2[0] + '.png';

                                let game_type = '';
                                if (data.info.gameMode == 'CLASSIC')
                                    game_type = "솔로랭크";
                                else if (data.info.gameMode == 'ARAM')
                                    game_type = "칼바람나락";


                                return (
                                    <div key={index} className="MatchWrap" id={user_win ? 'Match_true' : 'Match_false'}>
                                        <div>
                                            <div>
                                                {game_type}
                                            </div>
                                            <div className="MatchStatWrap">
                                                <div>
                                                    {user_win ? '승리' : '패배'}
                                                </div>
                                                <div>
                                                    {game_Duration}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="MyWrap flex">
                                            <div className="MyChampionInfo">
                                                <div className="MyChampionImage">
                                                    <img src={user_Champion_img} />
                                                </div>
                                                <div>
                                                    {user_champion_data.championName}
                                                </div>
                                            </div>
                                            <div className="width20">
                                                <div className="summoner1">
                                                    <img src={user_summoner1_img} />
                                                </div>
                                                <div>
                                                    <img src={user_summoner2_img} />
                                                </div>
                                            </div>
                                            <div>
                                                aaa
                                            </div>
                                        </div>
                                        <div className="MatchStatWrap">
                                            {user_champion_data.kills}
                                            /{user_champion_data.deaths}
                                            /{user_champion_data.assists}
                                            ({((user_champion_data.kills + user_champion_data.assists)
                                                / user_champion_data.deaths).toFixed(2)})
                                        </div>
                                        <div className="MyStatInfo">
                                            <div>
                                                {user_champion_data.kills}
                                                /{user_champion_data.deaths}
                                                /{user_champion_data.assists}
                                                ({((user_champion_data.kills + user_champion_data.assists)
                                                    / user_champion_data.deaths).toFixed(2)})
                                            </div>
                                            <div>
                                                레벨 : {user_champion_data.champLevel}
                                            </div>
                                            <div>
                                                CS : {user_champion_data.totalMinionsKilled
                                                    + user_champion_data.neutralMinionsKilled}
                                            </div>

                                        </div>
                                        <div className="teamWrap">
                                            <div className="team1">
                                                {data.info.participants.map((user, index) => {
                                                    return (
                                                        <div key={index + 100}>
                                                            <div>
                                                                {index < 5 && user.summonerName}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            <div className="team2">
                                                {data.info.participants.map((user, index) => {
                                                    return (
                                                        <div key={index + 200}>
                                                            <div>
                                                                {index > 4 && user.summonerName}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
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