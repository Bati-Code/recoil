import axios from 'axios'
import React, { useState } from 'react'
import moment from 'moment';

import './css/searchCSS.css';

const Search = () => {

    const [getSummonerName, setSummonerName] = useState('');
    const [getSummonerBasicData, setSummonerBasicData] = useState({});
    const [getSummonerIconURL, setSummonerIconURL] =
        useState('http://ddragon.leagueoflegends.com/' +
            'cdn/11.16.1/img/profileicon/0.png');
    const [getSummonerRankData, setSummonerRankData] = useState({});


    const getSummonerBasicData_Handler = () => {

        axios.post('http://localhost:9900/search',
            {
                summonerName: getSummonerName
            })
            .then((response) => {
                const Sorted_Match_List = response.data.Summoner_Match_Data.sort((a, b) => b.info.gameId - a.info.gameId)
                console.log(response.data);
                // setSummonerName('');
                const icon_url = 'http://ddragon.leagueoflegends.com/cdn/11.16.1/img/profileicon/'
                    + response.data.Summoner_Basic_Data.profileIconId + '.png'

                const find_Solo_Rank_Index = response.data.Summoner_Rank_Data.findIndex(
                    (element) => element.queueType === "RANKED_SOLO_5x5"
                );
                setSummonerBasicData(response.data);
                setSummonerIconURL(icon_url);
                setSummonerRankData(response.data.Summoner_Rank_Data[find_Solo_Rank_Index]);

            })
    }

    const inputHandler = (e) => {
        setSummonerName(e.target.value);
    }

    return (
        <>
            <div>
                <input type="text" onChange={inputHandler} value={getSummonerName}></input>
                <button onClick={getSummonerBasicData_Handler}>클릭</button>
            </div>
            <div>
                <div className='userInfoWrap'>
                    <div className='userIcon'>
                        <img className='userIconImage' src={getSummonerIconURL} />
                    </div>
                    <div className='userBasicData'>
                        SummonerName : {getSummonerBasicData?.Summoner_Basic_Data?.name ?? "정보 없음"}
                        <br />
                        Level : {getSummonerBasicData?.Summoner_Basic_Data?.summonerLevel ?? "정보 없음"}
                        <br />
                        {getSummonerRankData.tier}{getSummonerRankData.rank}
                        {getSummonerRankData.leaguePoints}
                        <br />
                        {getSummonerRankData.wins}승
                        {getSummonerRankData.losses}패
                        ({((getSummonerRankData.wins / (getSummonerRankData.wins + getSummonerRankData.losses)) * 100).toFixed(3)}%)
                        <br />
                        revisionDate : {getSummonerBasicData?.Summoner_Basic_Data?.revisionDate ? moment(getSummonerBasicData?.Summoner_Basic_Data?.revisionDate).format('YYYY-MM-DD HH:mm') : "미검색"}
                        <br />
                    </div>
                </div>
                <div>
                    {getSummonerBasicData?.Summoner_Match_Data?.map((data, index) => {

                        const user_index =
                            data.info.participants.findIndex(
                                (element) => element.summonerName === getSummonerBasicData?.Summoner_Basic_Data?.name
                            );

                        const user_champion_data = data.info.participants[user_index];

                        const user_Champion_img = 'http://ddragon.leagueoflegends.com/cdn/11.16.1/img/'
                            + 'champion/' + user_champion_data.championName + '.png';

                        const game_Duration = moment(data.info.gameDuration).format('mm분 ss초');

                        const user_win = user_champion_data.win;

                        return (
                            <div key={index} className="MatchWrap" id={user_win ? 'Match_true' : 'Match_false'}>
                                <div className="MyWrap">
                                    <div className="MyChampionInfo">
                                        <div className="MyChampionImage">
                                            <img src={user_Champion_img} />
                                        </div>
                                    </div>
                                    <div>
                                        {user_champion_data.championName}
                                    </div>
                                </div>
                                <div className="MatchStatWrap">
                                    <div>
                                        {user_win ? '승리' : '패배'}
                                    </div>
                                    <div>
                                        {game_Duration}
                                    </div>
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
                {true || <div>false</div>}
            </div>
        </>
    )
}

export default Search;