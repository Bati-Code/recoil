import React from 'react'

const Tooltip = (props) => {

    return (
        <>
            <div className="custom_tooltip_container" id="tooltip">
                <div className="custom_tooltip" dangerouslySetInnerHTML={{__html: props.message}} >
                </div>
                {props.children}
            </div>
        </>
    )
}

export default Tooltip;