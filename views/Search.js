import axios from 'axios'
import React, { useEffect, useState } from 'react'
import moment from 'moment';

import './css/searchCSS.css';
import './css/Main.less';
import Search_Data from './Search_Data';
import { Input, Spin } from 'antd';
import { Server_Config } from '../public/config/config.js'

const Search_User = () => {

    const [getSummonerName, setSummonerName] = useState('');
    const [getSummonerBasicData, setSummonerBasicData] = useState({});
    const [getSummonerIconURL, setSummonerIconURL] =
        useState('http://ddragon.leagueoflegends.com/' +
            'cdn/11.16.1/img/profileicon/0.png');
    const [getSummonerRankData, setSummonerRankData] = useState({});
    const [get_Search_Loading, set_Search_Loading] = useState(false);

    const [get_Search_status, set_Search_status] = useState(false);
    const { Search } = Input;

    useEffect(() => {

        console.log(Server_Config.SERVER_ADDRESS);
    }, [])


    const getSummonerBasicData_Handler = ({ userName: userName }) => {

        set_Search_status(true);
        set_Search_Loading(true);

        axios.post(Server_Config.SERVER_ADDRESS + '/search',
            {
                summonerName: userName ? userName : getSummonerName
            })
            .then((response) => {
                const Sorted_Match_List = response.data.Summoner_Match_Data.sort((a, b) => b.info.gameId - a.info.gameId)
                console.log(response.data);
                // setSummonerName('');
                const icon_url = 'http://ddragon.leagueoflegends.com/cdn/11.23.1/img/profileicon/'
                    + response.data.Summoner_Basic_Data.profileIconId + '.png'

                const find_Solo_Rank_Index = response.data.Summoner_Rank_Data.findIndex(
                    (element) => element.queueType === "RANKED_SOLO_5x5"
                );
                setSummonerBasicData(response.data);
                setSummonerIconURL(icon_url);
                setSummonerRankData(response.data.Summoner_Rank_Data[find_Solo_Rank_Index]);

                set_Search_Loading(false);
            })
    }

    const inputHandler = (e) => {
        setSummonerName(e.target.value);
    }

    return (
        <>
            <div className="search_wrap width100">
                <Search
                    placeholder="소환사 검색" allowClear
                    enterButton="검색"
                    size="large"
                    value={getSummonerName}
                    onChange={inputHandler}
                    onSearch={getSummonerBasicData_Handler}
                />
                {/* <input type="text" onChange={inputHandler} value={getSummonerName}></input>
                <button onClick={getSummonerBasicData_Handler}>클릭</button> */}
            </div>
            {
                get_Search_status &&
                <div>
                    <Search_Data
                        SummonerBasicData={getSummonerBasicData}
                        SummonerIconURL={getSummonerIconURL}
                        SummonerRankData={getSummonerRankData}
                        loading={get_Search_Loading}
                        setSummonerName={setSummonerName}
                        searchHandler={getSummonerBasicData_Handler}
                    />
                </div>
            }
        </>
    )
}

export default Search_User;