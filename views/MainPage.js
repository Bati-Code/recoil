import React from 'react'

import Search from './Search'
import './css/MainPageCSS.css'

const MainPage = () => {

    return (
        <>
            <div className="board_wrap">
                <div className="board_Header">
                    Observer.GG
                </div>
                <div className="container">
                    <section className="board_content">
                        <nav>
                        </nav>
                        <main>
                            <Search></Search>
                        </main>
                        <aside>
                        </aside>
                    </section>
                </div>
                <div className="Board_footer">
                    <div>
                    </div>
                    <div>
                    </div>

                </div>
            </div>
        </>
    )

}
export default MainPage;